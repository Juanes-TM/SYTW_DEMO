//test/admin.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');

// Aumentar timeout global para Jest
jest.setTimeout(30000);

describe('Admin Routes', () => {
  let adminToken;
  let userToken;
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Crear usuario admin para testing
    testAdmin = await createTestUser({
      nombre: 'Admin',
      apellido: 'Test',
      email: 'admin@test.com',
      password: 'password123',
      rol: 'admin',
      telephone: '123456789'
    });

    // Crear usuario normal para testing
    testUser = await createTestUser({
      nombre: 'Usuario',
      apellido: 'Test',
      email: 'usuario@test.com',
      password: 'password123',
      rol: 'cliente',
      telephone: '987654321'
    });
    adminToken = await getAuthToken('admin@test.com', 'password123');
    userToken = await getAuthToken('usuario@test.com', 'password123');
  });

  describe('GET /api/admin/users', () => {
    it('deberia listar todos los usuarios para admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    it('deberia denegar acceso a no administradores', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    it('deberia cambiar el rol de un usuario', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rol: 'fisioterapeuta' })
        .expect(200);

      expect(response.body.msg).toBe('Rol actualizado correctamente');
      expect(response.body.user.rol).toBe('fisioterapeuta');
    });

    it('deberia limpiar especialidad al cambiar de fisio a otro rol', async () => {
      // Primero hacerlo fisio con especialidad
      await User.findByIdAndUpdate(testUser._id, {
        rol: 'fisioterapeuta',
        especialidad: 'Traumatologia'
      });

      const response = await request(app)
        .put(`/api/admin/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rol: 'cliente' })
        .expect(200);

      expect(response.body.user.rol).toBe('cliente');
      expect(response.body.user.especialidad).toBeNull();
    });

    it('deberia rechazar rol no valido', async () => {
      await request(app)
        .put(`/api/admin/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rol: 'rol_invalido' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('deberia actualizar datos de usuario incluyendo especialidad', async () => {
      const updateData = {
        nombre: 'Usuario Actualizado',
        apellido: 'Test',
        email: 'actualizado@test.com',
        telephone: '123456789',
        especialidad: 'Deportiva'
      };

      const response = await request(app)
        .put(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.msg).toBe('Usuario actualizado correctamente');
      expect(response.body.user.nombre).toBe(updateData.nombre);
      expect(response.body.user.especialidad).toBe(updateData.especialidad);
    });

    it('deberia validar formato de email y telefono', async () => {
      const invalidData = {
        email: 'email-invalido',
        telephone: '123'
      };

      await request(app)
        .put(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    let userToDelete;

    beforeEach(async () => {
      userToDelete = await createTestUser({
        nombre: 'Para',
        apellido: 'Eliminar',
        email: 'eliminar@test.com',
        password: 'password123',
        rol: 'cliente',
        telephone: '123456789'
      });
    });

    it('deberia eliminar un usuario', async () => {
      await request(app)
        .delete(`/api/admin/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que el usuario fue eliminado
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('GET /api/admin/stats', () => {
    it('deberia retornar estadisticas del sistema', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsuarios');
      expect(response.body).toHaveProperty('totalAdmins');
      expect(response.body).toHaveProperty('totalFisio');
      expect(response.body).toHaveProperty('totalClientes');
    });
  });

  describe('GET /api/admin/eventos-recientes', () => {
    it('deberia retornar eventos recientes', async () => {
      const response = await request(app)
        .get('/api/admin/eventos-recientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });
});