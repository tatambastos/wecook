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
    const myArray =  req.body;
       
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

router.post('/query', function (req,res) {
    // Almacenar un array en la sesión
    const myArray = req.body;
       
    console.log(myArray.id)
    var searchTerms = myArray.id;
    var recipe = "SELECT * FROM recipe where id = " + searchTerms;
    var sqlQuery = "SELECT i.name, ri.amount FROM ingredients i " +
         "inner join recipe_ingredients ri ON i.id = ri.idingredients " +
         "inner join recipe r on r.id = ri.idrecipe " +
         "WHERE r.id = "+ searchTerms+" ";
    
     pool.query(sqlQuery, (err, result) => {
         if (err) {
             console.error(err);
             res.status(500).send('Error en la consulta');
            return;
         }
         pool.query(recipe, (err2, result2) => {
             if (err2) {
                 console.error(err2);
                 res.status(500).send('Error en la consulta');
                 return;
             }
             res.send({ ingredients: result.rows, recipe: result2.rows[0] });
         });
     });
});





module.exports = router;