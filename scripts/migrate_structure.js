const fs = require("fs");
const path = require("path");

// Paths
const MASTER_JSON_PATH = path.join("../data/master_games.json");
const BACKUP_PATH = path.join("../data/master_games_BACKUP_V1.json");

function run() {
  console.log("🚀 Starting Structure Migration...");

  if (!fs.existsSync(MASTER_JSON_PATH)) {
    console.error("❌ master_games.json not found!");
    return;
  }

  // 1. Load Data
  const games = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, "utf-8"));
  console.log(`📂 Loaded ${games.length} games.`);

  // 2. Create Backup
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(games, null, 2));
  console.log(`💾 Backup created at: ${BACKUP_PATH}`);

  let convertedCount = 0;

  // 3. Transform Data
  games.forEach((game) => {
    if (!game.linkedVersions || !Array.isArray(game.linkedVersions)) return;

    // Create the new dictionary structure
    const platformMap = {};

    game.linkedVersions.forEach((v) => {
      // Normalize Platform Key (e.g., "PS4", "PS5", "PSVITA")
      const platKey = v.platform?.toUpperCase() || "UNKNOWN";

      if (!platformMap[platKey]) {
        platformMap[platKey] = [];
      }

      // Add the simplified version object
      // We prioritize npCommunicationId for PSN, but keep titleId ready for Xbox
      platformMap[platKey].push({
        id: v.npCommunicationId || v.titleId,
        region: v.region || null, // Preserve null if not set
      });
    });

    // 🟢 Apply Transformation
    game.platforms = platformMap;
    delete game.linkedVersions; // Remove the old array
    convertedCount++;
  });

  // 4. Save
  fs.writeFileSync(MASTER_JSON_PATH, JSON.stringify(games, null, 2));
  console.log(`\n✅ MIGRATION COMPLETE!`);
  console.log(`👉 Converted ${convertedCount} games to the new 'platforms' structure.`);
  console.log(`👉 Old 'linkedVersions' array has been removed.`);
}

run();
