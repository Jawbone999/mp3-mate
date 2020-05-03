var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    res.render('search');
  }
  else {
    res.redirect('index');
  }
});

router.post('/', function(req, res, next) {
  client.connect();
  client.query('')
  console.log('success')
  res.render('search');
});

module.exports = router;
