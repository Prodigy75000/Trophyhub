const { mergeTrophies, enrichTitlesWithArtwork } = require("../utils/trophyHelpers");
const { fetchPSN } = require("../utils/psnClient");

// 🟢 1. GET GAME LIST
const getGameList = async (req, res) => {
  try {
    const { accountId } = req.params;
    // ... (Keep existing fetch logic) ...
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

// 🟢 2. GET GAME DETAILS
const getGameDetails = async (req, res) => {
  const { accountId, npCommunicationId } = req.params;
  const { gameName, platform } = req.query;

  try {
    const baseUrl = `https://m.np.playstation.com/api/trophy/v1`;

    // 🟢 UPDATED SAFE FETCH
    // It catches "Not Found" (404) but RE-THROWS "Expired Token" (401)
    const safeFetch = (promise, fallbackKey) =>
      promise.catch((err) => {
        const msg = err.message || "";
        const isAuthError =
          msg.includes("Expired") ||
          msg.includes("Access denied") ||
          err.code === 2241164;

        if (isAuthError) {
          // 🚨 CRITICAL: Throw it so we trigger a 401 response!
          throw err;
        }

        console.warn(`⚠️ [${fallbackKey}] Fetch Skipped (Likely 404): ${msg}`);
        return { [fallbackKey]: [] };
      });

    const [progressData, defData, groupData] = await Promise.all([
      safeFetch(
        fetchPSN(
          `${baseUrl}/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies?limit=1000`,
          req.accessToken
        ),
        "trophies"
      ),

      safeFetch(
        fetchPSN(
          `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies`,
          req.accessToken
        ),
        "trophies"
      ),

      safeFetch(
        fetchPSN(
          `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups`,
          req.accessToken
        ),
        "trophyGroups"
      ),
    ]);

    // ... (Keep your existing merge logic exactly as is) ...
    const progress = progressData.trophies || [];
    const definitions = defData.trophies || [];
    let finalTrophies = [];
    const isRichProgress = progress.length > 0 && !!progress[0].trophyName;

    if (isRichProgress) {
      finalTrophies = progress.map((p) => ({ ...p, earned: !!p.earnedDateTime }));
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
