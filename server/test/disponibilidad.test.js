// test/disponibilidad.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');

// 1. Importamos tu utilidad de Base de Datos en Memoria
const db = require('./utils/testDb');

// 2. Importamos la app (que ya no se conecta sola gracias al fix de server.js)
const app = require('../server');

// 3. Modelos
const User = require('../models/user');
const Cita = require('../models/cita');
const DisponibilidadSemanal = require('../models/disponibilidadSemanal');
const DisponibilidadDia = require('../models/disponibilidadDia');

// --- CONFIGURACIÓN DEL TOKEN (Lectura del secreto real) ---
const configPath = '/home/usuario/backend_config.json';
let JWT_SECRET;
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  JWT_SECRET = config.JWT_SECRET;
} catch (e) {
  JWT_SECRET = 'fallback_secret'; 
}

// --- CICLO DE VIDA DEL TEST (Usando tu utils/testDb.js) ---

// Conectar a memoria antes de empezar
beforeAll(async () => await db.connect());

// Limpiar datos después de cada test individual
beforeEach(async () => await db.clearDatabase());

// Cerrar conexión y apagar servidor de memoria al terminar todo
afterAll(async () => await db.closeDatabase());

// --- HELPER TOKEN ---
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, rol: role }, JWT_SECRET, { expiresIn: '1h' });
};

// --- SUITE DE PRUEBAS ---
describe('Módulo de Disponibilidad', () => {
  let fisioUser, pacienteUser;
  let fisioToken, pacienteToken;

  // Crear usuarios frescos para cada test
  beforeEach(async () => {
    fisioUser = await User.create({
      nombre: 'Fisio', apellido: 'Test', email: 'fisio@test.com',
      password: '123', telephone: '111', rol: 'fisioterapeuta'
    });
    
    pacienteUser = await User.create({
      nombre: 'Paciente', apellido: 'Test', email: 'paciente@test.com',
      password: '123', telephone: '222', rol: 'cliente'
    });

    fisioToken = generateToken(fisioUser._id, 'fisioterapeuta');
    pacienteToken = generateToken(pacienteUser._id, 'cliente');
  });

  // ==============================================
  // 1. TEST: DISPONIBILIDAD SEMANAL
  // ==============================================
test('Fisioterapeuta guarda horario semanal correctamente', async () => {
      const diasPayload = [
        { nombre: 'lunes', horas: [{ inicio: '09:00', fin: '14:00' }] },
        { nombre: 'miercoles', horas: [{ inicio: '16:00', fin: '20:00' }] }
      ];

      const res = await request(app)
        .put('/api/disponibilidad/semana')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({ dias: diasPayload });

      expect(res.statusCode).toBe(200);
      expect(res.body.disponibilidad.dias).toHaveLength(7);

      // Verificamos que los días que enviamos se guardaron bien
      const lunes = res.body.disponibilidad.dias.find(d => d.nombre === 'lunes');
      expect(lunes.horas[0].inicio).toBe('09:00');

      const miercoles = res.body.disponibilidad.dias.find(d => d.nombre === 'miercoles');
      expect(miercoles.horas[0].inicio).toBe('16:00');
      
      // Verificación en BD
      const guardado = await DisponibilidadSemanal.findOne({ fisio: fisioUser._id });
      expect(guardado).toBeTruthy();
      expect(guardado.dias).toHaveLength(7);
    });

  // ==============================================
  // 2. TEST: EXCEPCIONES POR DÍA
  // ==============================================
  describe('POST /api/disponibilidad/dia', () => {
    test('Fisio cierra un día específico (ej. Navidad)', async () => {
      const fecha = '2025-12-25';

      const res = await request(app)
        .post('/api/disponibilidad/dia')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({
          fecha: fecha,
          cerrado: true,
          horas: []
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.disponibilidadDia.cerrado).toBe(true);
    });
  });

  // ==============================================
  // 3. TEST: CÁLCULO DE INTERVALOS LIBRES
  // ==============================================
  describe('GET /api/disponibilidad/intervalos', () => {
    test('Debe omitir huecos ocupados por citas', async () => {
      // 1. Configurar horario: Lunes 09:00 a 12:00
      await DisponibilidadSemanal.create({
        fisio: fisioUser._id,
        dias: [{ nombre: 'lunes', horas: [{ inicio: '09:00', fin: '12:00' }] }]
      });

      const fechaLunes = '2025-11-10'; // Un lunes

      // 2. Crear cita ocupando de 10:00 a 11:00
      const start = new Date('2025-11-10T10:00:00Z');
      const end = new Date('2025-11-10T11:00:00Z');

      await Cita.create({
        paciente: pacienteUser._id,
        fisioterapeuta: fisioUser._id,
        startAt: start,
        endAt: end,
        durationMinutes: 60,
        motivo: 'Ocupado',
        createdBy: { user: pacienteUser._id, role: 'cliente' }
      });

      // 3. Solicitar huecos de 60 min
      const res = await request(app)
        .get('/api/disponibilidad/intervalos')
        .query({ fisioId: fisioUser._id.toString(), fecha: fechaLunes, duracion: 60 })
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(res.statusCode).toBe(200);
      const huecos = res.body.intervalosLibres;

      // Esperamos ver 09:00 y 11:00, pero NO 10:00
      const inicios = huecos.map(h => h.inicio);
      expect(inicios).toContain('09:00');
      expect(inicios).not.toContain('10:00');
      expect(inicios).toContain('11:00');
    });
  });
});
