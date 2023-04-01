const { Router } = require('express');
const express = require('express');
const { Pool } = require('pg');
const router = Router();
const axios = require('axios');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const pg = require('pg');



router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database: 'cookwe',
    port: '5434'
  };
  
  const pool = new Pool(config);


router.use(passport.initialize());
router.use(passport.session());


global.myArray = [];



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

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  }));
  passport.use(new LocalStrategy({
    usernameField: 'email', // campo del formulario con el email del usuario
    passwordField: 'password', // campo del formulario con la contraseña del usuario
  },
  async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

      if (rows.length === 0) {
        return done(null, false, { message: 'El correo electrónico o la contraseña son incorrectos.' });
      }

      const user = rows[0];

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'El correo electrónico o la contraseña son incorrectos.' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  
      if (rows.length === 0) {
        return done(new Error('El usuario no existe.'));
      }
  
      const user = rows[0];
  
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  router.get("/home", (req, res) => {


    pool.query('SELECT name FROM ingredients', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        console.log("User ID:", req.session.passport.user);
        const id = req.session.passport.user;
        // res.send(result.rows);
        res.render('index', { ingredients: result.rows });
    });
});

router.post('/check', (req, res) => {
    const data = req.body;
    
    
    
    // Consultar la base de datos para encontrar al usuario por correo electrónico
    // y verificar si la contraseña proporcionada coincide con la contraseña almacenada
    const query = "SELECT * FROM usuarios WHERE email = '"+data[0]+"'";
    pool.query(query,(err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en la consulta');
        }

        if (results.length === 0) {
            return res.status(401).send('Correo electrónico o contraseña incorrecta');
        }
        console.log(results.rows);
        const hashedPassword = results.rows[0].password;
        bcrypt.compare(data[1], hashedPassword, (err, match) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al verificar la contraseña');
            }

            if (!match) {
                return res.status(401).send('Correo electrónico o contraseña incorrecta');
            }

            // Si el correo electrónico y la contraseña son correctos, enviar una respuesta exitosa
            const userID = results.rows[0].id;
            return res.redirect('/user?id=' + encodeURIComponent(userID));
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
        
        res.render('search', { usuarios: result.rows });
    });
});



router.post('/add', function (req, res) {
    // Almacenar un array en la sesión
    const myArray = req.body;

    // console.log(myArray)
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

router.post('/filter', function (req, res) {
    // Almacenar un array en la sesión
    console.log(req.body)
    const myArray = req.body.tags;

    const country =  req.body.country_id;
    const categories =  req.body.categories_id;
    console.log(myArray)
    var searchTerms = myArray;
    var sqlQuery = "SELECT DISTINCT r.id, r.name, r.url, r.instructions FROM recipe r " +
        "INNER JOIN recipe_ingredients ri ON r.id = ri.idrecipe " +
        "INNER JOIN ingredients i ON i.id = ri.idingredients " +
        "INNER JOIN area a ON a.id = r.idsubcategories " +
        "INNER JOIN categories c ON c.id = r.idcategories " +
        "WHERE 1=0 ";
    for (var i = 0; i < searchTerms.length; i++) {
        sqlQuery += "OR i.name LIKE '%" + searchTerms[i] + "%' ";
    }
    if(country != null){
        sqlQuery += "AND a.id =" + country + " ";
    }
    if(categories != null){
        sqlQuery += "AND c.id =" + categories + " ";
    }
    pool.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        // res.send(result.rows);
        console.log(result.rows)
        res.send({ recipes: result.rows });
    });
});

router.post('/query', function (req, res) {
    const myArray = req.body;
    var searchTerms = myArray.id;

    var value_nutritional = 'SELECT v.calories, v.carbohydrate, v.protein, v.fat FROM value_nutritional v '
        + "inner join recipe r on r.id = v.idrecipe "
        + " WHERE r.id = " + searchTerms;

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
    var paises = "SELECT id, name FROM area"
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
    var categories = "SELECT id, name FROM categories"
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