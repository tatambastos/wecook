const {Pool} = require('pg');
const { json } = require('express');
const fetch = require('node-fetch');
const express = require ('express');
const fs = require('fs');

const app = express();

app.get('/',(req,res) =>{
    res.send('la conexion es correcta')
})

app.get('/search',(req,res) =>{
    res.send('la conexion es correcta')
})

app.get('/recipe',(req,res) =>{
    res.send('la conexion es correcta')
})

app.get('/user',(req,res) =>{
    res.send('la conexion es correcta')
})
app.get('/admin',(req,res) =>{
    res.send('la conexion es correcta')
})