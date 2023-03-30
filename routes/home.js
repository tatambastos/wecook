const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/user', function (req, res) {
  res.render('user');
});



  

router.all("/about", (req, res) => {
  res.send("about page");
});

module.exports = router;
