const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://sam:sam1@cluster0-nge8c.mongodb.net/test?retryWrites=true&w=majority';

const dbName = 'leafie_awards';

const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect((err, client) => {
  if (err) console.log(err)
  console.log('connected to server');
  const db = client.db(dbName);

  const people = db.collection('people');
  const superlatives = db.collection('superlatives');
  // update to include nominations
  // people.updateOne( { name: "Sam Pal" }, { $set : { "nominations" : ["Best Whatever", "Great Person", "something something", "anotha 1"] }})
  client.close();
});
