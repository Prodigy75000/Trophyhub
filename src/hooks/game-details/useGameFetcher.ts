// hooks/game-details/useGameFetcher.ts
import { useEffect, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { useTrophy } from "../../../providers/TrophyContext";
import { UnifiedGame } from "./types";

export function useGameFetcher(gameId: string, gameObject: UnifiedGame | null) {
  const { accessToken, accountId } = useTrophy();

  const [localTrophies, setLocalTrophies] = useState<any[]>([]);
  const [trophyGroups, setTrophyGroups] = useState<any[]>([]);
  // 🟢 NEW: Track which ID this data actually belongs to
  const [fetchedGameId, setFetchedGameId] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to fetch data
  const fetchData = async (isRefresh = false) => {
    if (!gameObject || !accountId || !accessToken) {
      if (!isRefresh) setIsInitialLoading(false);
      return;
    }

    if (
      !isRefresh &&
      gameObject.source === "USER" &&
      gameObject.trophyList &&
      gameObject.trophyList.length > 0
    ) {
      setLocalTrophies(gameObject.trophyList);
      setFetchedGameId(gameId); // 🟢 Match!
      setIsInitialLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setIsInitialLoading(true);

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

      if (data.trophies) {
        setLocalTrophies(data.trophies);
        setFetchedGameId(gameId); // 🟢 Mark data as belonging to THIS game
      }
      if (data.groups) setTrophyGroups(data.groups);
    } catch (e) {
      console.warn("Fetch failed", e);
    } finally {
      setIsInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Wipe old data
    setLocalTrophies([]);
    setTrophyGroups([]);
    setFetchedGameId(null); // 🟢 Reset ID match

    // 2. Load
    setIsInitialLoading(true);

    const isUpdateTrigger = localTrophies.length > 0;
    fetchData(isUpdateTrigger);
  }, [gameId, gameObject?.source, gameObject?.progress, gameObject?.earnedTrophies]);

  const onRefresh = () => fetchData(true);

  // 🟢 MAGIC FIX: Synchronously return [] if IDs mismatch
  // This prevents the "Ghost Render" before useEffect runs
  const safeLocalTrophies = fetchedGameId === gameId ? localTrophies : [];

  return {
    localTrophies: safeLocalTrophies, // Return the safe list
    trophyGroups,
    isInitialLoading,
    refreshing,
    onRefresh,
  };
}
