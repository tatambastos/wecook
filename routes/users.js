const { Router } = require('express');// Módulo Router de Express para crear rutas
const express = require('express');// Framework web para Node.js
const { Pool } = require('pg');// Dependencia para interactuar con PostgreSQL
const router = Router();// Crear una instancia del enrutador de Express
const axios = require('axios'); // Dependencia para realizar solicitudes HTTP
const bodyParser = require('body-parser');// Middleware para analizar el cuerpo de las solicitudes
const passport = require('passport'); // Middleware de autenticación para Express
const LocalStrategy = require('passport-local').Strategy; // Estrategia de autenticación local para Passport
const session = require('express-session');// Middleware de sesión para Express
const pgSession = require('connect-pg-simple')(session); // Almacenamiento de sesiones en PostgreSQL para Express
const bcrypt = require('bcrypt'); // Dependencia para el cifrado de contraseñas
const pg = require('pg'); // Dependencia para interactuar con PostgreSQL
const flash = require('connect-flash'); // Middleware para mensajes flash en Express


router.use(bodyParser.urlencoded({ extended: true }));// Analizar el cuerpo de las solicitudes en formato URL-encoded
router.use(bodyParser.json());// Analizar el cuerpo de las solicitudes en formato JSON

const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database: 'cookwe',
    port: '5434'
  };
  
  const pool = new Pool(config); // Crear una instancia del grupo de conexiones de PostgreSQL


router.use(passport.initialize());// Inicializar el middleware de autenticación de Passport
router.use(passport.session()); // Utilizar el middleware de sesión de Passport
router.use(flash()); // Utilizar el middleware de mensajes flash en Express

global.myArray = [];


//ruta tipo post donde se consultan las recetas por cada ingrediente que se envia
router.get('/search/query', (req, res) => {
    console.log(myArray)
    var searchTerms = myArray; // Obtiene los términos de búsqueda de la variable global myArray
    var sqlQuery = "SELECT * FROM recipe r " +
        "INNER JOIN recipe_ingredients ri ON r.id = ri.idrecipe " +
        "INNER JOIN ingredients i ON i.id = ri.idingredients " +
        "WHERE 1=0 "; // Consulta SQL inicial con una cláusula WHERE que siempre es falsa
    for (var i = 0; i < searchTerms.length; i++) {
        sqlQuery += "OR i.name LIKE '%" + searchTerms[i] + "%' "; // Agrega condiciones a la consulta SQL utilizando los términos de búsqueda
    }
    pool.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta'); // Envía una respuesta de error al cliente
            return;
        }
        // res.send(result.rows);
        res.send({ recipes: result.rows }); // Envía los resultados de la consulta al cliente como un objeto JSON con una propiedad "recipes"
    });

})

const saltRounds = 10;

//ruta tipo post donde se hace el registro de cada usuario encriptando su contraseña antes de enviarlo a la tabla
router.post('/register', (req, res) => {
    bcrypt.hash(req.body[3], saltRounds, (err, hash) => {
        if (err) {
            console.error(err);// Imprime el error en la consola en caso de que ocurra uno
            res.status(500).send('Error al encriptar la contraseña'); // Envía una respuesta de error al cliente
            return;
        }
        console.log(req.body) 
        var query = "INSERT INTO usuarios (name, last_name, email, password) "
            + "VALUES ('" + req.body[0] + "','" + req.body[1] + "','" + req.body[2] + "', '" + hash + "');" // Construye la consulta SQL para insertar los datos del usuario en la base de datos
        pool.query(query, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error en la consulta');  // Envía una respuesta de error al cliente
                return;
                
            }
            res.send(result); // Envía los resultados de la consulta al cliente
        });
    });
});
// Ruta POST donde se hace la validacion del usuario y se crea una sesion
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',// Redirecciona al usuario a la página de perfil en caso de inicio de sesión exitoso
    failureRedirect: '/signin', // Redirecciona al usuario a la página de inicio de sesión en caso de inicio de sesión fallido
    failureFlash: true // Habilita el uso de mensajes flash en caso de inicio de sesión fallido
}), (req, res) => {
        res.locals.messages = req.flash(); // Pasa los mensajes flash a la vista
        res.render('signin'); // Renderiza la vista de inicio de sesión
});
  
  passport.use(new LocalStrategy({
    usernameField: 'email', // campo del formulario con el email del usuario
    passwordField: 'password', // campo del formulario con la contraseña del usuario
  },
  
  async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

      if (rows.length === 0) {
        return done(null, false, { message: 'El correo electrónico o la contraseña son incorrectos.' });  // El usuario no existe, se llama a done con false y se pasa un mensaje de error
      }

      const user = rows[0];

      const match = await bcrypt.compare(password, user.password); // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos

      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'El correo electrónico o la contraseña son incorrectos.' });  // Las contraseñas no coinciden, se llama a done con false y se pasa un mensaje de error
      }
    } catch (error) {
      return done(error);
    }
  }
));

