const { Pool } = require('pg');
const { json } = require('express');
const fetch = require('node-fetch');
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const path = require('path')
require('ejs')

const app = express();

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))

const UserRoutes = require('./routes/users')
const HomeRoutes = require('./routes/home')

app.use(express.static(path.join(__dirname, 'public')))



app.use(express.static(path.join(__dirname, 'routes')))

app.use(HomeRoutes)
app.use(UserRoutes)


app.get('/', function (req, res) {
    res.send()
})

app.listen(3000)
console.log('server is online')