'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://sam:sam1@cluster0-nge8c.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'leafie_awards';
let peopleArray = [];
let superlativesArray = [];
let db;
let people;
let superlatives;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
// app.use(bodyParser.text({ type: 'text/html' }))

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if (err) console.log(err);

  db = client.db(dbName);
  const people = db.collection('people');
  const superlatives = db.collection('superlatives');

  people.find().forEach((doc) => {
    peopleArray.push(doc.name);
  }).then(() => {
    superlatives.find().forEach((doc) => {
      superlativesArray.push(doc);
    }).then(() => {
        client.close()
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

app.engine('html', require('ejs').renderFile);

app.get('/leafie-awards', (req, res) => {
  res.render(__dirname + '/index.html', { people: peopleArray, superlatives: superlativesArray });
});

app.post('/form', (req, res) => {
  // console.log('req.body.person', req.body.person);
  // console.log('req.body.general', req.body.general);
  // console.log('req.body.work', req.body.work);
  // console.log('req.body.sports_games', req.body.sports_games);
  // console.log('req.body.outside_work', req.body.outside_work);
  res.send(req.body.sports_games);
});

// app.post('/nominated', (req, res) => {
//   console.log('nominates');
//   // people.updateOne( { name: "Sam Pal" }, { $set : { "nominations" : ["Best Whatever", "Great Person", "something something", "anotha 1"] }})
//   res.sendStatus(201);
// });
//
// app.get('/nominate', (req, res) => {
//   people.find().toArray((err, result) => {
//     if (err) console.log(err);
//     res.rend(result)
//   });
// });
