const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 🔴 CONFIGURATION
// Generate a new token using 'node get_token.js' and paste it here
const ACCESS_TOKEN =
  "eyJraWQiOiJucF8xIiwiYWxnIjoiUlMyNTYifQ.eyJhY2NvdW50X2lkIjoiNjI2NDc4MzYyNTU5ODY5MzAzMiIsImFjY291bnRfdXVpZCI6ImY0OGYxZTYwLTE3OWQtNDdkYi04YjI5LWJjNzNhZmY2YWNiYyIsImFnZSI6MzQsImF1dGh6X2MiOiJlTnFWVlZHTzR6WU12WW94QnpEUTlrOS91eWs2S05BcEZwc0RHSXBNMit6SWtpRFNubkdMM3IyVVpEdWVUR1ozKzVYbzhZVjZJaCtaZng3SStBQVA2a0VieGhrWmdkUkVFRCtWNDFLblF6MzZDMXFvWjRTWHltaW5qQjlIN2RvUzdJSGZnN1NEanVHVmI1a0hzREJaVzk4clJyWkFuMCtGR1lnVU9sRUIrZHpDakFaVStncXZ3Zm9vMy9VSVZCOFJZaDl4eFZMMENWclVaNGo1cDhiNnFjM0lvN1lXNHZJQnpUdnk4bHdKb092LzhKUHJvWjVDcXhtcUkvWVkvUlJLdWJZS3JmbStSVW52SGNDRzgwSU1venI4RU51Ry9UTTRwZHZKY2pORHhBNmxOT2hkUTZ4NW9nT2xoK3ZoZ3BHSExHK0hjb2tkTjRhanZhSklqUm5RdGxmRU80c09HaFRJUFVvaFBsMXRjR3c2U2pacnNRZG40SXZWM1BrNHF2RFRMNjRJdnhjbDZFZFJzQk1pRUo5MDRFbTZkQ2pGc3g3MVg2aU1qdHhjcHNYNWx6dFFFeUprSGNmUUxTYjJnMmlnY1ZLeEdUWTRkYmV4U1B0Tm9xZkplcHkyalFoTWxrdENhU01rOG42SXJjMHZPQnpKRENBTmdpTzJ1bU5GcG1oM2RkWXYydktTTFZBNWVLSGZBRnFWQmFTUkU2dlZGcCtoOG5yaVFla1FvcCtoU1FmWE1KcG51YnVFSXVqMkJnL2dwSEhCNmdYaVY4Z0ZjRzMyQzZtQ2xrRUlKRU5YeHVkMzEvbE5iWWFUcmk4Uk91bVBkTzhhRWd0WmxMS0lvbnphM1BCemJXVE9xakRSOEtmbjNhRHFCUzVubjJSdFBoY0hPakJjN2JsL2xTRy9qdGprT0M0bjd6cnM2L1MwS3JMNUhMSHRRYzFlS0tkQjg1NkRkQWRTdzlYVXRaYldMWDlEUlJjOTdNckVndEpIU1ZvUG1vYUtUQVJ3TkdpeFcyNEVnWTVtVU91cXlYVlpJZklHdFYwUklubk5rOXpRUTFSQmZMYWNDMVpUSHRpdFFyZk1YTzRiNm1HMi93ZDl2NEJaOWdncDMzV25kU01WYTY4SlB3eUhTY0w1VGRzV0x3dm9qcXJwSW5YQ1VDemp5MmVKWk82VENCUzlhaXlmZGRwQ1VOYjJwdkl1YjkvMmJFZ1dRZTU1TFU2cXBTbnBWd2srU3RyZzZNT3dLQzA3Q3VZOGxFZXhhN1NGRGgwbXBYZUNJZUtzelhJbmtxNDdsNXI5V0hSOTRPVEU0OUJ1bFh6eWFmVGY3RVpoelBDcTVCOUlGbmJlSkRselNpbFB5VTZ2TlhQRXk4VHl6elJyaXlYekc0SU1kbHBHWlpwRVF3dnZzNlFKbDl0V3puZkNtLzRQR1Y5bElVZk1PK2ljLzEzZVozd0hiSzZydDBKdmpEZTd3QjBPZHp6emJmN3VuYktaZkNlRi9zaS8zNkdVK3g3Ky9ROUJ0bk9SIiwiY2xpZW50X2lkIjoiMDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxIiwiZGNpbV9pZCI6ImNlMmZlODJkLTJjOWUtNGI1OC05Y2JmLWM1OWZjM2E4NmU0NSIsImVudl9pc3NfaWQiOiIyNTYiLCJleHAiOjE3NzA1NzY0ODQsImdyYW50X3R5cGUiOiJhdXRob3JpemF0aW9uX2NvZGUiLCJpYXQiOjE3NzA1NzI4ODQsImlzX2NoaWxkIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmFjY291bnQuc29ueS5jb20vIiwianRpIjoiOTUxNGFkZTYtZWE5Yi00NGNlLWIwMTYtYjBiMjM0ZWU5OWYwIiwibGVnYWxfY291bnRyeSI6IkZSIiwibG9jYWxlIjoiZnItRlIiLCJ1c2VyX2RldmljZV9pcCI6Ijg2LjI1Mi40Mi4yNDIiLCJ2ZXIiOiIyIn0.LzENrvHYLy8bJdNXC7Njv6OpiDDCIw-WdNw6b5onEK0VoU1-O2tpNAlFmuUswHwXuLgo4wWk3Y1hgrm9jgQ9Wer54ERetgABte9qIxcmj7I0fufofv-CCmpW9B1SlSofio-pqKEVnWuiXARriw5XlY8Mvt7ocvZHMv3NJipgqwvRfDUHMhN9HAoLHJBMxSpTDlc_jnkJsm9ixohX_5HBkpjsg6H3Ay8Fp2iCn6dOpGyONRSVezQ_x5yvV2Y0LXK8Q6Kb1o38-jjqLnPpu5wZzBT0bmziZ7xSf-aMCyL3zvtAlv2TZkJKm6Z3fI5hJo8VEa-SucjInDSgQoAsbb0RSfgo1tOtfpN-aFDmTn-4TjuWL8j2ybZoGJxzX45BWc_VZKkwPvTP5XLZAtgIy3Q0C8s7_R7o0A9Cgff1uTkfz4H4oozLwUumADU13akhnKsV8YB74ATfA2JLDXVz0iknVCg6FeIAZm5ySOFF-G8Vzi9cRwz0-PUL4eFPbKpwtgqV";

