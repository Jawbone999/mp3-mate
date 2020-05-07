var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

const crypto = require('crypto');

router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    req.session.loggedin = false;
    req.session.username = undefined;
  }
  res.render('login', {error: ''});
});

router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const query = `SELECT hash_iterations, salt, password FROM users WHERE username = '${username}'`;
  client
    .query(query)
    .then(reply => {
      if (reply.rows.length === 0) {
        console.error('Invalid Username:', username)
        res.render('login', {error: 'Error: Incorrect password!'});
      }
      const salt = reply.rows[0].salt;
      const db_hashed_password = reply.rows[0].password;
      const hash_iter = reply.rows[0].hash_iterations;

      const hashed_password = crypto.pbkdf2Sync(password, salt, hash_iter, 64, 'sha512').toString('hex');
      
      if (db_hashed_password === hashed_password) {
        console.log(`${username} has successfully logged in.`);
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('search');
      }
      else {
        console.log('Failure to log in.');
        res.render('login', {error: 'Error: Incorrect password!'});
      }
      
    })
    .catch(err => {
      console.error(err.stack)
      res.render('login', {error: 'Error: Username does not exist!'});
    })
  
});

module.exports = router;
