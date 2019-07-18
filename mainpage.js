'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://rhea:rhea1@cluster0-nge8c.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'leafie_awards';
let peopleArray = [];
let superlativesArray = [];

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: false }));

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if (err) console.log(err);

  const db = client.db(dbName);
  const people = db.collection('people');
  const superlatives = db.collection('superlatives');

  people.find().forEach((doc) => {
    peopleArray.push(doc.name);
  }).then(() => {
    superlatives.find().forEach((doc) => {
      superlativesArray.push(doc);
    }).then(() => {
        console.log("in here")
        client.close()
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

app.engine('html', require('ejs').renderFile);

app.get('/leafie-awards', (req, res) => {
  res.render(__dirname + '/index.html', { people: peopleArray, superlatives: superlativesArray });
});
