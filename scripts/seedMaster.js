// scripts/seedMaster.js
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  getProfileFromUserName,
} from "psn-api";
import { fileURLToPath } from "url"; // 👈 Required for ES Modules

// 🟢 FIX: Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🟢 Point to .env in root
dotenv.config({ path: path.join(__dirname, "../.env") });

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------
const SEED_USERS = [
  /* ALREADY DONE : "Hakoom",
  "Roughdawg4",
  "L_S_D",
  "G-STARS-77",
  "Stay-at-Home-Mom",
  "Maka91",
   More high-volume accounts (good for seeding lots of titles fast)
  "CloudxValentine",
  "Warped_Tonttu",
  "Bizzy_Montana_",
  "dav1d_123",
  "tusman",
  "rucnik",
  "ikemenzi",
  "timpurnat",
  "Angus1343",
  "TripleHHH_VGR",
  "DarkShadow91",
  "tranquilu",
  "servus99",
  "zappydemon",
  "VirtualNight",
  "Banana_Sausage47",
  "JFC-7-",
  "Cyberdyne-7",
  "chucknorris078",
  "BearlyApple",
  "stevepo", */
  "TheRandomApple", // Confirmed BG:DA 2 Plat (US)
  "pozermobil", // Confirmed Trophy Guide Author
  "Carlo", // Confirmed BG:DA 2 Plat (PS5)
  "kurione_007", // Still worth keeping for other rare stacks
  "Dino_Roar", // High activity hunter
];

// 🟢 Point to master_games.json in the root data folder
const OUTPUT_FILE = path.join(__dirname, "../data/master_games.json");

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 🟢 Polyglot ID Generator
 * Supports Asian/Special characters to prevent "unknown" merges.
 */
function generateCanonicalId(title, npId) {
  const safeTitle = title || "";
  if (safeTitle === "%") return "game_percent";

  const clean = safeTitle
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

  if (!clean || clean.length < 1) {
    return `game_unknown_${npId.toLowerCase()}`;
  }
  return `game_${clean}`;
}

function sanitizePlatform(raw) {
  const p = (raw || "").toUpperCase();
  if (p.includes("PS5")) return "PS5";
  if (p.includes("VITA")) return "PSVITA";
  if (p.includes("PS3")) return "PS3";
  return "PS4";
}

async function authenticate() {
  console.log("🔑 Authenticating with PSN...");
  const npsso = process.env.NPSSO;
  if (!npsso) throw new Error("Missing NPSSO in .env");
  const code = await exchangeNpssoForCode(npsso);
  const token = await exchangeCodeForAccessToken(code);
  console.log("✅ Authenticated!");
  return token;
}

async function fetchWithRetry(url, token, retries = 3) {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "en-US",
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!res.ok) {
      if (res.status === 429) {
        console.warn("⏳ Rate limited... waiting 5s");
        await sleep(5000);
        return fetchWithRetry(url, token, retries - 1);
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    if (retries > 0) {
      await sleep(2000);
      return fetchWithRetry(url, token, retries - 1);
    }
    throw e;
  }
}

async function getAccountId(username, tokenObj) {
  try {
    console.log(`   🔎 Scouting user: ${username}...`);
    const profile = await getProfileFromUserName(tokenObj, username);
    const level = profile.profile?.trophySummary?.level || 0;
    if (level === 0) {
      console.warn(`   ⛔ SKIPPING: ${username} has a private profile.`);
      return null;
    }
    return profile.accountId || profile.profile?.accountId || profile.id;
  } catch (e) {
    console.error(`   ❌ User not found: ${e.message}`);
    return null;
  }
}

async function fetchAllPages(baseUrl, key, tokenStr) {
  let allItems = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
    try {
      const data = await fetchWithRetry(url, tokenStr);
      const page = data[key] || [];
      allItems.push(...page);
      if (page.length < limit) break;
      offset += limit;
      await sleep(500);
    } catch (e) {
      break;
    }
  }
  return allItems;
}

// ---------------------------------------------------------------------------
// MAIN CRAWLER LOGIC
// ---------------------------------------------------------------------------

async function runSeed() {
  const tokenObj = await authenticate();
  const accessTokenStr = tokenObj.accessToken;

  // 1. LOAD MASTER DATABASE
  let masterGames = [];
  const npwrIndex = new Set();
  const canonicalIndex = new Map();

  if (fs.existsSync(OUTPUT_FILE)) {
    console.log("📂 Loading Master Database...");
    masterGames = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    masterGames.forEach((g) => {
      canonicalIndex.set(g.canonicalId, g);
      g.platforms?.playstation?.forEach((p) => npwrIndex.add(p.id));
    });
  }

  for (const username of SEED_USERS) {
    console.log(`\n📡 Scanning User: ${username}...`);
    const accountId = await getAccountId(username, tokenObj);
    if (!accountId) continue;

    const trophyUrl = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles`;
    const trophyTitles = await fetchAllPages(trophyUrl, "trophyTitles", accessTokenStr);

    const gameListUrl = `https://m.np.playstation.com/api/gamelist/v2/users/${accountId}/titles`;
    const gameList = await fetchAllPages(gameListUrl, "titles", accessTokenStr);

    // Art Lookup
    const artMap = new Map();
    gameList.forEach((g) => {
      const masterImg = g.concept?.media?.images?.find((i) => i.type === "MASTER")?.url;
      if (masterImg && g.titleId) artMap.set(g.titleId, masterImg);
    });

    let newGames = 0;
    let newVersions = 0;

    for (const t of trophyTitles) {
      const npId = t.npCommunicationId;

      // SKIP IF ALREADY IN DB
      if (npwrIndex.has(npId)) continue;

      const cId = generateCanonicalId(t.trophyTitleName, npId);
      const art = artMap.get(t.npTitleId) || t.trophyTitleIconUrl;

      const newVersion = {
        id: npId,
        platform: sanitizePlatform(t.trophyTitlePlatform),
        region: "Unknown",
        stats: {
          bronze: t.definedTrophies.bronze,
          silver: t.definedTrophies.silver,
          gold: t.definedTrophies.gold,
          platinum: t.definedTrophies.platinum,
          total:
            t.definedTrophies.bronze +
            t.definedTrophies.silver +
            t.definedTrophies.gold +
            t.definedTrophies.platinum,
        },
      };

      if (canonicalIndex.has(cId)) {
        // ADD AS NEW VERSION TO EXISTING GAME
        const existing = canonicalIndex.get(cId);
        if (!existing.platforms)
          existing.platforms = { playstation: [], xbox: [], steam: [] };
        if (!existing.platforms.playstation) existing.platforms.playstation = [];
        existing.platforms.playstation.push(newVersion);
        newVersions++;
        console.log(`   🔗 Added stack: "${existing.displayName}" (${npId})`);
      } else {
        // CREATE BRAND NEW CANONICAL ENTRY
        const newEntry = {
          canonicalId: cId,
          displayName: t.trophyTitleName,
          art: {
            icon: t.trophyTitleIconUrl,
            master: art,
            storesquare: null,
          },
          platforms: {
            playstation: [newVersion],
            xbox: [],
            steam: [],
          },
          tags: [],
        };
        masterGames.push(newEntry);
        canonicalIndex.set(cId, newEntry);
        newGames++;
      }
      npwrIndex.add(npId);
    }
    console.log(`   ➕ Results: ${newGames} new games, ${newVersions} new stacks.`);
  }

  // Final Sort & Save
  masterGames.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

  // 🟢 Directory Creation Check
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterGames, null, 2));
  console.log(`\n✅ Done! Master DB now has ${masterGames.length} games.`);
}

runSeed();
