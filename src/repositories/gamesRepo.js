// api/src/repositories/gamesRepo.js
const path = require("path");
const fs = require("fs");
const { getDb } = require("../../db/mongo");

const MASTER_JSON_PATH = path.resolve("../../data/master_games.json");

function readGamesFromJson() {
  const raw = fs.readFileSync(MASTER_JSON_PATH, "utf8");
  return JSON.parse(raw);
}

async function listGames() {
  try {
    const db = await getDb();
    const colName = process.env.MONGO_GAMES_COLLECTION || "games";
    const col = db.collection(colName);

    const count = await col.estimatedDocumentCount();
    if (count === 0) return readGamesFromJson();

    // strip _id to keep your app shape identical
    return await col.find({}, { projection: { _id: 0 } }).toArray();
  } catch (e) {
    // Mongo not available -> fallback
    return readGamesFromJson();
  }
}

module.exports = { listGames };
