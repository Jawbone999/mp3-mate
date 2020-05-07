var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

/* GET home page. */
router.get('/:songID', function(req, res, next) {
  if (req.session.loggedin) {
    client.query(`SELECT title, artist, mp3, art FROM songs WHERE id = '${req.params.songID}'`)
    .then(reply => {
      const song = reply.rows[0];
      song.art = '../art/' + song.art;
      song.mp3 = '../mp3/' + song.mp3;
      song.act = '/song/' + req.params.songID
      song.act2 = '/song/' + req.params.songID + '/delete'
      res.render('song', song)
    })
    .catch(err => {
      console.error(err.stack);
      return res.redirect('search');
    })
  }
  else{
    return res.redirect('register');
  }
});

router.post('/:songID', function(req, res, next) {
  if (req.session.loggedin) {
    if (Object.keys(req.body).length === 0) {
      return next();
    }
    if (req.body.collection !== undefined) {
      const collection = req.body.collection;
      client.query(`SELECT title, artist, mp3, art FROM songs WHERE id = '${req.params.songID}'`)
      .then(reply => {
        const song = reply.rows[0];
        song.art = '../art/' + song.art;
        song.mp3 = '../mp3/' + song.mp3;
        song.act = '/song/' + req.params.songID
        song.act2 = '/song/' + req.params.songID + '/delete'
        client.query(`SELECT name, id FROM collections WHERE name = '${collection}' AND creator_id = (SELECT id FROM users WHERE username = '${req.session.username}')`)
        .then(reply => {
          if (reply.rows.length === 0) {
            song.error = 'Invalid collection name!';
            return res.render('song', song);
          }
          client.query(`INSERT INTO playlist (song_id, collection_id) VALUES('${req.params.songID}', '${reply.rows[0].id}')`)
          .then(response => {
            song.error = 'Successfully added to collection!';
            return res.render('song', song);
          })
          .catch(error => {
            song.error = err.detail;
            return res.render('song', song);
          })
        })
      })
      .catch(err => {
        console.error(err.stack);
        return res.redirect('../search');
      })
    }
    else {
      client.query(`SELECT title, artist, mp3, art, id FROM songs WHERE id = '${req.params.songID}'`)
      .then(reply => {
        const song = reply.rows[0];
        
        let changes = [];
        
        if (req.body.title !== song.title) {
          changes.push(`title = '${req.body.title}'`);
        }

        if (req.body.artist !== song.artist) {
          changes.push(`artist = '${req.body.artist}'`);
        }

        if (req.files && req.files.art && req.files.art.md5 !== song.art) {
          changes.push(`art = '${req.files.art.md5}'`)
        }

        if (req.files && req.files.mp3 && req.files.mp3.md5 !== song.mp3) {
          changes.push(`mp3 = '${req.files.mp3.md5}'`)
        }

        if (changes.length !== 0) {
          const query = `UPDATE songs SET ${changes.join()} WHERE id = '${song.id}'`;
          client.query(query)
          .then(reply => {
            return res.redirect(`${req.params.songID}`);
          })
          .catch(err => {
            console.error(err.stack);
            return res.redirect(`${req.params.songID}`);
          })
        }
        else {
          console.log('No changes saved.')
          return res.redirect(`${req.params.songID}`);
        }
        })
        .catch(err => {
          console.error(err.stack);
          return res.redirect('search');
        })
    }
  }
  else {
    res.redirect('register');
  }
});

router.post('/:songID/delete', function(req, res, next) {
  client.query(`DELETE FROM songs WHERE id = '${req.params.songID}'`)
  .then(reply => {
    console.log('Successfully deleted song.')
    return res.redirect('../../search')
  })
  .catch(err => {
    console.error(err.stack);
    return res.redirect('../../search');
  })
})

module.exports = router;
