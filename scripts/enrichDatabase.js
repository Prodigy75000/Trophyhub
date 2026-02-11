// server/scripts/enrichDatabase.js
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// ---------------------------------------------------------
// 🔑 CONFIGURATION
// ---------------------------------------------------------
const ACCESS_TOKEN =
  "eyJraWQiOiJucF8xIiwiYWxnIjoiUlMyNTYifQ.eyJhY2NvdW50X2lkIjoiNjI2NDc4MzYyNTU5ODY5MzAzMiIsImFjY291bnRfdXVpZCI6ImY0OGYxZTYwLTE3OWQtNDdkYi04YjI5LWJjNzNhZmY2YWNiYyIsImFnZSI6MzQsImF1dGh6X2MiOiJlTnFWVlZHTzR6WU12WW94QnpEUTlrOS91eWs2S05BcEZwc0RHSXBNMit6SWtpRFNubkdMM3IyVVpEdWVUR1ozKzVYbzhZVjZJaCtaZng3SStBQVA2a0VieGhrWmdkUkVFRCtWNDFLblF6MzZDMXFvWjRTWHltaW5qQjlIN2RvUzdJSGZnN1NEanVHVmI1a0hzREJaVzk4clJyWkFuMCtGR1lnVU9sRUIrZHpDakFaVStncXZ3Zm9vMy9VSVZCOFJZaDl4eFZMMENWclVaNGo1cDhiNnFjM0lvN1lXNHZJQnpUdnk4bHdKb092LzhKUHJvWjVDcXhtcUkvWVkvUlJLdWJZS3JmbStSVW52SGNDRzgwSU1venI4RU51Ry9UTTRwZHZKY2pORHhBNmxOT2hkUTZ4NW9nT2xoK3ZoZ3BHSExHK0hjb2tkTjRhanZhSklqUm5RdGxmRU80c09HaFRJUFVvaFBsMXRjR3c2U2pacnNRZG40SXZWM1BrNHF2RFRMNjRJdnhjbDZFZFJzQk1pRUo5MDRFbTZkQ2pGc3g3MVg2aU1qdHhjcHNYNWx6dFFFeUprSGNmUUxTYjJnMmlnY1ZLeEdUWTRkYmV4U1B0Tm9xZkplcHkyalFoTWxrdENhU01rOG42SXJjMHZPQnpKRENBTmdpTzJ1bU5GcG1oM2RkWXYydktTTFZBNWVLSGZBRnFWQmFTUkU2dlZGcCtoOG5yaVFla1FvcCtoU1FmWE1KcG51YnVFSXVqMkJnL2dwSEhCNmdYaVY4Z0ZjRzMyQzZtQ2xrRUlKRU5YeHVkMzEvbE5iWWFUcmk4Uk91bVBkTzhhRWd0WmxMS0lvbnphM1BCemJXVE9xakRSOEtmbjNhRHFCUzVubjJSdFBoY0hPakJjN2JsL2xTRy9qdGprT0M0bjd6cnM2L1MwS3JMNUhMSHRRYzFlS0tkQjg1NkRkQWRTdzlYVXRaYldMWDlEUlJjOTdNckVndEpIU1ZvUG1vYUtUQVJ3TkdpeFcyNEVnWTVtVU91cXlYVlpJZklHdFYwUklubk5rOXpRUTFSQmZMYWNDMVpUSHRpdFFyZk1YTzRiNm1HMi93ZDl2NEJaOWdncDMzV25kU01WYTY4SlB3eUhTY0w1VGRzV0x3dm9qcXJwSW5YQ1VDemp5MmVKWk82VENCUzlhaXlmZGRwQ1VOYjJwdkl1YjkvMmJFZ1dRZTU1TFU2cXBTbnBWd2srU3RyZzZNT3dLQzA3Q3VZOGxFZXhhN1NGRGgwbXBYZUNJZUtzelhJbmtxNDdsNXI5V0hSOTRPVEU0OUJ1bFh6eWFmVGY3RVpoelBDcTVCOUlGbmJlSkRselNpbFB5VTZ2TlhQRXk4VHl6elJyaXlYekc0SU1kbHBHWlpwRVF3dnZzNlFKbDl0V3puZkNtLzRQR1Y5bElVZk1PK2ljLzEzZVozd0hiSzZydDBKdmpEZTd3QjBPZHp6emJmN3VuYktaZkNlRi9zaS8zNkdVK3g3Ky9ROUJ0bk9SIiwiY2xpZW50X2lkIjoiMDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxIiwiZGNpbV9pZCI6ImNlMmZlODJkLTJjOWUtNGI1OC05Y2JmLWM1OWZjM2E4NmU0NSIsImVudl9pc3NfaWQiOiIyNTYiLCJleHAiOjE3NzA3Njk4NTIsImdyYW50X3R5cGUiOiJhdXRob3JpemF0aW9uX2NvZGUiLCJpYXQiOjE3NzA3NjYyNTIsImlzX2NoaWxkIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmFjY291bnQuc29ueS5jb20vIiwianRpIjoiNTNjZTdiYWEtM2VmOC00ZDQxLWE0MDUtZjgwNDJlMmVhMmRjIiwibGVnYWxfY291bnRyeSI6IkZSIiwibG9jYWxlIjoiZnItRlIiLCJ1c2VyX2RldmljZV9pcCI6Ijg2LjI1Mi40Mi4yNDIiLCJ2ZXIiOiIyIn0.FyFUlZDPMeniBOdi1GXoHOehhFHENoJrO81zxFZAVX0u3pcJY-NrsVgJ97zz1OJ-VQilFJ6LyC3g9gJRBcn7gu87Kc_PutOVbKP2sIoO58BMFiuWOfWSvt9gOMqMsoEFnXUbxg_WnY51OFrD6URXmk9vv1VRWDu3kWSHjY_BBcTwBiB2GFvhCg_jPcIhaei_Ry81b0c1IBaM1cb_tCcKehNL_ptDKKMRnLIBTOjG5htytAHqBKHf0-xR_f1Y4RDLIIp_HBcgx3JjAfz_A-t7E_LcNxhpESmjfmz22u7FTMWn-nj5bV4FxfyFR4iD1n3xUsMjTe0d7NilAvdHC1GjWdKfQLosP4FCLFYVCchqNvbSnoMDFFaNdeCKCSmj4ez-ejORAMQkQLUU2-vpbp0B_2GxDc1e1lvBe8dq6LIoZ9B8rs6PvbVnSxwBQDcAu21g6oAuxnIkz_cNpr3EDuHzPmhhMjq19wsCL1yDAvT-WYi7Z1Wm9d1wTWiIqEmLcz73";

