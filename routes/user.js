var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

const validator = require('validator');
const crypto = require('crypto');
const fs = require('fs');

/* GET user data. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    client.query(`SELECT * from users WHERE username = '${req.session.username}'`)
    .then((result) => {
      const row = result.rows[0];
      let photo = 'default.jpg';
      if (row.photo !== null) {
        photo = row.photo;
      }
      photo = '../images/' + photo;
      
      const username = row.username;
      
      let bio = '';
      if (row.bio !== null) {
        bio = row.bio;
      }

      const date = row.created_at;

      const email = row.email;

      const options = {username: username, photo: photo, bio: bio, date: date, email: email};

      return res.render('user', options);
    })
    .catch(err => {
      console.error(err.stack);
      return res.redirect('/');
    })
  }
  else {
    return res.redirect('/');
  }
});

router.get('/:id', function(req, res, next) {
  if (req.session.loggedin) {
    client.query(`SELECT * from users WHERE id = '${req.params.id}'`)
    .then((result) => {
      const row = result.rows[0];
      let photo = 'default.jpg';
      if (row.photo !== null) {
        photo = row.photo;
      }
      photo = '../images/' + photo;
      
      const username = row.username;
      
      let bio = '';
      if (row.bio !== null) {
        bio = row.bio;
      }

      const date = row.created_at;

      const email = row.email;

      const options = {username: username, photo: photo, bio: bio, date: date, email: email};

      return res.render('user', options);
    })
    .catch(err => {
      console.error(err.stack);
      return res.redirect('/');
    })
  }
  else {
    return res.redirect('/');
  }
})

router.post('/', function(req, res, next) {
  if (req.session.loggedin) {
    if (Object.keys(req.body).length === 0) {
      return next();
    }
    client.query(`SELECT * from users WHERE username = '${req.session.username}'`)
    .then(data => {
      const row = data.rows[0];
      const options = {username: row.username, photo: ('../images/' + row.photo), bio: row.bio, date: row.date, email: row.email}

      let changes = [];
      
      if (req.body.username !== row.username) {
        if (!validator.isAlphanumeric(req.body.username)) {
          options.error = 'Invalid username!';
          console.error(options.error);
          return res.render('user', options)
        }
        changes.push(`username = '${req.body.username}'`);
      }

      if (req.body.password !== '') {
        let hashed_pw = crypto.pbkdf2Sync(req.body.password, row.salt, row.hash_iterations, 64, 'sha512').toString('hex');
        if (hashed_pw !== row.password) {
          if (!validator.isAscii(req.body.password)) {
            options.error = 'Invalid password!';
            console.error(options.error);
            return res.render('user', options)
          }
          const hash_iter = Math.ceil(Math.random() * 10);
          const salt = crypto.randomBytes(16).toString('hex');
          const hashed_password = crypto.pbkdf2Sync(req.body.password, salt, hash_iter, 64, 'sha512').toString('hex');
          changes.push(`password = '${hashed_password}'`);
          changes.push(`salt = '${salt}'`);
          changes.push(`hash_iterations = '${hash_iter}'`);
        }
      }

      if (req.body.email !== row.email) {
        if (!validator.isEmail(req.body.email)) {
          options.error = 'Invalid email!';
          console.error(options.error);
          return res.render('user', options)
        }
        changes.push(`email = '${req.body.email}'`);
      }

      if (req.body.bio !== row.bio) {
        changes.push(`bio = '${req.body.bio}'`);
      }

      if (req.files && req.files.photo) {
        const photo = req.files.photo;
        if (photo.mimetype !== 'image/png' && photo.mimetype !== 'image/jpeg') {
          options.error = 'Invalid image!';
          console.error(options.error);
          return res.render('user', options);
        }
        const photoPath = './public/images/' + photo.md5;
        photo.mv(photoPath);
        changes.push(`photo = '${photo.md5}'`);
      }

      if (changes.length !== 0) {
        const query = `UPDATE users SET ${changes.join()} WHERE username = '${row.username}'`;
        console.log(query);
        client.query(query)
        .then(reply => {
          req.session.username = req.body.username;
          return res.redirect('user');
        })
        .catch(err => {
          console.error(err.stack);
          return res.redirect('user');
        })
      }
      else {
        console.log('No changes saved.')
        return res.redirect('user');
      }
    })
    .catch(err => {
      console.error(err.stack);
    })
  }
  else {
    return res.redirect('/');
  }
}, function(req, res, next) {
  client.query(`DELETE FROM users WHERE username = '${req.session.username}'`)
  .then(reply => {
    console.log('Successfully deleted user.')
    req.session.username = undefined;
    req.session.loggedin = false;
    return res.redirect('/')

  })
  .catch(err => {
    console.error(err.stack);
    return res.redirect('/');
  })
});

module.exports = router;
