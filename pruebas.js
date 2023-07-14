const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Hola desde Express!');
});

app.post('/data', (req, res) => {
  const data = req.body;
  console.log('Datos recibidos:', data);
  res.send('Datos recibidos en el servidor');
});

app.listen(port, () => {
  console.log(`Servidor Express funcionando en http://localhost:${port}`);
});