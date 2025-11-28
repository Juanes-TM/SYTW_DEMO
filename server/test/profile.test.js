const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');

// AÑADIR ESTA LÍNEA - Timeout global para Jest
jest.setTimeout(30000);

describe('Profile Routes', () => {
  let userToken;
  let testUser;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {

    await clearDatabase();

    testUser = await createTestUser({
      nombre: 'Usuario',
      apellido: 'Profile',
      email: 'profile@test.com',
      password: 'password123',
      rol: 'cliente',
      telephone: '123456789'
    });

    userToken = await getAuthToken('profile@test.com', 'password123');
  });

  describe('GET /api/profile', () => {
    it('deberia obtener el perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe('profile@test.com');
      expect(response.body.user.nombre).toBe('Usuario');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deberia rechazar acceso sin token', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });
  });

  describe('PUT /api/profile/update', () => {
    it('deberia actualizar el perfil del usuario', async () => {
      const updateData = {
        nombre: 'Usuario Actualizado',
        apellido: 'Profile Modificado',
        telephone: '987654321'
      };

      const response = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.nombre).toBe(updateData.nombre);
      expect(response.body.user.apellido).toBe(updateData.apellido);
      expect(response.body.user.telephone).toBe(updateData.telephone);
    });

    it('deberia mantener el email original', async () => {
      const updateData = {
        nombre: 'Test',
        email: 'nuevoemail@test.com' // No debería cambiar
      };

      const response = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      // El email no debería cambiar en la actualización de perfil
      expect(response.body.user.email).toBe('profile@test.com');
    });
  });
});