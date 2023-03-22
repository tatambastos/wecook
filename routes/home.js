const {Router} = require('express');
const router = Router();

router.all("/about", (req, res) => {
    res.send("about page")
});


module.exports = router;