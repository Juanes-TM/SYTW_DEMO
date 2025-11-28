// server/t-e2e/setup-ci.js
const { execSync } = require('child_process');

console.log('🔧 Configurando entorno para tests E2E...');

try {
  // Instalar Firefox en el entorno CI
  execSync('sudo apt-get update && sudo apt-get install -y firefox-esr', { stdio: 'inherit' });
} catch (error) {
  console.log('Error instalando Firefox:', error.message);
}