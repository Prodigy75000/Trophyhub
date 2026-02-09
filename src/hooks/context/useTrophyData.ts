// src/hooks/context/useTrophyData.ts
import { useCallback, useEffect, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { TrophyData } from "../../types/ContextTypes";
import { loadTrophyCache, saveTrophyCache } from "../../utils/trophyCache";

export function useTrophyData(accessToken: string | null, accountId: string | null) {
  const [trophies, setTrophies] = useState<TrophyData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(false);

  // 1. INSTANT LOAD: Hydrate from cache immediately on boot
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // If we already have data, don't overwrite it
      if (trophies) return;

      setIsLoadingCache(true);
      try {
        // 🟢 FIX: Cast the result to TrophyData so TypeScript is happy
        const rawCache = await loadTrophyCache();
        const cached = rawCache as TrophyData | null;

        if (mounted && cached && Object.keys(cached).length > 0) {
          console.log("💾 [Cache] Hydrated trophies from disk");
          setTrophies(cached);
          setLastUpdated(Date.now());
        }
      } catch (e) {
        console.warn("Failed to load trophy cache", e);
      } finally {
        if (mounted) setIsLoadingCache(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []); // Run once on mount

  // 2. REFRESH ALL: Fetch fresh data and update cache
  const refreshAllTrophies = useCallback(async () => {
    if (!accessToken || !accountId) return;
    try {
      console.log("♻️ [TrophyContext] Fetching fresh data...");
      const res = await fetch(`${PROXY_BASE_URL}/api/trophies/${accountId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data: TrophyData = await res.json();

      setTrophies(data);
      setLastUpdated(Date.now());

      saveTrophyCache(data);
      console.log("✅ [TrophyContext] Data updated & cached");
    } catch (err) {
      console.error("❌ [TrophyContext] Refresh failed (Using cached data)", err);
    }
  }, [accessToken, accountId]);

  // 3. REFRESH SINGLE: Fetch game and patch local state + cache
  const refreshSingleGame = useCallback(
    async (npwr: string) => {
      if (!accessToken || !accountId) return;
      try {
        const res = await fetch(`${PROXY_BASE_URL}/api/trophies/${accountId}/${npwr}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const gameData = await res.json();

        setTrophies((prev) => {
          if (!prev || !Array.isArray(prev.trophyTitles)) return prev;

          const trophyList = gameData.trophies || [];
          const earned = trophyList.filter((t: any) => t.earned).length;
          const total = trophyList.length;
          const progress = total > 0 ? Math.floor((earned / total) * 100) : 0;

          // 🟢 FIX: Explicitly type newData to avoid implicit 'any' errors
          const newData: TrophyData = {
            ...prev,
            trophyTitles: prev.trophyTitles.map((t) =>
              String(t.npCommunicationId) === String(npwr)
                ? { ...t, trophies: gameData.trophies, progress }
                : t
            ),
          };

          saveTrophyCache(newData);

          return newData;
        });
      } catch (err) {
        console.error("❌ [TrophyContext] Game refresh failed", err);
      }
    },
    [accessToken, accountId]
  );

  return {
    trophies,
    setTrophies,
    refreshAllTrophies,
    refreshSingleGame,
    lastUpdated,
    isLoadingCache,
  };
}
