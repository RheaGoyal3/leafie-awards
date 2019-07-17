'use strict';
const express = require('express');
const port = 3000;
const path = require('path');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://sam:sam1@cluster0-nge8c.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'leafie_awards';

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if (err) console.log(err);

  const db = client.db(dbName);
  const people = db.collection('people');
  const superlatives = db.collection('superlatives');

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));

});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/mainpage.html');
});