router.use((req, res, next) => {
    res.locals.messages = req.flash();// Pasa los mensajes flash a las vistas
    next(); // Llama a la siguiente función en la cadena de middleware
  });
router.get('/signin', function (req, res) {
    res.render('signin') // Renderiza la vista de inicio de sesión   
  });
passport.serializeUser((user, done) => {
    done(null, user.id); // Serializa al usuario almacenando su ID en la sesión
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]); // Consulta para obtener el usuario con el ID proporcionado
  
      if (rows.length === 0) {
        return done(new Error('El usuario no existe.')); // El usuario no existe, se llama a done con un error
      }
  
      const user = rows[0]; 
  
      done(null, user);// Se llama a done con el usuario encontrado
    } catch (error) {
      done(error);// Ocurrió un error durante la consulta a la base de datos, se llama a done con el error
    }
  });
  router.get("/home", (req, res) => {


    pool.query('SELECT name FROM ingredients', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta'); // Envía una respuesta de error al cliente
            return;
        }
        if (req.session && req.session.passport && req.session.passport.user) {
        console.log("User ID:", req.session.passport.user);  // Imprime el ID del usuario en la consola
        const id = req.session.passport.user;
        // res.send(result.rows);
        res.render('index', { ingredients: result.rows, user: req.session.passport.user }); // Renderiza la vista 'index' y pasa los ingredientes y el ID del usuario como datos
        } else{
            res.render('index', { ingredients: result.rows, user: 0}) // Renderiza la vista 'index' con un ID de usuario de 0 (no autenticado)
        }
    });
});
// Ruta que agrega datos del usuario y la receta en la tabla intermedia
router.post('/addFavorites', (req, res) => {

    console.log(req.body);
    const query = "INSERT INTO recipe_user(iduser,idrecipe,favorite) VALUES ("+req.body[1]+","+req.body[0]+", true);"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
//Cerrar sesion y redirige a iniciar sesion
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/signin');
  });
//Ruta tipo POST donde se buscan las recetas favoritas del usuario atravez de la tabla intermedia
router.post('/recipeUser', (req, res) => {

    console.log("este es el id de user" + req.body.userid);
    const query = "Select r.id,r.name,r.url,r.instructions from recipe r "
                    +"inner join recipe_user re on r.id = re.idrecipe "
                    +"where re.iduser = " + req.body.userid
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send({ recipe: result.rows });
        
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
//ruta Tipo POST donde se consulta toda la informacion de la receta para ingresarlas al modal de la receta completa
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
    ])//Se utiliza Promise.all para ejecutar las tres consultas en paralelo y obtener los resultados. 
        .then(([value_nutritional, recipe, ingredients]) => {
            res.send({ value_nutritional: value_nutritional.rows[0], recipe: recipe.rows[0], ingredients: ingredients.rows });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error en la consulta');
        });
});
//Ruta tipo post que envia los datos de la tabla area
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
//Ruta tipo post que envia los datos de la tabla categories
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
router.post('/SumbitIngredient', (req, res) => {
    const query = "INSERT INTO ingredients (id, name, type, description) VALUES ("+req.body[0]+","+req.body[1]+","+req.body[2]+","+req.body[3]+");"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
router.post('/SumbitRecipe', (req, res) => {
    const query = "INSERT INTO recipe (id, name, time_prepparation, url, idcategory, idsubcategory, instructions) VALUES ("+req.body[0]+","+req.body[1]+","+req.body[2]+","+req.body[3]+","+req.body[4]+","+req.body[5]+","+req.body[6]+");"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
router.post('/SumbitArea', (req, res) => {
    const query = "INSERT INTO area (id, name) VALUES ("+req.body[0]+","+req.body[1]+");"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
router.get('/pruebas', function (req, res) {
    res.render('pruebas')
  });
router.post('/SumbitIntermedy', (req, res) => {
    const query = "INSERT INTO recipe_ingredients (id, idrecipe, idingredients, amount) VALUES ("+req.body[0]+","+req.body[1]+","+req.body[2]+","+req.body[3]+");"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
router.post('/SumbitCategory', (req, res) => {
    const query = "INSERT INTO category (id, name, url, description) VALUES ("+req.body[0]+","+req.body[1]+","+req.body[2]+","+req.body[3]+");"
    pool.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }
        
        res.send(result.rows);
        
    });
});
router.get('/ViewArea', (req, res) => {
    var paises = "SELECT * FROM area"
    pool.query(paises, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }

        res.send({ areas: result.rows });
    });
});

router.get('/ViewCategories', (req, res) => {
    var paises = "SELECT * FROM categories"
    pool.query(paises, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }

        res.send({ categories: result.rows });
    });
});

router.get('/ViewRecipe', (req, res) => {
    var paises = "SELECT * FROM recipe"
    pool.query(paises, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }

        res.send({ recipe: result.rows });
    });
});
router.get('/ViewIngredients', (req, res) => {
    var paises = "SELECT * FROM ingredients"
    pool.query(paises, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la consulta');
            return;
        }

        res.send({ ingredient: result.rows });
    });
});
module.exports = router;