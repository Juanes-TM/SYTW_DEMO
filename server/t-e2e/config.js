// server/t-e2e/config.js
module.exports = {
  BASE_URL: 'https://10.6.131.134', 
  
  // Timeout generoso para la MV
  TIMEOUT: 60000, 
  
  FIREFOX_OPTIONS: {
    binary: '/usr/bin/firefox-esr',
    args: [
      '--headless',             // Sin interfaz gráfica
      '--no-sandbox',           // Seguridad para root/MV
      '--disable-dev-shm-usage', // Memoria compartida
      '--width=1920',           // Resolución HD
      '--height=1080',
      '--ignore-certificate-errors' // Ignorar error de self-signed cert
    ]
  }
};