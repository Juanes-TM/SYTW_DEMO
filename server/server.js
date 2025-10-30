const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Leer config externa (fuera del repo Git)
const configPath = '/home/usuario/backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const CLIENT_URL = config.CLIENT_URL;

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${CLIENT_URL}/`);
    res.send(response.data);
  } catch (error) {
    console.error('Error al obtener el HTML del cliente:', error.message);
    res.status(500).send('Error al cargar la interfaz del cliente');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor BACKEND escuchando en puerto ${PORT}`);
});

