// server/scripts/cleanMaster.js
const fs = require("fs");
const path = require("path");

// CONFIG
const INPUT_FILE = path.join("../data/master_games.json");
const OUTPUT_FILE = path.join("../data/master_games_lite.json");

console.log("🧹 Starting Master JSON Cleanup (with Stats Propagation)...");

try {
  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const games = JSON.parse(raw);

  const cleanedGames = games.map((game) => {
    // 1. Create a deep copy
    const clean = { ...game };

    // 2. NUKE THE BLOAT (Trophies & Metadata) 💥
    if (clean.trophies) delete clean.trophies;
    if (clean.enrichedAt) delete clean.enrichedAt;
    if (clean.developerId) delete clean.developerId;

    // NOTE: We do NOT delete 'clean.stats' yet. We need it for the loop below.

    // 3. Normalize Art (Move root iconUrl into art object if missing)
    if (!clean.art) clean.art = {};
    if (clean.iconUrl && !clean.art.icon) {
      clean.art.icon = clean.iconUrl;
    }
    delete clean.iconUrl;

    // 4. Restructure Platforms (Inject Stats here!)
    if (clean.platforms) {
      const newPlatforms = { playstation: [], xbox: [], steam: [] };

      // Migrate PS4/PS5 keys to 'playstation' array
      ["PS4", "PS5", "PS3", "Vita"].forEach((consoleKey) => {
        if (clean.platforms[consoleKey]) {
          clean.platforms[consoleKey].forEach((item) => {
            // 🟢 CRITICAL FIX: Propagate stats to the platform entry
            newPlatforms.playstation.push({
              id: item.id,
              platform: consoleKey,
              region: item.region || "Global",
              stats: game.stats || { total: 0 }, // Fallback if missing
            });
          });
        }
      });

      // Replace old structure
      if (newPlatforms.playstation.length > 0) {
        clean.platforms = newPlatforms;
      }
    }

    // 5. Final Cleanup (Now we can remove the root stats)
    if (clean.stats) delete clean.stats;

    return clean;
  });

  // 6. Save the Lite File
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedGames, null, 2));

  console.log(`✅ Success! Processed ${cleanedGames.length} games.`);
  console.log(`📊 Stats data successfully propagated to platform entries.`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
} catch (err) {
  console.error("❌ Error during cleanup:", err);
}
