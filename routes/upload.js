var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

const fs = require('fs');

/* GET user data. */
router.get('/', function(req, res, next) {
    if (req.session.loggedin) {
    res.render('upload');
  }
  else {
    res.redirect('/');
  }
});

router.post('/', function(req, res, next) {
    if (req.files === null) {
        res.render('upload', {error: 'Error! No files provided.'});
    }
    else if (req.files.art === undefined || req.files.mp3 === undefined) {
        res.render('upload', {error: 'Error! Not enough files provided.'})
    }
    else if (req.body.title === '' || req.body.artist === '') {
        res.render('upload', {error: 'Error! Not enough data provided.'});
    }
    else {
        // Data exists
        if (req.files.art.mimetype !== 'image/jpeg' && req.files.art.mimetype !== 'image/png') {
            res.render('upload', {error: 'Error! Invalid art file type.'});
        }
        else if (req.files.mp3.mimetype !== 'audio/mpeg') {
            res.render('upload', {error: 'Error! Invalid music file type.'});
        }
        else {
            // Valid enough data
            // Storing files based on md5 is not great but works for small data sets
            const art = req.files.art;
            const artPath = './public/art/' + art.md5;
            const mp3 = req.files.mp3;
            const mp3Path = './public/mp3/' + mp3.md5;
            if (!fs.existsSync(artPath)) {
                art.mv(artPath);
            }
            if (!fs.existsSync(mp3Path)) {
                mp3.mv(mp3Path)
            }
            const artist = req.body.artist.replace("'", "''");
            const title = req.body.title.replace("'", "''");
            const query = `INSERT INTO songs (title, mp3, art, artist) VALUES('${title}', '${mp3.md5}', '${art.md5}', '${artist}')`;
            client.query(query)
            .then(reply => {
                console.log('Uploaded song.');
                res.render('upload', {error: 'Successfully uploaded song!'});
            })
            .catch(err => {
                console.error('Error uploading song.');
                console.error(err.stack);
                res.render('upload', {error: 'The song already exists in the database!'});
            })
        }
    }
});

module.exports = router;
