const { Router } = require('express');
const express = require('express');
const { Pool } = require('pg');
const router = Router();
const axios = require('axios');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

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
        res.render('index', { ingredients: result.rows });
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
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/register', (req, res) => {
    bcrypt.hash(req.body[1], saltRounds, (err, hash) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al encriptar la contraseña');
            return;
        }

        var query = "INSERT INTO usuarios (email, password) "
            + "VALUES ('" + req.body[0] + "', '" + hash + "');"
        pool.query(query, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error en la consulta');
                return;
            }
            res.send(result);
        });
    });
});




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



router.post('/add', function (req, res) {
    // Almacenar un array en la sesión
    const myArray = req.body;

    console.log(myArray)
    var searchTerms = myArray;
    var sqlQuery = "SELECT DISTINCT r.id, r.name, r.url, r.instructions FROM recipe r " +
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
});

router.post('/query', function (req, res) {
    const myArray = req.body;
    var searchTerms = myArray.id;

    var value_nutritional = 'SELECT v.calories, v.carbohydrate, v.protein, v.fat FROM value_nutritional v '
    +"inner join recipe r on r.id = v.idrecipe "
    + " WHERE r.id = "+searchTerms ;
    
    var recipe = "SELECT * FROM recipe where id = " + searchTerms;
    
    var sqlQuery = "SELECT i.name, ri.amount FROM ingredients i " +
        "inner join recipe_ingredients ri ON i.id = ri.idingredients " +
        "inner join recipe r on r.id = ri.idrecipe " +
        "WHERE r.id = " + searchTerms + " ";
    
    Promise.all([
        new Promise((resolve, reject) => {
            pool.query(value_nutritional, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }),
        new Promise((resolve, reject) => {
            pool.query(recipe, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }),
        new Promise((resolve, reject) => {
            pool.query(sqlQuery, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    ])
    .then(([value_nutritional, recipe, ingredients]) => {
        res.send({ value_nutritional: value_nutritional.rows[0], recipe: recipe.rows[0], ingredients: ingredients.rows });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error en la consulta');
    });
});

router.get('/paises', (req, res) => {
    var paises = "SELECT name FROM area"
    pool.query(paises, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
    
    res.send({ categories: result.rows });
    });
});
router.get('/categories', (req, res) => {
    var categories = "SELECT name FROM categories"
    pool.query(categories, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
    
    res.send({ categories: result.rows });
    });
});




module.exports = router;