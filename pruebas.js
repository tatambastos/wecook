// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Configurar body-parser para analizar solicitudes POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Manejar solicitud POST para ruta '/prueba'
app.post('/prueba', (req, res) => {
  const myArray = req.body.myArray;
  console.log(myArray); // ['1', '3']

  res.send('Datos recibidos');
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor en línea en el puerto 3000');
});