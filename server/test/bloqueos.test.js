const request = require('supertest');
const app = require('./utils/testServer');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');
const Cita = require('../models/cita');
const Notificacion = require('../models/notificacion');
const Bloqueo = require('../models/bloqueo');

jest.setTimeout(30000);

describe('Bloqueos Routes', () => {
  let fisioToken, pacienteToken;
  let fisioUser, pacienteUser;

  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  
  beforeEach(async () => {
    await clearDatabase();

    // 1. Crear Fisio
    fisioUser = await createTestUser({
      nombre: 'Fisio', apellido: 'Test', email: 'fisio@test.com',
      password: '123', rol: 'fisioterapeuta', telephone: '123456789'
    });
    fisioToken = await getAuthToken('fisio@test.com', '123');

    // 2. Crear Paciente (para probar cancelaciones)
    pacienteUser = await createTestUser({
      nombre: 'Paciente', apellido: 'Test', email: 'paciente@test.com',
      password: '123', rol: 'cliente', telephone: '987654321'
    });
    pacienteToken = await getAuthToken('paciente@test.com', '123');
  });

  describe('POST /api/bloqueos', () => {
    it('debería crear un bloqueo de día completo', async () => {
      const fecha = '2025-12-25';

      const res = await request(app)
        .post('/api/bloqueos')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({ fecha, motivo: 'Navidad' })
        .expect(201);

      expect(res.body.msg).toBe('Día bloqueado correctamente');
      
      // Verificar en DB
      const bloqueoDb = await Bloqueo.findOne({ fisioterapeuta: fisioUser._id });
      expect(bloqueoDb).toBeTruthy();
      expect(bloqueoDb.motivo).toBe('Navidad');
    });

    it('debería fallar si ya existe un bloqueo ese día', async () => {
      const fecha = '2025-12-25';
      
      // Primer bloqueo
      await request(app).post('/api/bloqueos')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({ fecha, motivo: 'Vacaciones' });

      // Segundo bloqueo (intento)
      const res = await request(app).post('/api/bloqueos')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({ fecha, motivo: 'Otro motivo' })
        .expect(400);

      expect(res.body.msg).toContain('Ya tienes un bloqueo');
    });

    it('CRÍTICO: debería cancelar citas existentes y notificar al paciente', async () => {
      const fechaCita = '2025-10-10'; // Fecha en string YYYY-MM-DD
      const startAtCita = new Date(`${fechaCita}T10:00:00.000Z`); // 10:00 AM

      // 1. Crear una Cita Confirmada para ese día
      // CORRECCIÓN AQUÍ: Se añadieron los campos obligatorios (motivo, durationMinutes, createdBy)
      const cita = await Cita.create({
        fisioterapeuta: fisioUser._id,
        paciente: pacienteUser._id,
        startAt: startAtCita,
        endAt: new Date(startAtCita.getTime() + 60 * 60 * 1000), // 1 hora
        estado: 'confirmada',
        motivo: 'Dolor de espalda (Test)', // Campo obligatorio
        durationMinutes: 60,               // Campo obligatorio
        createdBy: {                       // Campo obligatorio
          user: pacienteUser._id,
          role: 'cliente'
        }
      });

      // 2. Crear el Bloqueo para ese mismo día
      await request(app)
        .post('/api/bloqueos')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send({ fecha: fechaCita, motivo: 'Urgencia médica' })
        .expect(201);

      // 3. Verificar que la cita pasó a 'cancelada'
      const citaActualizada = await Cita.findById(cita._id);
      expect(citaActualizada.estado).toBe('cancelada');

      // 4. Verificar que se creó la notificación para el paciente
      const notificacion = await Notificacion.findOne({ usuario: pacienteUser._id });
      expect(notificacion).toBeTruthy();
      expect(notificacion.mensaje).toContain('ha sido cancelada');
      expect(notificacion.tipo).toBe('cancelacion');
    });
  });

  describe('GET /api/bloqueos', () => {
    it('debería listar los bloqueos del fisio', async () => {
      // Crear un bloqueo manualmente
      await Bloqueo.create({
        fisioterapeuta: fisioUser._id,
        startAt: new Date(),
        endAt: new Date(),
        motivo: 'Test'
      });

      const res = await request(app)
        .get('/api/bloqueos')
        .set('Authorization', `Bearer ${fisioToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('DELETE /api/bloqueos/:id', () => {
    it('debería eliminar un bloqueo propio', async () => {
      const bloqueo = await Bloqueo.create({
        fisioterapeuta: fisioUser._id,
        startAt: new Date(),
        endAt: new Date(),
        motivo: 'Borrar'
      });

      await request(app)
        .delete(`/api/bloqueos/${bloqueo._id}`)
        .set('Authorization', `Bearer ${fisioToken}`)
        .expect(200);

      const buscado = await Bloqueo.findById(bloqueo._id);
      expect(buscado).toBeNull();
    });
  });
});