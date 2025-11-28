// test/citas.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken'); 
const fs = require('fs');
const app = require('../server'); // Al importar esto, gracias al cambio en server.js, NO se conecta a la real
const Cita = require('../models/cita'); 
const User = require('../models/user'); 

// LEER LA CONFIGURACIÓN REAL (Solo para obtener el JWT_SECRET correcto)
const configPath = './backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const JWT_SECRET = config.JWT_SECRET;

let mongoServer;

// Configuración del entorno VOLÁTIL (En memoria)
beforeAll(async () => {
  // 1. Crear servidor Mongo en memoria RAM
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // 2. Conectar Mongoose a esa memoria RAM (NO a tu disco duro)
  // Si server.js se hubiera conectado antes, esto fallaría o se ignoraría.
  // Con el fix de server.js, esta es la PRIMERA y ÚNICA conexión.
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Esto borra los datos PERO SOLO de la memoria RAM
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Helper para crear token válido
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, rol: role }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Rutas de Citas', () => {
  let pacienteUser;
  let fisioUser;
  let pacienteToken;
  let fisioToken;

  beforeEach(async () => {
    // Crear usuarios FALSOS en memoria
    pacienteUser = await User.create({
      nombre: 'Paciente', apellido: 'Test', email: 'paciente@test.com',
      password: '123', telephone: '111', rol: 'cliente'
    });

    fisioUser = await User.create({
      nombre: 'Fisio', apellido: 'Test', email: 'fisio@test.com',
      password: '123', telephone: '222', rol: 'fisioterapeuta'
    });

    pacienteToken = generateToken(pacienteUser._id, 'cliente');
    fisioToken = generateToken(fisioUser._id, 'fisioterapeuta');
  });

  test('Crear cita correctamente', async () => {
    const start = new Date();
    start.setHours(start.getHours() + 24);

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${pacienteToken}`)
      .send({
        fisioterapeutaId: fisioUser._id,
        startAt: start.toISOString(),
        durationMinutes: 60,
        motivo: 'Test seguro',
        observaciones: 'Sin tocar base real'
      });

    expect(res.statusCode).toBe(201);
  });

  test('Detectar solapamiento', async () => {
    const start = new Date();
    start.setHours(start.getHours() + 48);
    const end = new Date(start.getTime() + 60*60000);

    await Cita.create({
      paciente: pacienteUser._id, fisioterapeuta: fisioUser._id,
      startAt: start, endAt: end, durationMinutes: 60,
      motivo: 'Ocupado', createdBy: { user: pacienteUser._id, role: 'cliente' }
    });

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${pacienteToken}`)
      .send({
        fisioterapeutaId: fisioUser._id,
        startAt: start.toISOString(),
        durationMinutes: 60,
        motivo: 'Intento solapado'
      });

    expect(res.statusCode).toBe(409);
  });
});
