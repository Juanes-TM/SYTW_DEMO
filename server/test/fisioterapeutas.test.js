const request = require('supertest');
const app = require('./utils/testServer');
const { connect, closeDatabase, clearDatabase, createTestUser, getAuthToken } = require('./utils/testDb');

jest.setTimeout(30000);

describe('Fisioterapeutas Routes', () => {
  let userToken;

  beforeAll(async () => await connect());
  afterAll(async () => await closeDatabase());

  beforeEach(async () => {
    await clearDatabase();

    // Crear 2 fisioterapeutas
    await createTestUser({
      nombre: 'Fisio1', apellido: 'Uno', email: 'fisio1@test.com',
      password: '123', rol: 'fisioterapeuta', especialidad: 'Traumatologia', telephone: '111'
    });

    await createTestUser({
      nombre: 'Fisio2', apellido: 'Dos', email: 'fisio2@test.com',
      password: '123', rol: 'fisioterapeuta', especialidad: 'Deportiva', telephone: '222'
    });

    // Crear usuario cliente para hacer la petición
    await createTestUser({
      nombre: 'Usuario', apellido: 'Normal', email: 'user@test.com',
      password: '123', rol: 'cliente', telephone: '333'
    });

    userToken = await getAuthToken('user@test.com', '123');
  });

  describe('GET /api/fisioterapeutas', () => {
    it('debería listar todos los fisioterapeutas con campos básicos', async () => {
      const response = await request(app)
        .get('/api/fisioterapeutas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      const fisio = response.body[0];
      // Verificamos que trae los campos del .select() original
      expect(fisio).toHaveProperty('_id');
      expect(fisio).toHaveProperty('nombre');
      expect(fisio).toHaveProperty('apellido');
      expect(fisio).toHaveProperty('email');
      expect(fisio).toHaveProperty('especialidad');
      
      // NO debe tener password ni __v
      expect(fisio).not.toHaveProperty('password');
    });

    it('debería filtrar correctamente por especialidad en frontend (los datos backend deben ser correctos)', async () => {
      const response = await request(app)
        .get('/api/fisioterapeutas')
        .set('Authorization', `Bearer ${userToken}`);

      const trauma = response.body.find(f => f.especialidad === 'Traumatologia');
      expect(trauma).toBeDefined();
      expect(trauma.nombre).toBe('Fisio1');
    });

    it('debería rechazar acceso sin token', async () => {
      await request(app).get('/api/fisioterapeutas').expect(401);
    });
  });
});