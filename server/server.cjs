// server/server.cjs
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// 🟢 CONTROLLERS (The Logic)
const xboxController = require("./controllers/xboxController");
const authController = require("./controllers/authController");
const trophyController = require("./controllers/trophyController");

// 🟢 REPOSITORIES (The Data)
const { listGames } = require("./repositories/gamesRepo");

// 🟢 UTILS
const { fetchPSN } = require("./utils/psnClient");

// Load env from project root (go up one level)
dotenv.config({ path: "../.env" });

const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: "*", allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// Auth Guard: Extracts Bearer token
function requireBearer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    req.accessToken = authHeader.split(" ")[1];
  }
  next();
}

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

// 1. MASTER DB (MongoDB)
app.get("/api/games", async (req, res) => {
  const games = await listGames();
  res.json(games);
});

// 2. AUTHENTICATION (PSN)
app.post("/api/auth/refresh", authController.refreshPsnToken);
app.post("/api/auth/npsso", authController.exchangeNpsso);

// 3. XBOX ROUTES (Standardized to /api/xbox)
app.post("/api/xbox/titles", xboxController.fetchXboxTitles);
app.post("/api/xbox/exchange", xboxController.exchangeXboxToken);

// 4. USER DATA (PSN Profile & Summary)
// Kept inline for now as they are simple proxy fetches
app.get("/api/user/profile/:accountId", requireBearer, async (req, res) => {
  try {
    const url = `https://m.np.playstation.com/api/userProfile/v1/internal/users/${req.params.accountId}/profiles`;
    const json = await fetchPSN(url, req.accessToken);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/summary/:accountId", requireBearer, async (req, res) => {
  try {
    const url = `https://m.np.playstation.com/api/trophy/v1/users/${req.params.accountId}/trophySummary`;
    const json = await fetchPSN(url, req.accessToken);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. TROPHIES
app.get("/api/trophies/:accountId", requireBearer, trophyController.getGameList);
app.get(
  "/api/trophies/:accountId/:npCommunicationId",
  requireBearer,
  trophyController.getGameDetails
);

// 404 Handler
app.use((req, res) => {
  console.log(`⚠️  404: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not found", path: req.url });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
