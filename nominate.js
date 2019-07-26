'use strict';
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8080;
const MongoClient = require('mongodb').MongoClient;

const cookieParser = require('cookie-parser');

const uri = "mongodb+srv://rhea:rhea1@cluster0-nge8c.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'leafie_awards';
let peopleArray = [];
let superlativesArray = [];
let db, people, superlatives;

app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

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
    // var val = doc.general || doc.work || doc.outside_work || doc.sports_games;
    // superlatives.updateOne({"_id": doc._id}, {$set : {"superlative" : val}});
    }).then(() => {
    //use the below to reset people db
    // people.updateMany({}, { $unset: { nominations: "", voters: ""} });
    // people.updateMany({}, { $unset: { undefined: ""}});
    // superlatives.updateMany({}, { $unset: { nominations: ""} });
    // client.close()
    });
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

app.get('/nominate', (req, res) => {
  const user = req.cookies.auth_user;

  if (!user){
    return res.redirect('https://login.corp.mongodb.com/');
  }

  res.render(__dirname + '/nominate.html', { people: peopleArray, superlatives: superlativesArray });
});

app.post('/nominate', (req, res) => {
  const user = req.cookies.auth_user.replace(/\./,'');

  // if (!user) {
  //   res.redirect('https://login.corp.mongodb.com');
  //   return;
  // }

  const name = req.body.person;
  const work = Array.isArray(req.body.work) ? req.body.work : [req.body.work];
  const sports_games = Array.isArray(req.body.sports_games) ? req.body.sports_games : [req.body.sports_games];
  const outside_work = Array.isArray(req.body.outside_work) ? req.body.outside_work : [req.body.outside_work];
  const general = Array.isArray(req.body.general) ? req.body.general : [req.body.general];
  const noms = [...work, ...sports_games, ...outside_work, ...general].filter(x => x);

  people.findOne({ name : name }).then((person) => {
    if (person) {
      noms.forEach((superlative) => {
        superlatives.findOne({ superlative : superlative }).then((result) => {
          const dict = result.nominations || {};
          if(person.voters[user] && !person.voters[user].includes(superlative)){
            if (dict[name]) { 
              dict[name] += 1;
            } else {
              dict[name] = 1;
            }
            superlatives.updateOne({ superlative : superlative }, { $set : { nominations : dict } });
          }
        });
      });
      var update = { $addToSet: {} };
      update.$addToSet['voters.' + user] = { $each: noms };
      people.updateOne({ name: name }, update);
    }
  });
  res.render(__dirname + '/nominate.html', { people: peopleArray, superlatives: superlativesArray });
});

app.get('/', (req, res) => {
  res.render(__dirname + '/index.html');
});

app.get('/result', (req, res) => {
  // people.aggregate([ {$group : { nominations: "$nominations", count : {$sum : 1}}} ]);
  res.send('Hello! results aren\'t out yet');
});

app.get('/result', (req, res) => {
  people.aggregate([ {$group : { nominations: "$nominations", count : {$sum : 1}}} ]);
  res.send('Hello! results aren\'t out yet');
});
