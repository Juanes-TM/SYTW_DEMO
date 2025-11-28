//test/valoraciones.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const Cita = require('../models/cita');
const Valoracion = require('../models/valoraciones');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');

jest.setTimeout(30000);

describe('Valoraciones Routes', () => {
  let clienteToken;
  let fisioToken;
  let adminToken;
  let cliente;
  let fisio;
  let citaCompletada;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Crear usuarios de prueba
    cliente = await createTestUser({
      nombre: 'Cliente',
      apellido: 'Valorador',
      email: 'cliente@valoraciones.com',
      password: 'password123',
      rol: 'cliente',
      telephone: '111111111'
    });

    fisio = await createTestUser({
      nombre: 'Fisio',
      apellido: 'Valorado',
      email: 'fisio@valoraciones.com',
      password: 'password123',
      rol: 'fisioterapeuta',
      especialidad: 'Traumatologia',
      telephone: '222222222'
    });

    const admin = await createTestUser({
      nombre: 'Admin',
      apellido: 'Test',
      email: 'admin@valoraciones.com',
      password: 'password123',
      rol: 'admin',
      telephone: '333333333'
    });

    clienteToken = await getAuthToken('cliente@valoraciones.com', 'password123');
    fisioToken = await getAuthToken('fisio@valoraciones.com', 'password123');
    adminToken = await getAuthToken('admin@valoraciones.com', 'password123');

    // Crear cita completada para permitir valoración
    citaCompletada = await Cita.create({
      paciente: cliente._id,
      fisioterapeuta: fisio._id,
      startAt: new Date(Date.now() - 86400000), // Ayer
      endAt: new Date(Date.now() - 86340000),
      durationMinutes: 60,
      motivo: 'Consulta de prueba',
      estado: 'completada',
      createdBy: { user: cliente._id, role: 'cliente' }
    });
  });

  describe('POST /api/valoraciones/crear', () => {
    it('deberia crear una valoracion exitosamente', async () => {
      const valoracionData = {
        fisioId: fisio._id,
        puntuacion: 5,
        comentario: 'Excelente servicio, muy profesional',
        especialidad: 'Traumatologia'
      };

      const response = await request(app)
        .post('/api/valoraciones/crear')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(valoracionData)
        .expect(201);

      expect(response.body.msg).toBe('Valoración creada exitosamente');
      expect(response.body.valoracion.puntuacion).toBe(5);
      expect(response.body.valoracion.comentario).toBe('Excelente servicio, muy profesional');
    });

    it('deberia rechazar valoracion sin cita completada', async () => {
      // Crear otro fisio sin cita completada
      const otroFisio = await createTestUser({
        nombre: 'Otro',
        apellido: 'Fisio',
        email: 'otrofisio@test.com',
        password: 'password123',
        rol: 'fisioterapeuta',
        telephone: '444444444'
      });

      const valoracionData = {
        fisioId: otroFisio._id,
        puntuacion: 4,
        comentario: 'Buena atencion',
        especialidad: 'Deportiva'
      };

      await request(app)
        .post('/api/valoraciones/crear')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(valoracionData)
        .expect(403);
    });

    it('deberia rechazar valoracion duplicada', async () => {
      // Primero crear una valoracion
      await Valoracion.create({
        fisio: fisio._id,
        paciente: cliente._id,
        puntuacion: 4,
        comentario: 'Primera valoracion',
        especialidad: 'Traumatologia'
      });

      const valoracionData = {
        fisioId: fisio._id,
        puntuacion: 4,
        comentario: 'Segunda valoracion',
        especialidad: 'Traumatologia'
      };

      await request(app)
        .post('/api/valoraciones/crear')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(valoracionData)
        .expect(400);
    });

    it('deberia rechazar valoracion de no cliente', async () => {
      const valoracionData = {
        fisioId: fisio._id,
        puntuacion: 5,
        comentario: 'Comentario',
        especialidad: 'Traumatologia'
      };

      await request(app)
        .post('/api/valoraciones/crear')
        .set('Authorization', `Bearer ${fisioToken}`)
        .send(valoracionData)
        .expect(403);
    });
  });

  describe('GET /api/valoraciones/fisio/:id', () => {
    it('deberia listar valoraciones de un fisioterapeuta', async () => {
      // Crear una valoracion primero
      await Valoracion.create({
        fisio: fisio._id,
        paciente: cliente._id,
        puntuacion: 5,
        comentario: 'Test valoracion',
        especialidad: 'Traumatologia'
      });

      const response = await request(app)
        .get(`/api/valoraciones/fisio/${fisio._id}`)
        .expect(200);

      expect(response.body.valoraciones).toBeInstanceOf(Array);
      expect(response.body.valoraciones.length).toBe(1);
    });
  });

  describe('GET /api/valoraciones/especialidad/:esp', () => {
    it('deberia listar valoraciones por especialidad', async () => {
      // Crear una valoracion primero
      await Valoracion.create({
        fisio: fisio._id,
        paciente: cliente._id,
        puntuacion: 5,
        comentario: 'Test valoracion',
        especialidad: 'Traumatologia'
      });

      const response = await request(app)
        .get('/api/valoraciones/especialidad/Traumatologia')
        .expect(200);

      expect(response.body.valoraciones).toBeInstanceOf(Array);
      expect(response.body.valoraciones.length).toBe(1);
    });
  });

  describe('GET /api/valoraciones/mis-valoraciones', () => {
    it('deberia listar valoraciones del fisioterapeuta logueado', async () => {
      // Crear una valoracion para el fisio
      await Valoracion.create({
        fisio: fisio._id,
        paciente: cliente._id,
        puntuacion: 5,
        comentario: 'Test valoracion',
        especialidad: 'Traumatologia'
      });

      const response = await request(app)
        .get('/api/valoraciones/mis-valoraciones')
        .set('Authorization', `Bearer ${fisioToken}`)
        .expect(200);

      expect(response.body.valoraciones).toBeInstanceOf(Array);
      expect(response.body.valoraciones.length).toBe(1);
    });

    it('deberia rechazar acceso a no fisioterapeutas', async () => {
      await request(app)
        .get('/api/valoraciones/mis-valoraciones')
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(403);
    });
  });
});