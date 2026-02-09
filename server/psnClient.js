// server/psnClient.js
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
    console.error(`❌ PSN API Error [${response.status}]:`, text);
    throw new Error(`PSN API Error: ${response.status}`);
  }

  return response.json();
}

module.exports = { fetchPSN };
