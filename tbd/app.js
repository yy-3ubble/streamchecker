const express = require('express');
const mysql = require('mysql')
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hogehoge',
  database: 'checker'
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM online JOIN users ON online.user_id = users.id ORDER BY online.viewer_count DESC',
    (error, results) => {
      res.render('top.ejs', {items: results});
    }
  );
});

app.get('/streamer', (req, res) => {
  connection.query('SELECT * FROM users',
    (error, results) => {
      res.render('streamer.ejs', {items: results});
    }
  );
});

app.listen(3000);
