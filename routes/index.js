var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('search');
  }
  else{
    res.redirect('register');
  }
});

module.exports = router;
