var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    res.render('search', {display: "display: none;"});
  }
  else {
    res.redirect('/');
  }
});

router.post('/', function(req, res, next) {
  const user_query = req.body.query;
  if (user_query === "") {
    return res.redirect('search');
  }

  let song_results = '';
  let collection_results = '';
  let user_results = '';

  client.query(`SELECT id, title, artist, art, mp3 FROM songs WHERE title LIKE '%${user_query}%' OR artist LIKE '%${user_query}%'`)
  .then(song_data => {
    for(const row of song_data.rows) {
      song_results += `<a class="box" href="/song/${row.id}">`
      song_results += `<img src="../art/${row.art}">`
      song_results += `<p>${row.title}</p>`
      song_results += `<h5>${row.artist}</h5>`
      song_results += `</a>`
    }
    
    client.query(`SELECT collections.id, name, art, username FROM collections, users WHERE username LIKE '%${user_query}%' AND users.id = collections.creator_id`)
    .then(collection_data => {
      for(const row of collection_data.rows) {
        collection_results += `<a class="box" href="/playlist/${row.id}">`
        collection_results += `<p>${row.name}</p>`
        collection_results += `<h5>${row.username}</h5>`
        collection_results += `</a>`
      }

      client.query(`SELECT username, photo, id, created_at FROM users WHERE username LIKE '%${user_query}%'`)
      .then(user_data => {
        for(const row of user_data.rows) {
          user_results += `<a class="box" href="/user/${row.id}">`
          if (row.art === undefined) {
            user_results += `<img src="../images/default.jpg">`
          }
          else {
            user_results += `<img src="../images/${row.art}">`
          }
          user_results += `<p>${row.username}</p>`
          user_results += `</a>`
        }

        if (song_results === '') {
          song_results = '<p>No results found.</p>'
        }
        if (collection_results === '') {
          collection_results = '<p>No results found.</p>'
        }
        if (user_results === '') {
          user_results = '<p>No results found.</p>'
        }
        res.render('search', {query: user_query, display: "display: auto;", songs: song_results, collections: collection_results, users: user_results});
      })
      .catch(err => {
        console.error(err.stack);
        res.redirect('search');
      })
    })
    .catch(err => {
      console.error(err.stack);
      res.redirect('search');
    })

  })
  .catch(err => {
    console.error(err.stack);
    res.redirect('search')
  })
});

module.exports = router;
