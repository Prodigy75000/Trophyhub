// src/controllers/trophyController.js
const { mergeTrophies, enrichTitlesWithArtwork } = require("../utils/trophyHelpers");
const { fetchPSN } = require("../utils/psnClient");

// 🟢 1. GET GAME LIST
const getGameList = async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`⏳ Fetching Games for ${accountId}...`);

    const trophyUrl = `https://m.np.playstation.com/api/trophy/v1/users/${accountId}/trophyTitles`;
    const gameListUrl = `https://m.np.playstation.com/api/gamelist/v2/users/${accountId}/titles`;

    // Pagination Helper
    const fetchAll = async (baseUrl, key) => {
      let items = [];
      let offset = 0;
      const limit = 200;
      while (true) {
        const json = await fetchPSN(
          `${baseUrl}?limit=${limit}&offset=${offset}`,
          req.accessToken
        ).catch(() => ({}));
        const page = json[key] || [];
        items.push(...page);
        if (page.length < limit) break;
        offset += limit;
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
    res.status(500).json({ error: err.message });
  }
};

// 🟢 2. GET GAME DETAILS (With The Fix)
const getGameDetails = async (req, res) => {
  const { accountId, npCommunicationId } = req.params;
  const { gameName, platform } = req.query;

  try {
    const baseUrl = `https://m.np.playstation.com/api/trophy/v1`;

    // 🟢 SAFE FETCH HELPER (Prevents Crash on 404)
    const safeFetch = (promise, fallbackKey) =>
      promise.catch((err) => {
        console.warn(`⚠️ [${fallbackKey}] Fetch Skipped: ${err.message}`);
        return { [fallbackKey]: [] }; // Return valid empty object
      });

    const [progressData, defData, groupData] = await Promise.all([
      // 1. User Progress (Likely to fail for Master List games)
      safeFetch(
        fetchPSN(
          `${baseUrl}/users/${accountId}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies?limit=1000`,
          req.accessToken
        ),
        "trophies"
      ),

      // 2. Global Definitions
      safeFetch(
        fetchPSN(
          `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups/all/trophies`,
          req.accessToken
        ),
        "trophies"
      ),

      // 3. Groups
      safeFetch(
        fetchPSN(
          `${baseUrl}/npCommunicationIds/${npCommunicationId}/trophyGroups`,
          req.accessToken
        ),
        "trophyGroups"
      ),
    ]);

    const progress = progressData.trophies || [];
    const definitions = defData.trophies || [];

    // Smart Merge Strategy
    let finalTrophies = [];
    const isRichProgress = progress.length > 0 && !!progress[0].trophyName;

    if (isRichProgress) {
      console.log(`[PS5] Using rich progress for ${npCommunicationId}`);
      finalTrophies = progress.map((p) => ({ ...p, earned: !!p.earnedDateTime }));
    } else {
      if (definitions.length === 0) {
        console.warn(`[WARN] No definitions found for ${npCommunicationId}`);
        finalTrophies = [];
      } else {
        console.log(`[PS4] Merging definitions for ${npCommunicationId}`);
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
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getGameList, getGameDetails };
