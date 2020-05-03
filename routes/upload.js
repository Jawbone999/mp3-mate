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
    res.redirect('index');
  }
});

router.post('/', function(req, res, next) {
    if (req.files === null) {
        res.render('upload');
    }
    else if (req.files.art === undefined || req.files.mp3 === undefined) {
        res.render('upload')
    }
    else if (req.body.title === '' || req.body.artist === '') {
        res.render('upload');
    }
    else {
        // Data exists
        if (req.files.art.mimetype !== 'image/jpeg' && req.files.art.mimetype !== 'image/png') {
            res.render('upload');
        }
        else if (req.files.mp3.mimetype !== 'audio/mpeg') {
            res.render('upload');
        }
        else {
            // Valid enough data
            // Storing files based on md5 is not great but works for small data sets
            const art = req.files.art;
            const artPath = './database/art/' + art.md5;
            const mp3 = req.files.mp3;
            const mp3Path = './database/mp3' + mp3.md5;
            if (!fs.existsSync(artPath)) {
                art.mv(artPath);
            }
            if (!fs.existsSync(mp3Path)) {
                mp3.mv(mp3Path)
            }
            const query = `INSERT INTO songs (title, mp3, art, artist) VALUES('${req.body.title}', '${mp3Path}', '${artPath}', '${req.body.artist}')`;
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
