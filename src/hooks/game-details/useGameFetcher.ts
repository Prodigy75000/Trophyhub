// hooks/game-details/useGameFetcher.ts
import { useEffect, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { useTrophy } from "../../../providers/TrophyContext";
import { UnifiedGame } from "./types";

export function useGameFetcher(gameId: string, gameObject: UnifiedGame | null) {
  const { accessToken, accountId } = useTrophy();

  const [localTrophies, setLocalTrophies] = useState<any[]>([]);
  const [trophyGroups, setTrophyGroups] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to fetch data
  const fetchData = async (isRefresh = false) => {
    // If we don't have the basic game object yet, or auth is missing, stop.
    if (!gameObject || !accountId || !accessToken) {
      if (!isRefresh) setIsInitialLoading(false);
      return;
    }

    // Optimization: If it's a USER source and we already have the list from Context, skip fetch
    // ⚠️ NOTE: We skip this optimization if 'isRefresh' is true, which allows the Watchdog to force an update.
    if (
      !isRefresh &&
      gameObject.source === "USER" &&
      gameObject.trophyList &&
      gameObject.trophyList.length > 0
    ) {
      setLocalTrophies(gameObject.trophyList);
      setIsInitialLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      // Don't set initial loading if we already have data (prevent flash)
      else if (localTrophies.length === 0) setIsInitialLoading(true);

      const platformParam =
        gameObject.trophyTitlePlatform !== "Unknown"
          ? `&platform=${encodeURIComponent(gameObject.trophyTitlePlatform)}`
          : "";

      const url =
        `${PROXY_BASE_URL}/api/trophies/${accountId}/${gameId}` +
        `?gameName=${encodeURIComponent(gameObject.trophyTitleName)}` +
        platformParam;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();

      if (data.trophies) setLocalTrophies(data.trophies);
      if (data.groups) setTrophyGroups(data.groups);
    } catch (e) {
      console.warn("Fetch failed", e);
    } finally {
      setIsInitialLoading(false);
      setRefreshing(false);
    }
  };

  // 🟢 FIX: Trigger fetch when Progress changes (Watchdog detected new trophy)
  useEffect(() => {
    // If progress changed, it means the Context updated. We should silently refetch details.
    // We pass 'true' to fetchData to bypass the "Use Cached Context" optimization
    // and force a network hit to get the new 'earned' booleans.
    const isUpdateTrigger = localTrophies.length > 0;
    fetchData(isUpdateTrigger);
  }, [
    gameId,
    gameObject?.source,
    gameObject?.progress, // <--- 🚨 THE TRIGGER
    gameObject?.earnedTrophies, // <--- Safety fallback
  ]);

  const onRefresh = () => fetchData(true);

  return {
    localTrophies,
    trophyGroups,
    isInitialLoading,
    refreshing,
    onRefresh,
  };
}
