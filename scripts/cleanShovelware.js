// server/scripts/cleanShovelware.js
const fs = require("fs");
const path = require("path");

// CONFIG
const INPUT_FILE = path.join("../data/master_shovelware.json");
const OUTPUT_FILE = path.join("../data/master_shovelware_lite.json");

console.log("🧹 Starting Shovelware JSON Cleanup...");

try {
  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const games = JSON.parse(raw);

  const cleanedGames = games.map((game) => {
    // 1. Create a deep copy
    const clean = { ...game };

    // 2. MIGRATION: linkedVersions -> platforms.playstation
    if (clean.linkedVersions && Array.isArray(clean.linkedVersions)) {
      const psList = clean.linkedVersions.map((v) => ({
        id: v.npCommunicationId, // Map npCommunicationId -> id
        platform: v.platform || "PS4", // Default to PS4 if missing
        region: v.region || "Global", // Default to Global
      }));

      clean.platforms = {
        playstation: psList,
        xbox: [],
        steam: [],
      };

      // Remove the old key
      delete clean.linkedVersions;
    }

    // 3. VISUALS: Normalize 'square' -> 'icon'
    if (clean.art) {
      if (clean.art.square && !clean.art.icon) {
        clean.art.icon = clean.art.square;
      }
      delete clean.art.square; // Remove old key
    }

    // 4. STATS: Promote 'hasPlatinum' (Crucial for Shovelware)
    // We remove the heavy 'stats' object, but keep 'hasPlatinum' at the root
    // because that is the main reason people search for these games.
    if (clean.stats) {
      if (clean.stats.hasPlatinum !== undefined) {
        clean.hasPlatinum = clean.stats.hasPlatinum;
      }
      delete clean.stats; // Delete the rest of the stats object
    }

    // 5. CLEANUP: Remove Useless/Null Fields
    delete clean.sagaId;
    delete clean.developerId;

    // Clean up 'meta' object (remove null values)
    if (clean.meta) {
      Object.keys(clean.meta).forEach((key) => {
        if (clean.meta[key] === null) {
          delete clean.meta[key];
        }
      });
      // If meta is now empty, you could delete it, but keeping it is safer for Typescript
    }

    return clean;
  });

  // 6. Save the Lite File
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedGames, null, 2));

  console.log(`✅ Success! Processed ${cleanedGames.length} shovelware titles.`);
  console.log(`✨ Converted 'linkedVersions' to new 'platforms' format.`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
} catch (err) {
  console.error("❌ Error during cleanup:", err);
}
