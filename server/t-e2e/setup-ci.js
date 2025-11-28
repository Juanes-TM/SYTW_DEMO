// server/t-e2e/setup-ci.js
const { startServer } = require('../server');

module.exports = async () => {
  console.log('🚀 Iniciando servidor para tests E2E...');
  await startServer();
  console.log('✅ Servidor listo para tests E2E');
};