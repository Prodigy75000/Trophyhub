// server.cjs
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Buffer } = require("buffer");

// 🟢 NEW IMPORTS
const { fetchPSN } = require("./psnClient");
const trophyController = require("./trophyController");
// Mongo db
const { listGames } = require("../src/repositories/gamesRepo");

// PSN Library Imports
const {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
} = require("psn-api");

// Config
dotenv.config();
const AZURE_CLIENT_ID = "5e278654-b281-411b-85f4-eb7fb056e5ba";

const app = express();
// Mongo DB Route
app.get("/api/games", async (req, res) => {
  const games = await listGames();
  res.json(games);
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log(`🔔 SERVER HIT: ${req.method} ${req.url}`);
  next();
});

// Auth Guard
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

// 🟢 1. XBOX ROUTES
app.post("/xbox/titles", async (req, res) => {
  const { xuid, xstsToken, userHash } = req.body;
  if (!xuid || !xstsToken || !userHash) {
    return res.status(400).json({ error: "Missing Xbox credentials" });
  }
  try {
    console.log(`⏳ Fetching Xbox Games for ${xuid}...`);
    const url = `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/scid,image,detail`;
    const response = await fetch(url, {
      headers: {
        "x-xbl-contract-version": "2",
        Authorization: `XBL3.0 x=${userHash};${xstsToken}`,
        "Accept-Language": "en-US",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch Xbox Titles");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Xbox Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/xbox/exchange", async (req, res) => {
  const { code, redirectUri, codeVerifier } = req.body;
  try {
    const tokenUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
    const params = new URLSearchParams();
    params.append("client_id", AZURE_CLIENT_ID);
    params.append("scope", "XboxLive.Signin offline_access");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("grant_type", "authorization_code");
    params.append("code_verifier", codeVerifier);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "OAuth Failed");

    const accessToken = tokenData.access_token;

    // Xbox Live User Token
    const xblRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${accessToken}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xblData = await xblRes.json();
    if (!xblRes.ok) throw new Error("XBL Auth Failed");
    const xblToken = xblData.Token;

    // XSTS Token
    const xstsRes = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Properties: { SandboxId: "RETAIL", UserTokens: [xblToken] },
        RelyingParty: "http://xboxlive.com",
        TokenType: "JWT",
      }),
    });
    const xstsData = await xstsRes.json();
    if (xstsData.XErr) throw new Error(`XSTS Error: ${xstsData.XErr}`);
    if (!xstsRes.ok) throw new Error("XSTS Auth Failed");

    const xstsToken = xstsData.Token;
    const userHash = xstsData.DisplayClaims.xui[0].uhs;

    // Profile
    const profileRes = await fetch(
      `https://profile.xboxlive.com/users/me/profile/settings?settings=Gamertag,GameDisplayPicRaw`,
      {
        headers: {
          "x-xbl-contract-version": "2",
          Authorization: `XBL3.0 x=${userHash};${xstsToken}`,
          "Accept-Language": "en-US",
        },
      }
    );
    const profileData = await profileRes.json();
    const userSettings = profileData.profileUsers[0].settings;

    res.json({
      gamertag: userSettings.find((s) => s.id === "Gamertag").value,
      gamerpic: userSettings.find((s) => s.id === "GameDisplayPicRaw").value,
      xuid: profileData.profileUsers[0].id,
      xstsToken,
      userHash,
      accessToken,
    });
  } catch (err) {
    console.error("❌ Xbox Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🟢 2. AUTH ROUTES
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    console.log("🔄 Refreshing Access Token...");
    const tokenResponse = await exchangeRefreshTokenForAuthTokens(refreshToken);

    if (!tokenResponse || !tokenResponse.accessToken)
      throw new Error("Invalid Refresh Token");

    res.json({
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresIn: tokenResponse.expiresIn,
    });
  } catch (err) {
    console.error("❌ Refresh Failed:", err.message);
    res.status(401).json({ error: "Session Expired", details: err.message });
  }
});

app.post("/api/auth/npsso", async (req, res) => {
  try {
    const { npsso } = req.body;
    if (!npsso) return res.status(400).json({ error: "NPSSO token required" });

    const accessCode = await exchangeNpssoForAccessCode(npsso);
    const tokenResponse = await exchangeAccessCodeForAuthTokens(accessCode);
    const accessToken = tokenResponse.accessToken;
    const idToken = tokenResponse.idToken || accessToken;

    if (!accessToken) throw new Error("No access token returned");

    const jwtPayload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );
    const accountId = jwtPayload.sub;

    const profileRes = await fetch(
      `https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`,
      {
        headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Mozilla/5.0" },
      }
    );
    const profileData = await profileRes.json();

    res.json({
      accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresIn: tokenResponse.expiresIn,
      accountId,
      onlineId: profileData.onlineId,
      avatarUrl:
        profileData.avatars?.find((a) => a.size === "l")?.url ||
        profileData.avatars?.[0]?.url,
    });
  } catch (err) {
    console.error("❌ NPSSO Exchange Error:", err.message);
    res.status(500).json({ error: "Authentication Failed", details: err.message });
  }
});

// 🟢 3. USER ROUTES
app.get("/api/user/profile/:accountId", requireBearer, async (req, res) => {
  try {
    const { accountId } = req.params;
    const url = `https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`;
    const json = await fetchPSN(url, req.accessToken);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/summary/:accountId", requireBearer, async (req, res) => {
  try {
    const { accountId } = req.params;
    const url = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophySummary`;
    const json = await fetchPSN(url, req.accessToken);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 4. TROPHY ROUTES
app.get("/api/trophies/:accountId", requireBearer, trophyController.getGameList);
app.get(
  "/api/trophies/:accountId/:npCommunicationId",
  requireBearer,
  trophyController.getGameDetails
);

app.use((req, res) => {
  console.log(`⚠️  404: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not found", path: req.url });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
