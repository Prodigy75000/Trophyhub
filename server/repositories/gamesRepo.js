// server/repositories/gamesRepo.js
const { getDb } = require("../db/mongo"); // Adjust path based on your folder structure

async function listGames() {
  try {
    const db = await getDb();
    const colName = process.env.MONGO_GAMES_COLLECTION || "games";
    const col = db.collection(colName);

    // 🟢 CLEAN: No JSON fallback. Just query the DB.
    // Projection { _id: 0 } ensures the object shape matches your types exactly
    return await col.find({}, { projection: { _id: 0 } }).toArray();
  } catch (e) {
    console.error("❌ Database Error in listGames:", e.message);
    // Return empty array so the app doesn't crash, it just shows 0 games
    return [];
  }
}

module.exports = { listGames };
