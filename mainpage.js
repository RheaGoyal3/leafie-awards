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
let db, people, superlatives;

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'application/json' }))
app.use(bodyParser.json())

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if (err) console.log(err);

  db = client.db(dbName);
  people = db.collection('people');
  superlatives = db.collection('superlatives');

  people.find().forEach((doc) => {
    peopleArray.push(doc);
  }).then(() => {
    superlatives.find().forEach((doc) => {
      superlativesArray.push(doc);
    }).then(() => {
        // client.close()
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

app.engine('html', require('ejs').renderFile);

app.get('/nominate', (req, res) => {
  res.render(__dirname + '/index.html', { people: peopleArray, superlatives: superlativesArray });
});

app.post('/form', (req, res) => {
  const name = req.body.person;
  const work = Array.isArray(req.body.work) ? req.body.work : [req.body.work];
  const sports_games = Array.isArray(req.body.sports_games) ? req.body.sports_games : [req.body.sports_games];
  const outside_work = Array.isArray(req.body.outside_work) ? req.body.outside_work : [req.body.outside_work];
  const general = Array.isArray(req.body.general) ? req.body.general : [req.body.general];
  const noms = [...work, ...sports_games, ...outside_work, ...general].filter(x => x);

  people.findOne({ name : name }).then((result) => {
    const dict = result.nominations || {};
    for (let i = 0; i < noms.length; i++) {
      if (dict[noms[i]]) dict[noms[i]] += 1;
      else dict[noms[i]] = 1;
    }
    people.updateOne( { name: name }, { $set : { nominations : dict }})
  });
  res.send(JSON.stringify(req.body));
});

app.get('/result', (req, res) => {
  people.aggregate([ {$group : { nominations: "$nominations", count : {$sum : 1}}} ]);
  res.send('helllo');
});
