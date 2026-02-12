// server/controllers/xboxController.js
const dotenv = require("dotenv");
dotenv.config();

const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;

const fetchXboxTitles = async (req, res) => {
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
};

const exchangeXboxToken = async (req, res) => {
  const { code, redirectUri, codeVerifier } = req.body;
  try {
    // 1. Exchange Code for Access Token
    const params = new URLSearchParams();
    params.append("client_id", AZURE_CLIENT_ID); // 🟢 Loaded from ENV
    params.append("scope", "XboxLive.Signin offline_access");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("grant_type", "authorization_code");
    params.append("code_verifier", codeVerifier);

    const tokenRes = await fetch(
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "OAuth Failed");

    // 2. Exchange for Xbox Live Token
    const xblRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${tokenData.access_token}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    });

    if (!xblRes.ok) throw new Error("XBL Auth Failed");
    const xblData = await xblRes.json();

    // 3. Exchange for XSTS Token
    const xstsRes = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Properties: { SandboxId: "RETAIL", UserTokens: [xblData.Token] },
        RelyingParty: "http://xboxlive.com",
        TokenType: "JWT",
      }),
    });

    if (!xstsRes.ok) throw new Error("XSTS Auth Failed");
    const xstsData = await xstsRes.json();

    const xstsToken = xstsData.Token;
    const userHash = xstsData.DisplayClaims.xui[0].uhs;

    // 4. Get Profile
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
      accessToken: tokenData.access_token,
    });
  } catch (err) {
    console.error("❌ Xbox Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fetchXboxTitles, exchangeXboxToken };
