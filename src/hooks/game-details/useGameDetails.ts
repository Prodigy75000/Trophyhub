// src/hooks/game-details/useGameDetails.ts
import { useEffect } from "react";
import { useGameFetcher } from "./useGameFetcher";
import { useGameIdentifier } from "./useGameIdentifier";
import { useTrophyGrouper } from "./useTrophyGrouper";
import { useTrophyProcessor } from "./useTrophyProcessor";

export function useGameDetails(
  id: string,
  searchText: string = "",
  sortMode: "DEFAULT" | "RARITY" | "DATE_EARNED" = "DEFAULT",
  sortDirection: "ASC" | "DESC" = "ASC"
) {
  // 1. IDENTIFY GAME
  const { gameObject, masterRecord } = useGameIdentifier(id);

  // 2. FETCH DATA
  // We extract the setters but we will memoize the reset logic
  const {
    localTrophies,
    setLocalTrophies,
    trophyGroups,
    setTrophyGroups,
    isInitialLoading,
    refreshing,
    onRefresh,
  } = useGameFetcher(id, gameObject);

  // 🟢 FIXED: STABLE RESET LOGIC
  // We wrap the reset in a stable function to prevent the infinite loop.
  // We only want this to run when the 'id' itself changes.
  useEffect(() => {
    if (id) {
      // Clear the trophies and groups immediately to show skeletons
      if (typeof setLocalTrophies === "function") setLocalTrophies([]);
      if (typeof setTrophyGroups === "function") setTrophyGroups([]);
    }
    // We intentionally omit the setters from dependencies to break the loop
    // because function references from custom hooks can be unstable.
  }, [id]);

  // 3. PROCESS LIST
  const processedTrophies = useTrophyProcessor(
    localTrophies,
    masterRecord,
    gameObject,
    searchText,
    sortMode,
    sortDirection
  );

  // 4. GROUP TROPHIES
  const groupedData = useTrophyGrouper(trophyGroups, masterRecord, processedTrophies);

  return {
    game: gameObject,
    isLoadingDetails: isInitialLoading,
    refreshing,
    onRefresh,
    processedTrophies,
    groupedData,
    justEarnedIds: new Set<number>(),
  };
}
