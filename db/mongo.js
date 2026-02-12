// api/src/db/mongo.js
const { MongoClient } = require("mongodb");

let client;
let db;

async function getDb() {
  if (db) return db;

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const dbName = process.env.MONGO_DB || "trophyhub";

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  return db;
}

module.exports = { getDb };
