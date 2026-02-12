// server/controllers/authController.js
const {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
} = require("psn-api");
const { Buffer } = require("buffer");

const refreshPsnToken = async (req, res) => {
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
};

const exchangeNpsso = async (req, res) => {
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

    // Fetch minimal profile data for immediate feedback
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
};

module.exports = { refreshPsnToken, exchangeNpsso };
