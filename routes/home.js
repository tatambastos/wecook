const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');
const { Pool } = require('pg');

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

router.get('/registro', function (req, res) {
  res.render('registro');
});


router.get('/profile', (req, res, next) => {
  
  console.log("User ID:", req.session.passport.user);
  const id = req.session.passport.user;
  const query = "select * from usuarios where id =" +id;
  pool.query(query, (err, result) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error en la consulta');
        return;
    }
    console.log(result.rows);
    // res.send(result.rows);
    res.render('profile', { user: result.rows });
});
  
  //res.render('profile', { user: req.session.passport.user });
}); 

router.get('/signin', function (req, res) {
  res.render('signin')
});

router.get('/admin', function (req, res) {
  res.render('admin')
});

router.get('/registro', function (req, res) {
  res.render('registro')
});

router.all("/about", (req, res) => {
  res.send("about page");
});

module.exports = router;
