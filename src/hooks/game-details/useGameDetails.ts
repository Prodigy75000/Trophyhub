// src/hooks/game-details/useGameDetails.ts
import { useEffect } from "react";
// 🟢 PATH FIX: Go up 3 levels to reach the providers folder
import { useTrophy } from "../../../providers/TrophyContext";
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
  const { trophies, masterDatabase } = useTrophy();

  // 1. IDENTIFY GAME
  // 🟢 No longer errors because we updated the function signature above
  const { gameObject, masterRecord } = useGameIdentifier(
    id,
    masterDatabase || [],
    trophies
  );

  // 2. FETCH DATA
  const {
    localTrophies,
    setLocalTrophies,
    trophyGroups,
    setTrophyGroups,
    isInitialLoading,
    refreshing,
    onRefresh,
  } = useGameFetcher(id, gameObject);

  // 🟢 STABLE RESET LOGIC
  useEffect(() => {
    if (id) {
      if (typeof setLocalTrophies === "function") setLocalTrophies([]);
      if (typeof setTrophyGroups === "function") setTrophyGroups([]);
    }
    // We omit setters from deps to prevent the "Maximum update depth" loop
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
