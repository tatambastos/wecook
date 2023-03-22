const { Router } = require('express');
const express = require('express');
const { Pool } = require('pg');
const router = Router();
const axios = require('axios');

const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database: 'cookwe',
    port: '5434'
}

const pool = new Pool(config);

const getIngredients = async () => {

    const res = await pool.query('select name from ingredients');

    return res;
}

getIngredients();

global.myArray = [];

router.get("/home", (req, res) => {
    
    pool.query('SELECT name FROM ingredients', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        // res.send(result.rows);
        res.render('index', { usuarios: result.rows });
    });
});

router.get('/search/query', (req, res) => {
    console.log(myArray)
    var searchTerms = myArray;
    var sqlQuery = "SELECT * FROM recipe r " +
        "INNER JOIN recipe_ingredients ri ON r.id = ri.idrecipe " +
        "INNER JOIN ingredients i ON i.id = ri.idingredients " +
        "WHERE 1=0 ";
    for (var i = 0; i < searchTerms.length; i++) {
        sqlQuery += "OR i.name LIKE '%" + searchTerms[i] + "%' ";
    }
    pool.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        // res.send(result.rows);
        res.send({ recipes: result.rows });
    });

})

router.get('/search', function (req, res) {
    pool.query('SELECT name FROM ingredients', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        // res.send(result.rows);
        res.render('search', { usuarios: result.rows });
    });
});



router.get('/add', function (req, res) {
    // Almacenar un array en la sesión
    const myArray = ["pollo", "tomate", "cebolla", "azúcar", "ollo"];
    req.session.myArray = JSON.stringify(myArray);

    // Recuperar un array de la sesión
    const myArraySession = JSON.parse(req.session.myArray);
    console.log(myArraySession); // ['valor1', 'valor2', 'valor3']
    global.myArray = myArraySession;
});



module.exports = router;