// scripts/sync-metadata.js
const fs = require("fs");
const path = require("path");

// Paths to your data files
const MASTER_GAMES_PATH = path.join("../data/master_games.json");
const SAGA_PATH = path.join("../data/saga.json");

/**
 * Clean and update master_games.json
 */
function updateMasterGames() {
  if (!fs.existsSync(MASTER_GAMES_PATH)) {
    console.error("❌ master_games.json not found!");
    return;
  }

  const data = JSON.parse(fs.readFileSync(MASTER_GAMES_PATH, "utf8"));

  const cleanedData = data.map((game) => {
    // 1. Remove the "automated slop" sagaId field
    if (game.sagaId) {
      delete game.sagaId;
    }

    // 2. Ensure developerId exists for your manual curation
    if (game.developerId === undefined) {
      game.developerId = "";
    }

    return game;
  });

  fs.writeFileSync(MASTER_GAMES_PATH, JSON.stringify(cleanedData, null, 2));
  console.log("✅ master_games.json: Removed 'sagaId' and initialized 'developerId'.");
}

/**
 * Clean and update saga.json
 */
function updateSagas() {
  if (!fs.existsSync(SAGA_PATH)) {
    console.log("⚠️ saga.json not found. Creating a clean template...");
    const template = [
      {
        sagaId: "gta-mainline",
        displayName: "Grand Theft Auto",
        developerId: "rockstar-games",
        members: [],
      },
    ];
    fs.writeFileSync(SAGA_PATH, JSON.stringify(template, null, 2));
    return;
  }

  const data = JSON.parse(fs.readFileSync(SAGA_PATH, "utf8"));

  const updatedData = data.map((saga) => {
    // Ensure developerId exists at the Saga level too
    if (saga.developerId === undefined) {
      saga.developerId = "";
    }
    return saga;
  });

  fs.writeFileSync(SAGA_PATH, JSON.stringify(updatedData, null, 2));
  console.log("✅ saga.json: Initialized 'developerId' fields.");
}

// Execute
console.log("🚀 Starting data cleanup...");
updateMasterGames();
updateSagas();
console.log("✨ Cleanup complete. You can now curate your IDs by hand.");