const MASTER_JSON_PATH = path.join("../data/master_games.json");
const SAVE_INTERVAL = 20; // Save to disk every 20 games

// ---------------------------------------------------------------------------

async function fetchTrophyCounts(npCommunicationId) {
  try {
    const url = `https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${npCommunicationId}/trophyGroups`;

    // Random delay between 100ms and 300ms to avoid rate limiting
    const delay = Math.floor(Math.random() * 200) + 100;
    await new Promise((r) => setTimeout(r, delay));

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US",
      },
    });

    const groups = res.data.trophyGroups || [];

    // Calculate Totals
    let stats = { bronze: 0, silver: 0, gold: 0, platinum: 0, total: 0 };

    groups.forEach((g) => {
      stats.bronze += g.definedTrophies.bronze || 0;
      stats.silver += g.definedTrophies.silver || 0;
      stats.gold += g.definedTrophies.gold || 0;
      stats.platinum += g.definedTrophies.platinum || 0;
    });

    stats.total = stats.bronze + stats.silver + stats.gold + stats.platinum;
    return stats;
  } catch (err) {
    if (err.response?.status === 404) return "NOT_FOUND";
    if (err.response?.status === 401) return "EXPIRED";
    if (err.response?.status === 429) return "RATE_LIMIT";
    console.warn(`⚠️ Error fetching ${npCommunicationId}:`, err.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Starting Smart Stats Population...");

  if (!fs.existsSync(MASTER_JSON_PATH)) {
    console.error("❌ master_games.json not found!");
    return;
  }

  // Load Database
  let games = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, "utf-8"));
  let updatedCount = 0;
  let skippedCount = 0;

  // Helper to save progress
  const saveDatabase = () => {
    fs.writeFileSync(MASTER_JSON_PATH, JSON.stringify(games, null, 2));
    console.log(`💾 Checkpoint saved. (${updatedCount} updated this session)`);
  };

  // Loop through games
  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    // 🟢 1. ROBUST SKIP LOGIC
    // We check if 'stats.bronze' exists. If it does, we already fixed this game.
    if (game.stats && game.stats.bronze !== undefined) {
      skippedCount++;
      continue; // Skip silently to speed up startup
    }

    // Find ID
    const targetId = game.linkedVersions?.find(
      (v) => v.npCommunicationId
    )?.npCommunicationId;

    if (!targetId) {
      // console.log(`⏭️ Skipping ${game.displayName} (No ID)`);
      continue;
    }

    // Log progress
    process.stdout.write(`🔄 [${i}/${games.length}] Fetching: ${game.displayName}... `);

    // Fetch
    const result = await fetchTrophyCounts(targetId);

    // 🔴 2. HANDLE TOKEN EXPIRATION
    if (result === "EXPIRED") {
      console.log("\n\n❌ TOKEN EXPIRED!");
      console.log("⚠️ Saving progress before exiting...");
      saveDatabase();
      console.log(
        "👉 ACTION: Run 'node get_token.js', update the script, and run it again.\n"
      );
      process.exit(1);
    }

    // Handle Rate Limiting (Too many requests)
    if (result === "RATE_LIMIT") {
      console.log("\n⚠️ Rate Limit Hit. Sleeping for 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
      i--; // Retry this game
      continue;
    }

    if (result && result !== "NOT_FOUND") {
      // Update Game
      game.stats = result;
      updatedCount++;
      process.stdout.write(`✅ Done (${result.total}T)\n`);

      // 💾 3. SAVE FREQUENTLY
      if (updatedCount % SAVE_INTERVAL === 0) {
        saveDatabase();
      }
    } else {
      process.stdout.write(`❌ No Data\n`);
    }
  }

  // Final Save
  saveDatabase();
  console.log(`\n🎉 COMPLETELY FINISHED! Checked ${games.length} games.`);
}

run();
