// server/scripts/auditVariants.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join("../data/master_games.json");

function run() {
  const games = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

  // Find games with multiple Playstation versions
  const multiStackGames = games
    .filter((g) => g.platforms?.playstation && g.platforms.playstation.length > 1)
    .map((g) => ({
      name: g.displayName,
      count: g.platforms.playstation.length,
      versions: g.platforms.playstation.map((v) => v.id),
    }));

  // Sort by highest count first (The "Suspicious" ones)
  multiStackGames.sort((a, b) => b.count - a.count);

  console.log(`🔎 Found ${multiStackGames.length} games with multiple stacks.\n`);

  // Print the top 20 "worst offenders" to console
  console.log("🏆 Top 20 Most Stacked Games:");
  multiStackGames.slice(0, 20).forEach((g) => {
    console.log(`   [${g.count}] ${g.name}`);
  });

  // Save full log
  const logPath = path.join("../data/variant_audit.json");
  fs.writeFileSync(logPath, JSON.stringify(multiStackGames, null, 2));
  console.log(`\n📝 Full list saved to: ${logPath}`);
}

run();
