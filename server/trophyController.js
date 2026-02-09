// server/trophyController.js
const { mergeTrophies, enrichTitlesWithArtwork } = require("./trophyHelpers");
const { fetchPSN } = require("./psnClient");

/**
 * Advanced Helper for Legacy Platforms (PS4, PS3, Vita)
 * - Tries standard URL first.
 * - On 404, retries with legacy service names 'trophy' and 'trophy2'.
 */
async function fetchWithPlatformFallback(url, accessToken) {
  try {
    return await fetchPSN(url, accessToken);
  } catch (error) {
    const is404 = error.message && error.message.includes("404");

    if (is404) {
      console.log(`⚠️ 404 on ${url}. Attempting Legacy Fallbacks...`);

      const separator = url.includes("?") ? "&" : "?";

      // Fallback 1: The standard legacy "trophy" service
      try {
        console.log(`🔄 Retrying with npServiceName=trophy...`);
        return await fetchPSN(`${url}${separator}npServiceName=trophy`, accessToken);
      } catch (e1) {
        // Fallback 2: The "trophy2" service often used for older titles
        try {
          console.log(`🔄 Retrying with npServiceName=trophy2...`);
          return await fetchPSN(`${url}${separator}npServiceName=trophy2`, accessToken);
        } catch (e2) {
          // If all legacy attempts fail, throw the original 404
          throw error;
        }
      }
    }
    throw error;
  }
}

/**
 * Safe fetch wrapper:
 * - NEVER swallows auth errors (so the app can refresh)
 * - Swallows "not found"-style errors (after PS4 fallback attempt) and returns empty arrays
 */
async function safeFetchUrl(url, accessToken, fallbackKey) {
  try {
    return await fetchWithPlatformFallback(url, accessToken);
  } catch (err) {
    const msg = err.message || "";
    const isAuthError =
      msg.includes("Expired") || msg.includes("Access denied") || err.code === 2241164;

    if (isAuthError) throw err;

    console.warn(`⚠️ [${fallbackKey}] Fetch Skipped (Likely 404): ${msg}`);
    return { [fallbackKey]: [] };
  }
}

// 🟢 1. GET GAME LIST (pagination + artwork enrichment)
const getGameList = async (req, res) => {
  try {
    const { accountId } = req.params;

    const trophyUrl = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles`;
    const gameListUrl = `https://m.np.playstation.com/api/gamelist/v2/users/${accountId}/titles`;

    const fetchAll = async (baseUrl, key) => {
      let items = [];
      let offset = 0;
      const limit = 200;

      while (true) {
        // 🟢 FIX: Handle 401 in pagination too
        try {
          const json = await fetchPSN(
            `${baseUrl}?limit=${limit}&offset=${offset}`,
            req.accessToken
          );

          const page = json[key] || [];
          items.push(...page);

          if (page.length < limit) break;
          offset += limit;
        } catch (err) {
          if (err.message?.includes("Expired") || err.code === 2241164) throw err;
          break; // Stop fetching on other errors
        }
      }

      return items;
    };

    const [trophyTitles, gameList] = await Promise.all([
      fetchAll(trophyUrl, "trophyTitles"),
      fetchAll(gameListUrl, "titles"),
    ]);

    const enriched = enrichTitlesWithArtwork(trophyTitles, gameList);
    res.json({ totalItemCount: enriched.length, trophyTitles: enriched });
  } catch (err) {
    console.error("❌ Game List Error:", err.message);

    // 🟢 Send 401 so App knows to refresh
    if (err.message?.includes("Expired") || err.code === 2241164) {
      return res.status(401).json({ error: "Token Expired" });
    }

    res.status(500).json({ error: err.message });
  }
};

// 🟢 2. GET GAME DETAILS (merge logic + PS4 fallback + proper 401 bubbling)
const getGameDetails = async (req, res) => {
  const { accountId, npCommunicationId } = req.params;
  const { gameName, platform } = req.query;

  console.log(`📡 Fetching Details for: ${npCommunicationId}`);

  try {
    const baseUrl = `https://m.np.playstation.com/api/trophy/v1`;

    // We keep your original 3-call design:
    // - progress (user endpoint with earned states)
    // - definitions (non-user endpoint)
    // - groups (trophy groups / DLCs)
    //
    // Each call uses PS4 fallback on 404, but NEVER masks auth errors.

    const progressUrl = `${baseUrl}/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies?limit=1000`;
    const definitionsUrl = `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies`;
    const groupsUrl = `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups`;

    const [progressData, defData, groupData] = await Promise.all([
      safeFetchUrl(progressUrl, req.accessToken, "trophies"),
      safeFetchUrl(definitionsUrl, req.accessToken, "trophies"),
      safeFetchUrl(groupsUrl, req.accessToken, "trophyGroups"),
    ]);

    // --- Keep your existing merge logic ---
    const progress = progressData.trophies || [];
    const definitions = defData.trophies || [];
    let finalTrophies = [];

    const isRichProgress = progress.length > 0 && !!progress[0].trophyName;

    if (isRichProgress) {
      finalTrophies = progress.map((p) => ({
        ...p,
        earned: !!p.earnedDateTime,
      }));
    } else {
      if (definitions.length === 0) {
        finalTrophies = progress; // Empty fallback
      } else {
        finalTrophies = mergeTrophies(definitions, progress);
      }
    }

    res.json({
      meta: { npCommunicationId, gameName, platform },
      trophies: finalTrophies,
      groups: groupData.trophyGroups || [],
    });
  } catch (err) {
    console.error("❌ Detail Error:", err.message);

    // 🟢 HANDLE THE 401 RESPONSE
    if (err.message?.includes("Expired") || err.code === 2241164) {
      return res.status(401).json({ error: "Session Expired", details: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};

module.exports = { getGameList, getGameDetails };
