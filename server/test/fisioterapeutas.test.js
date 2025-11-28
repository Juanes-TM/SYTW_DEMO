//test/fisioterapeutas.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');

jest.setTimeout(30000);

describe('Fisioterapeutas Routes', () => {
  let userToken;
  let fisio1, fisio2;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Crear fisioterapeutas de prueba
    fisio1 = await createTestUser({
      nombre: 'Fisio1',
      apellido: 'Uno',
      email: 'fisio1@test.com',
      password: 'password123',
      rol: 'fisioterapeuta',
      especialidad: 'Traumatologia',
      telephone: '111111111'
    });

    fisio2 = await createTestUser({
      nombre: 'Fisio2',
      apellido: 'Dos',
      email: 'fisio2@test.com',
      password: 'password123',
      rol: 'fisioterapeuta',
      especialidad: 'Deportiva',
      telephone: '222222222'
    });

    // Crear usuario normal
    await createTestUser({
      nombre: 'Usuario',
      apellido: 'Normal',
      email: 'usuario@test.com',
      password: 'password123',
      rol: 'cliente',
      telephone: '333333333'
    });

    userToken = await getAuthToken('usuario@test.com', 'password123');
  });

  describe('GET /api/fisioterapeutas', () => {
    it('deberia listar todos los fisioterapeutas', async () => {
      const response = await request(app)
        .get('/api/fisioterapeutas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      
      // Verificar que solo se incluyen fisioterapeutas
      response.body.forEach(fisio => {
        expect(fisio).toHaveProperty('especialidad');
        expect(fisio).toHaveProperty('nombre');
        expect(fisio).toHaveProperty('apellido');
        expect(fisio).toHaveProperty('email');
      });
    });

    it('deberia incluir la especialidad en la respuesta', async () => {
      const response = await request(app)
        .get('/api/fisioterapeutas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const fisioTrauma = response.body.find(f => f.especialidad === 'Traumatologia');
      expect(fisioTrauma).toBeDefined();
      expect(fisioTrauma.nombre).toBe('Fisio1');
    });

    it('deberia rechazar acceso sin autenticacion', async () => {
      await request(app)
        .get('/api/fisioterapeutas')
        .expect(401);
    });
  });
});