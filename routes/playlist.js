var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

/* GET home page. */
router.get('/:collectionID', function(req, res, next) {
  if (req.session.loggedin) {
    const collectionID = req.params.collectionID;
    options = {};
    options.act = `/playlist/${collectionID}/delete`;
    client.query(`SELECT name, creation_date FROM collections WHERE id = '${collectionID}'`)
    .then(reply => {
      options.date = reply.rows[0].creation_date;
      options.name = reply.rows[0].name;
      client.query(`SELECT title, artist, art, id FROM songs WHERE id IN (SELECT song_id FROM playlist WHERE collection_id = '${collectionID}')`)
      .then(result => {
        options.songs = ''
        for (const song of result.rows) {
          options.songs += `<a class="box" href="/song/${song.id}">`
          options.songs += `<img src="../art/${song.art}">`
          options.songs += `<p>${song.title}</p>`
          options.songs += `<h5>${song.artist}</h5>`
          options.songs += `</a>`
        }
        if (options.songs === '') {
          options.songs = 'No songs in playlist.'
        }
        return res.render('playlist', options)
      })
      .catch(error => {
        console.error(error.stack);
        return res.redirect('../index');
      })
    })
    .catch(err => {
      console.error(err.stack);
      return res.redirect('../index');
    })
  }
  else {
    return res.redirect('../index');
  }
});

router.post('/:collectionID/delete', function(req, res, next) {
  console.log(req.params)
  client.query(`DELETE FROM collections WHERE id = '${req.params.collectionID}'`)
  .then(reply => {
    console.log('Successfully deleted collection.')
    return res.redirect('../../search')
  })
  .catch(err => {
    console.error(err.stack);
    return res.redirect('../../search');
  })
})

module.exports = router;
