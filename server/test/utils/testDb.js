const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user');

let mongoServer;

module.exports.connect = async () => {
  try {
    // Si ya está conectado, no hacer nada
    if (mongoose.connection.readyState !== 0) {
      return;
    }
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // CONEXIÓN SIMPLIFICADA - sin opciones deprecated
    await mongoose.connect(uri);
    
  } catch (error) {
    throw error;
  }
};

module.exports.closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    throw error;
  }
};

module.exports.clearDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    }
  } catch (error) {
    throw error;
  }
};

// Funciones auxiliares para tests
module.exports.createTestUser = async (userData) => {
  const bcrypt = require('bcryptjs');
  
  // Hashear la contraseña si se proporciona
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  
  return await User.create(userData);
};

module.exports.getAuthToken = async (email, password) => {
  const response = await request(app)
    .post('/api/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body.msg}`);
  }
  
  return response.body.token;
};