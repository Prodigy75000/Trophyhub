// server/utils/psnClient.js
const fetch = require("node-fetch");

/**
 * Clean wrapper for PSN API calls.
 * Does NOT rely on local config/cache. Requires implicit token.
 */
async function fetchPSN(url, accessToken, options = {}) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-US",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();

    // 🟢 SILENCED 404: We only log serious errors (500, 403, etc.)
    // 404s are expected for legacy titles and are handled by the fallback logic.
    if (response.status !== 404) {
      console.error(`❌ PSN API Error [${response.status}]:`, text);
    }

    // We still throw the error so trophyController can detect the 404
    // and trigger the legacy retry fallback.
    throw new Error(`PSN API Error: ${response.status}`);
  }

  return response.json();
}

module.exports = { fetchPSN };
