// Dependencias
const { Pool } = require('pg'); // Dependencia para interactuar con PostgreSQL
const { json } = require('express'); // Middleware para analizar el cuerpo de solicitudes en formato JSON
const fetch = require('node-fetch'); // Dependencia para realizar solicitudes HTTP
const express = require('express'); // Framework web para Node.js
const fs = require('fs'); // Módulo de sistema de archivos de Node.js
const session = require('express-session'); // Middleware de sesión para Express
const path = require('path'); // Módulo de rutas de archivos y directorios de Node.js
require('ejs'); // Dependencia para el motor de plantillas EJS

const app = express(); // Crear una instancia de la aplicación Express

app.use(session({
    secret: '2C44-4D44-WppQ38S', // Clave secreta utilizada para firmar y cifrar las cookies de sesión
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Configuración de la cookie de sesión
}));

app.set('view engine', 'ejs'); // Configurar el motor de plantillas EJS para las vistas

app.set('views', path.join(__dirname, 'views')); // Establecer la ubicación de las vistas

const UserRoutes = require('./routes/users'); // Importar las rutas relacionadas con los usuarios
const HomeRoutes = require('./routes/home'); // Importar las rutas relacionadas con la página principal

app.use(express.static(path.join(__dirname, 'public'))); // Configurar la carpeta "public" como estática para servir archivos estáticos

app.use(express.static(path.join(__dirname, 'routes'))); // Configurar la carpeta "routes" como estática (Nota: Esto puede no ser necesario, ya que generalmente se utilizan para las rutas)

app.use(HomeRoutes); // Utilizar las rutas relacionadas con la página principal
app.use(UserRoutes); // Utilizar las rutas relacionadas con los usuarios

app.get('/', function (req, res) {
    res.send(); // Enviar una respuesta vacía para la ruta principal
});

app.listen(3000); // Iniciar el servidor en el puerto 3000
console.log('server is online'); // Imprimir un mensaje en la consola indicando que el servidor está en línea