// Fix path to point to your master file
const DB_PATH = path.join("../data/master_games.json");

const DELAY_MS = 1500; // Slower is better for deep searches
const BATCH_SIZE = 50;

// 🟢 REGION CONFIG (Critical for FR Store)
const REGION = "FR";
const LANGUAGE = "fr";

// ---------------------------------------------------------
// 🛠️ HELPERS
// ---------------------------------------------------------

function sanitizeSafe(title) {
  return (
    title
      .replace(/[™®©]/g, "")
      // Keep dots for things like .hack, but remove other strict symbols
      .replace(/[^a-zA-Z0-9\s.]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Universal Search (Uncensored)
 */
async function searchStore(query) {
  const url = `https://m.np.playstation.com/api/search/v1/universalSearch`;

  const body = {
    searchTerm: query,
    // 🟢 CRITICAL FIX: AGE LIMIT 99
    // Without this, API returns 0 results for M-rated games like Prototype
    ageLimit: 99,
    domainRequests: [
      {
        // Legacy Database (Often finds "Prototype" when MobileApp fails)
        domain: "MetadatabaseGame",
        pagination: { pageSize: 5, offset: 0 },
      },
      {
        // Modern App Database
        domain: "ConceptGameMobileApp",
        pagination: { pageSize: 5, offset: 0 },
      },
    ],
    countryCode: REGION,
    languageCode: LANGUAGE,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "User-Agent": "TrophyApp/1.0.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("TOKEN_EXPIRED");
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 403) throw new Error("FORBIDDEN_STORE_ACCESS");
    return [];
  }

  const data = await res.json();

  console.dir(data.domainResponses, { depth: 4 });

  const metaResults = data.domainResponses?.[0]?.results || [];
  const mobileResults = data.domainResponses?.[1]?.results || [];

  // Combine unique results
  return [...metaResults, ...mobileResults];
}

function cleanTitleForMatching(title) {
  if (!title) return "";
  let s = title.toLowerCase();
  s = s.replace(/[™®©]/g, "");
  const junk = [
    "definitive",
    "edition",
    "director's",
    "cut",
    "digital",
    "deluxe",
    "standard",
    "goty",
    "remastered",
    "remake",
    "bundle",
    "ps4",
    "ps5",
    "full",
    "game",
  ];
  junk.forEach((j) => (s = s.replace(j, "")));
  return s.replace(/[^a-z0-9]/g, "").trim();
}

function extractArt(concept) {
  if (!concept.media?.images) return null;
  const images = concept.media.images;
  const master = images.find((i) => i.type === "MASTER")?.url;
  const square =
    images.find((i) => i.type === "SQUARE_ICON")?.url ||
    images.find((i) => i.type === "ICON")?.url;
  if (!master && !square) return null;
  return { master, square };
}

// ---------------------------------------------------------
// 🚀 MAIN LOOP
// ---------------------------------------------------------
async function run() {
  console.log(`💎 Starting Intelligent Enrichment (v7 - Uncensored)...`);

  if (ACCESS_TOKEN.length < 50) {
    console.error("❌ ERROR: Please paste a valid Access Token.");
    return;
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ ERROR: File not found at ${DB_PATH}`);
    return;
  }

  const raw = fs.readFileSync(DB_PATH, "utf8");
  const games = JSON.parse(raw);

  let updatedCount = 0;
  let processedCount = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (processedCount >= BATCH_SIZE) break;

    if (game.tags && game.tags.includes("shovelware")) continue;
    if (game.art?.storesquare) continue;

    const query = sanitizeSafe(game.displayName);
    console.log(`\n🔍 Searching: [${game.displayName}] -> "${query}"`);

    try {
      const results = await searchStore(query);

      // LOGGING
      if (results.length > 0) {
        // Show names found to debug matching
        const names = results
          .slice(0, 3)
          .map((r) => `"${r.name}"`)
          .join(", ");
        console.log(`   🔎 Found: ${names}`);
      } else {
        console.log(`   ❌ 0 results.`);
      }

      // MATCHING LOGIC
      const targetClean = cleanTitleForMatching(game.displayName);
      const bestMatch = results.find((r) => {
        const resultClean = cleanTitleForMatching(r.name);
        if (resultClean === targetClean) return true;
        // Check containment (A in B or B in A)
        if (
          resultClean.includes(targetClean) &&
          resultClean.length < targetClean.length + 15
        )
          return true;
        if (
          targetClean.includes(resultClean) &&
          targetClean.length < resultClean.length + 15
        )
          return true;
        return false;
      });

      if (bestMatch) {
        const newArt = extractArt(bestMatch);
        if (newArt) {
          if (!game.art) game.art = {};
          game.art.storesquare = newArt.square;
          game.art.hero = newArt.master;
          if (!game.art.icon) game.art.icon = newArt.square;
          console.log(`   ✅ MATCHED: "${bestMatch.name}"`);
          updatedCount++;
        }
      } else {
        // Only log "No match" if we actually found candidates but rejected them
        if (results.length > 0) {
          console.log(
            `   ⚠️  Found candidates, but fuzzy match failed. (Target: ${targetClean})`
          );
        }
      }

      processedCount++;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (err) {
      if (err.message === "TOKEN_EXPIRED") {
        console.error("🚨 Token Expired!");
        break;
      }
      console.error("   ❌ Error:", err.message);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(DB_PATH, JSON.stringify(games, null, 2));
    console.log(`\n💾 Saved ${updatedCount} updates.`);
  }
}

run();
