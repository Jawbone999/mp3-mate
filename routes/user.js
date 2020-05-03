var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

/* GET user data. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    client.query(`SELECT * from users WHERE username = ${req.session.username}`)
    .then((result) => {
      console.log(result);
    })
    .catch(err => {
      console.error(err.stack);
    })
    res.render('user', {photo: ''});
  }
  else {
    res.redirect('index');
  }
});

module.exports = router;
