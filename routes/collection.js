var express = require('express');
var router = express.Router();
const { Pool } = require('pg');
const secrets = require('../secret.json')
const client = new Pool(secrets);

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    let tableData = '';
    client.query(`SELECT id, name FROM collections WHERE creator_id = (SELECT id FROM users WHERE username = '${req.session.username}')`)
    .then(collection_data => {
      for(const row of collection_data.rows) {
        tableData += '<tr>'
        tableData += '<td>'
        tableData += `<a href="/playlist/${row.id}">`
        tableData += '<h3>'
        tableData += row.name;
        tableData += '</h3>'
        tableData += '</a>'
        tableData += '</td>'
        tableData += '</tr>'
      }
      if (tableData === '') {
        tableData = '<p>You have no collections!</p>'
      }
      res.render('collection', {collections: tableData});
    })
    .catch(err => {
      console.error(err.stack);
      res.redirect('/');
    })
  }
  else {
    res.render('index');
  }
});

router.post('/', function(req, res, next) {
  if (req.session.loggedin) {
    let new_title = req.body.title;
    if (new_title === '') {
      new_title = 'New Collection';
    }
    
    client.query(`INSERT INTO collections (name, creator_id, creation_date) VALUES ('${new_title}', (SELECT id FROM users WHERE username = '${req.session.username}'), CURRENT_TIMESTAMP)`)
    .then(reply => {
      console.log('Successfully created collection.');
      res.redirect('collection');
    })
    .catch(err => {
      console.error(err.stack);
      res.redirect('/');
    })
  }
  else {
    console.log(req.session)
    res.redirect('/');
  }
});

module.exports = router;
