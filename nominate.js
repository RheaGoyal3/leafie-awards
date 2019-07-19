'use strict';
// require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8080;
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

// //auth
// const session = require('express-session');
// const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

// // session support is required to use ExpressOIDC
// app.use(session({
//   secret: process.env.APP_SECRET,
//   resave: true,
//   saveUninitialized: false
// }));

// const oidc = new ExpressOIDC({
//   issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
//   client_id: process.env.OKTA_CLIENT_ID,
//   client_secret: process.env.OKTA_CLIENT_SECRET,
//   redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
//   scope: 'openid profile'
// });

// // ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
// app.use(oidc.router);

// oidc.on('ready', () => {
//   app.listen(8080, () => console.log(`Started!`));
// });

// oidc.on('error', err => {
//   console.log('Unable to configure ExpressOIDC', err);
// });

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
      //use the below to reset people db
      // people.updateMany({}, { $unset: { nominations: "", voters: ""} })
        // client.close()
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

app.engine('html', require('ejs').renderFile);

app.get('/welcome', /*oidc.ensureAuthenticated(),*/ (req, res) => {
  res.render(__dirname + '/index.html', { people: peopleArray, superlatives: superlativesArray });
});

app.get('/nominate', /*oidc.ensureAuthenticated(),*/ (req, res) => {
  res.render(__dirname + '/nominate.html', { people: peopleArray, superlatives: superlativesArray });
});

app.post('/nominate', /*oidc.ensureAuthenticated(),*/ (req, res) => {
  const name = req.body.person;
  const work = Array.isArray(req.body.work) ? req.body.work : [req.body.work];
  const sports_games = Array.isArray(req.body.sports_games) ? req.body.sports_games : [req.body.sports_games];
  const outside_work = Array.isArray(req.body.outside_work) ? req.body.outside_work : [req.body.outside_work];
  const general = Array.isArray(req.body.general) ? req.body.general : [req.body.general];
  const noms = [...work, ...sports_games, ...outside_work, ...general].filter(x => x);

  const user = "test user";/*req.userContext.userinfo.name;*/

  people.findOne({ name : name }).then((result) => {
    if (!result.voters || !result.voters.contains(user)) {
      const dict = result.nominations || {};
      for (let i = 0; i < noms.length; i++) {
        if (dict[noms[i]]) dict[noms[i]] += 1;
        else dict[noms[i]] = 1;
      }
      people.updateOne( { name: name }, { $set : { nominations : dict }, $push : { voters : user }})
    }
  });
  // res.status(204).send();
  res.render(__dirname + '/nominate.html', { people: peopleArray, superlatives: superlativesArray });
});

app.get('/result', (req, res) => {
  people.aggregate([ {$group : { nominations: "$nominations", count : {$sum : 1}}} ]);
  res.send('helllo');
});
