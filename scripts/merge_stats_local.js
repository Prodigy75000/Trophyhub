const fs = require("fs");
const path = require("path");

// 🟢 PATHS (Adjust if your filenames differ)
const MASTER_JSON_PATH = path.join("../data/master_games.json");
const RAW_DB_PATH = path.join("../data/raw_master_db.json");

function run() {
  console.log("🚀 Starting Local Merge...");

  // 1. Load Files
  if (!fs.existsSync(MASTER_JSON_PATH) || !fs.existsSync(RAW_DB_PATH)) {
    console.error("❌ Error: One of the JSON files is missing!");
    return;
  }

  const masterGames = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, "utf-8"));
  const rawDb = JSON.parse(fs.readFileSync(RAW_DB_PATH, "utf-8"));

  console.log(`📂 Loaded ${masterGames.length} Master Games`);
  console.log(`📂 Loaded ${rawDb.length} Raw DB Entries`);

  // 2. Create a fast Lookup Map from Raw DB
  // Key: npCommunicationId -> Value: trophyCount object
  const statsMap = new Map();
  rawDb.forEach((entry) => {
    if (entry.npCommunicationId && entry.trophyCount) {
      statsMap.set(entry.npCommunicationId, entry.trophyCount);
    }
  });

  let updatedCount = 0;

  // 3. Loop through Master Games and update stats
  masterGames.forEach((game) => {
    // Skip if already populated (optional, remove this if you want to force overwrite)
    if (game.stats && game.stats.total > 0) return;

    // Find a valid ID to match against
    const targetId = game.linkedVersions?.find(
      (v) => v.npCommunicationId
    )?.npCommunicationId;

    if (targetId && statsMap.has(targetId)) {
      const counts = statsMap.get(targetId);

      // 🟢 Populate Stats
      game.stats = {
        bronze: counts.bronze || 0,
        silver: counts.silver || 0,
        gold: counts.gold || 0,
        platinum: counts.platinum || 0,
        total:
          (counts.bronze || 0) +
          (counts.silver || 0) +
          (counts.gold || 0) +
          (counts.platinum || 0),
      };

      updatedCount++;
    }
  });

  // 4. Save
  fs.writeFileSync(MASTER_JSON_PATH, JSON.stringify(masterGames, null, 2));
  console.log(`\n✅ DONE! Updated stats for ${updatedCount} games.`);
}

run();
