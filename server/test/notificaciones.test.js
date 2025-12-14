const request = require('supertest');
const app = require('./utils/testServer');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');
const Notificacion = require('../models/notificacion');

jest.setTimeout(30000);

describe('Notificaciones Routes', () => {
  let userToken;
  let userId;

  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());
  
  beforeEach(async () => {
    await clearDatabase();
    const user = await createTestUser({
      nombre: 'User', apellido: 'Notif', email: 'user@notif.com',
      password: '123', rol: 'cliente', telephone: '000000000'
    });
    userId = user._id;
    userToken = await getAuthToken('user@notif.com', '123');
  });

  describe('GET /api/notificaciones', () => {
    it('debería traer las notificaciones (máximo 10)', async () => {
      // Crear 15 notificaciones
      const notifs = [];
      for(let i = 0; i < 15; i++) {
        notifs.push({
          usuario: userId,
          mensaje: `Notificacion ${i}`,
          fecha: new Date(Date.now() + i * 1000) // Fechas diferentes
        });
      }
      await Notificacion.insertMany(notifs);

      const res = await request(app)
        .get('/api/notificaciones')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.length).toBe(10); // Límite del backend
      // Verificar orden (la última creada debe ser la primera)
      expect(res.body[0].mensaje).toBe('Notificacion 14');
    });
  });

  describe('PUT /api/notificaciones/:id/leer', () => {
    it('debería marcar una notificación como leída', async () => {
      const notif = await Notificacion.create({
        usuario: userId, mensaje: 'Hola', leida: false
      });

      await request(app)
        .put(`/api/notificaciones/${notif._id}/leer`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const check = await Notificacion.findById(notif._id);
      expect(check.leida).toBe(true);
    });
  });

  describe('PUT /api/notificaciones/leer-todas', () => {
    it('debería marcar todas las notificaciones como leídas', async () => {
      await Notificacion.create([
        { usuario: userId, mensaje: '1', leida: false },
        { usuario: userId, mensaje: '2', leida: false },
        { usuario: userId, mensaje: '3', leida: true }
      ]);

      await request(app)
        .put('/api/notificaciones/leer-todas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const unread = await Notificacion.find({ usuario: userId, leida: false });
      expect(unread.length).toBe(0);
    });
  });
});