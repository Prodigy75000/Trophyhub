// server/scripts/refineMaster.js
const fs = require("fs");
const path = require("path");

// CONFIG
const DB_PATH = path.join("../../data/master_games.json");

console.log("💎 Starting Master Database Refinement...");

try {
  // 1. Read the rough file
  const raw = fs.readFileSync(DB_PATH, "utf8");
  let games;

  try {
    games = JSON.parse(raw);
  } catch (e) {
    console.error("❌ Invalid JSON! Did you forget a comma between the lists?");
    console.error(e.message);
    process.exit(1);
  }

  console.log(`📥 Loaded ${games.length} entries.`);

  // 2. Deduplicate (by Canonical ID)
  // If a game appears twice, we keep the FIRST one we see.
  const uniqueGames = new Map();
  const duplicates = [];

  games.forEach((game) => {
    if (!game.canonicalId) return; // Skip broken entries

    if (uniqueGames.has(game.canonicalId)) {
      duplicates.push(game.canonicalId);
      // Optional: If you want the Shovelware version to override,
      // you would do uniqueGames.set(game.canonicalId, game) here.
      // But usually, the "Master" version is better, so we ignore duplicates.
    } else {
      uniqueGames.set(game.canonicalId, game);
    }
  });

  console.log(`🗑️ Removed ${duplicates.length} duplicates.`);

  // 3. Sort Alphabetically (A-Z)
  const sortedList = Array.from(uniqueGames.values()).sort((a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  // 4. Save
  fs.writeFileSync(DB_PATH, JSON.stringify(sortedList, null, 2));

  console.log(`✅ Success! Database is clean and sorted.`);
  console.log(`📚 Total Games: ${sortedList.length}`);
  console.log(`📂 Saved to: ${DB_PATH}`);
} catch (err) {
  console.error("❌ Error:", err);
}
