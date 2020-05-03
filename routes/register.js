var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

const validator = require('validator');
const crypto = require('crypto');

router.get('/', function(req, res, next) {
    res.render('register', {error: ''});
});

router.post('/', function(req, res, next) {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    if (!validator.isEmail(email)){
        console.log(`Bad Email: ${email}`);
        res.render('register', {error: 'Invalid email!'});
    }
    else if (!validator.isAlphanumeric(username)){
        console.log(`Bad Username: ${username}`);
        res.render('register', {error: 'Invalid username!'});
    }
    else if (!validator.isAscii(password)){
        console.log(`Bad Password: ${password}`);
        res.render('register', {error: 'Invalid password!'});
    }
    else {
        console.log(`Registering ${username}:${password}:${email}`);
        
        const hash_iter = Math.ceil(Math.random() * 10);
        const salt = crypto.randomBytes(16).toString('hex');
        const hashed_password = crypto.pbkdf2Sync(password, salt, hash_iter, 64, 'sha512').toString('hex');

        const query = `INSERT INTO users(username, email, password, hash_iterations, salt, created_at) VALUES('${username}', '${email}', '${hashed_password}', ${hash_iter}, '${salt}', CURRENT_TIMESTAMP)`;
        client
          .query(query)
          .then(reply => res.render('login'))
          .catch(err => {
            console.error(err.stack);
            res.render('register', {error: "Error: " + err.detail});
          })
    }
});

module.exports = router;
