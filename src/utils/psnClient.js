// src/utils/psnClient.js
const { fetchWithFallback, fetchWithAutoRefresh } = require("../../config/psn");

// 🟢 Shared Helper: Decides whether to use User Token or Server Bootstrap
async function fetchPSN(url, userToken) {
  if (userToken) {
    // console.log("🔐 Using User Token...");
    const headers = {
      Authorization: `Bearer ${userToken}`,
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US",
    };
    return await fetchWithFallback(url, headers);
  } else {
    // console.log("🌍 Using Server Bootstrap Token...");
    return await fetchWithAutoRefresh(url);
  }
}

module.exports = { fetchPSN };
