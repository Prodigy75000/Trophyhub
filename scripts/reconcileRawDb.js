// server/scripts/reconcileRawDb.js
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------
// ⚙️ CONFIG
// ---------------------------------------------------------
const RAW_DB_PATH = path.join("../data/raw_master_db.json");
const MASTER_DB_PATH = path.join("../data/master_games.json");
const LOG_OUTPUT_PATH = path.join("../data/added_games_log.json");

// ---------------------------------------------------------
// 🛠️ HELPERS
// ---------------------------------------------------------

/**
 * Generates a clean ID for new games.
 * 🟢 FIX: Requires npId as the second argument for the fallback.
 */
function generateCanonicalId(title, npId) {
  // Safety check: if title is null/undefined, treat as empty string
  const safeTitle = title || "";

  const clean = safeTitle
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9]/g, "");

  // 🟢 SAFETY NET: If the name is destroyed (Asian/Symbol games), use the unique ID.
  // We use the NPID to ensure every "unknown" game gets its own entry.
  if (!clean || clean.length < 2) {
    if (!npId) return `game_unknown_error_${Math.random().toString(36).substring(7)}`;
    return `game_unknown_${npId.toLowerCase()}`;
  }

  return `game_${clean}`;
}

/**
 * Standardizes the platform string
 */
function sanitizePlatform(rawPlatform) {
  if (!rawPlatform) return "PS4";
  const p = rawPlatform.toUpperCase();
  if (p.includes("VITA")) return "PSVITA";
  if (p.includes("PS3")) return "PS3";
  if (p.includes("PS5")) return "PS5";
  return "PS4";
}

// ---------------------------------------------------------
// 🚀 MAIN LOGIC
// ---------------------------------------------------------
async function run() {
  console.log("🔄 Starting Database Reconciliation...");

  // 1. LOAD DATA
  if (!fs.existsSync(RAW_DB_PATH)) {
    console.error(`❌ Missing Raw DB: ${RAW_DB_PATH}`);
    return;
  }
  if (!fs.existsSync(MASTER_DB_PATH)) {
    console.error(`❌ Missing Master DB: ${MASTER_DB_PATH}`);
    return;
  }

  const rawGames = JSON.parse(fs.readFileSync(RAW_DB_PATH, "utf8"));
  const masterGames = JSON.parse(fs.readFileSync(MASTER_DB_PATH, "utf8"));

  console.log(`📂 Loaded Raw Source:   ${rawGames.length} entries`);
  console.log(`📂 Loaded Master DB:    ${masterGames.length} entries`);

  // 2. INDEXING (Fast Lookups)
  const npwrIndex = new Map();
  const titleIndex = new Map();

  masterGames.forEach((game) => {
    if (game.canonicalId) titleIndex.set(game.canonicalId, game);

    if (game.platforms && game.platforms.playstation) {
      game.platforms.playstation.forEach((v) => {
        npwrIndex.set(v.id, v);
      });
    }
  });

  // 3. TRACKING
  const addedLog = [];
  let statsUpdatedCount = 0;
  let newVersionsCount = 0;
  let newGamesCount = 0;

  // 4. ITERATE RAW DATA
  for (const raw of rawGames) {
    const npId = raw.npCommunicationId;
    if (!npId) continue;

    // --- CHECK 1: DOES NPWR EXIST? ---
    if (npwrIndex.has(npId)) {
      const existingVersion = npwrIndex.get(npId);

      const rawTotal =
        (raw.trophyCount?.bronze || 0) +
        (raw.trophyCount?.silver || 0) +
        (raw.trophyCount?.gold || 0) +
        (raw.trophyCount?.platinum || 0);

      const currentTotal = existingVersion.stats?.total || 0;

      if (currentTotal === 0 && rawTotal > 0) {
        existingVersion.stats = {
          bronze: raw.trophyCount?.bronze || 0,
          silver: raw.trophyCount?.silver || 0,
          gold: raw.trophyCount?.gold || 0,
          platinum: raw.trophyCount?.platinum || 0,
          total: rawTotal,
        };
        statsUpdatedCount++;
      }
      continue;
    }

    // --- CHECK 2: DOES TITLE EXIST? ---
    // 🟢 CRITICAL FIX: Passing 'npId' as the second argument here!
    const proposedCanonicalId = generateCanonicalId(raw.titleName, npId);

    const newVersionObj = {
      id: npId,
      platform: sanitizePlatform(raw.platform),
      region: "Unknown",
      stats: {
        bronze: raw.trophyCount?.bronze || 0,
        silver: raw.trophyCount?.silver || 0,
        gold: raw.trophyCount?.gold || 0,
        platinum: raw.trophyCount?.platinum || 0,
        total:
          (raw.trophyCount?.bronze || 0) +
          (raw.trophyCount?.silver || 0) +
          (raw.trophyCount?.gold || 0) +
          (raw.trophyCount?.platinum || 0),
      },
    };

    if (titleIndex.has(proposedCanonicalId)) {
      // Add as new version/stack
      const existingGame = titleIndex.get(proposedCanonicalId);

      if (!existingGame.platforms)
        existingGame.platforms = { playstation: [], xbox: [], steam: [] };
      if (!existingGame.platforms.playstation) existingGame.platforms.playstation = [];

      existingGame.platforms.playstation.push(newVersionObj);
      newVersionsCount++;
    } else {
      // Create NEW Canonical Game
      const newGameEntry = {
        canonicalId: proposedCanonicalId,
        displayName: raw.titleName || "Unknown Game",
        art: {
          icon: raw.iconUrl || raw.masterArtUrl,
          master: raw.masterArtUrl,
          storesquare: null,
        },
        platforms: {
          playstation: [newVersionObj],
          xbox: [],
          steam: [],
        },
        tags: [],
      };

      masterGames.push(newGameEntry);
      titleIndex.set(proposedCanonicalId, newGameEntry);
      newGamesCount++;

      addedLog.push({
        name: raw.titleName,
        id: npId,
        canonical: proposedCanonicalId,
      });
    }
  }

  // 5. SAVE
  fs.writeFileSync(MASTER_DB_PATH, JSON.stringify(masterGames, null, 2));
  fs.writeFileSync(LOG_OUTPUT_PATH, JSON.stringify(addedLog, null, 2));

  console.log("\n✅ Reconciliation Complete!");
  console.log("-----------------------------------");
  console.log(`📊 Stats Backfilled:    ${statsUpdatedCount}`);
  console.log(`🔗 New Stacks/Versions: ${newVersionsCount}`);
  console.log(`🆕 Brand New Games:     ${newGamesCount}`);
  console.log("-----------------------------------");
  console.log(`📝 Log saved to: ${LOG_OUTPUT_PATH}`);
}

run();
