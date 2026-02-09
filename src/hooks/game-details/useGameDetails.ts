// hooks/game-details/useGameDetails.ts
import { useMemo } from "react";
import masterGamesRaw from "../../../data/master_games.json";
import { useTrophy } from "../../../providers/TrophyContext";
import { UnifiedGame } from "./types";
import { useGameFetcher } from "./useGameFetcher";

export function useGameDetails(
  id: string,
  searchText: string = "",
  sortMode: "DEFAULT" | "RARITY" | "DATE_EARNED" = "DEFAULT",
  sortDirection: "ASC" | "DESC" = "ASC"
) {
  const { trophies, xboxTitles } = useTrophy();

  // 1. RESOLVE GAME OBJECT
  const gameObject = useMemo((): UnifiedGame | null => {
    if (!id) return null;

    // A. PSN (User Owned)
    const psnGame = trophies?.trophyTitles?.find((t: any) => t.npCommunicationId === id);
    if (psnGame) {
      return {
        source: "USER",
        id: psnGame.npCommunicationId,
        trophyTitleName: psnGame.trophyTitleName,
        trophyTitlePlatform: psnGame.trophyTitlePlatform,
        trophyTitleIconUrl: psnGame.trophyTitleIconUrl,
        trophyList: psnGame.trophies || [],
        definedTrophies: psnGame.definedTrophies,
        earnedTrophies: psnGame.earnedTrophies,
        progress: psnGame.progress,
        npCommunicationId: psnGame.npCommunicationId,
      };
    }

    // B. Xbox
    const xboxGame = xboxTitles?.find((t) => t.titleId === id);
    if (xboxGame) {
      return {
        source: "XBOX",
        id: xboxGame.titleId,
        trophyTitleName: xboxGame.name,
        trophyTitlePlatform: "XBOX",
        trophyTitleIconUrl: xboxGame.displayImage,
        trophyList: [],
        progress: xboxGame.achievement.progressPercentage,
        originalXbox: xboxGame,
        definedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      };
    }

    // C. Master (Global / Unowned)
    const master = (masterGamesRaw as any[]).find((m) => {
      if (m.canonicalId === id) return true;
      return m.linkedVersions?.some(
        (v: any) => v.npCommunicationId === id || v.titleId === id
      );
    });

    if (master) {
      // 🟢 1. Find the best version to use for IDs
      // Prioritize PS5 -> PS4 -> PSVita -> PS3
      const validVersion =
        master.linkedVersions?.find(
          (v: any) => v.platform === "PS5" && v.npCommunicationId
        ) ||
        master.linkedVersions?.find(
          (v: any) => v.platform === "PS4" && v.npCommunicationId
        ) ||
        master.linkedVersions?.find((v: any) => v.npCommunicationId);

      const targetNpId = validVersion?.npCommunicationId;
      const targetPlatform = validVersion?.platform || "PlayStation";

      // 🟢 2. Map JSON trophies (if they exist in the file)
      const mappedTrophies = (master.trophies || []).map((t: any) => ({
        trophyId: t.id,
        trophyName: t.name,
        trophyDetail: t.detail,
        trophyIconUrl: t.iconUrl,
        trophyType: t.type,
        trophyEarnedRate: t.rarity || "0.0",
        earned: false,
      }));

      return {
        source: "MASTER",
        id: id, // Keep the canonical ID for navigation
        trophyTitleName: master.displayName,
        trophyTitlePlatform: targetPlatform,
        trophyTitleIconUrl: master.iconUrl,
        trophyList: mappedTrophies,
        masterData: master,
        progress: 0,
        // 🟢 3. CRITICAL: Pass the real NPWR ID so the fetcher works!
        npCommunicationId: targetNpId,
        definedTrophies: master.stats || { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      };
    }
    return null;
  }, [id, trophies, xboxTitles]);

  // 2. FETCH DATA
  const { localTrophies, trophyGroups, isInitialLoading, refreshing, onRefresh } =
    useGameFetcher(id, gameObject);

  // 3. MERGE DATA
  const activeTrophies =
    localTrophies.length > 0 ? localTrophies : gameObject?.trophyList || [];

  // 4. PROCESS & SORT
  const processedTrophies = useMemo(() => {
    let list = [...activeTrophies];
    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter((t) => t.trophyName.toLowerCase().includes(lower));
    }
    list.sort((a, b) => {
      let valA, valB;
      const dir = sortDirection === "ASC" ? 1 : -1;
      if (sortMode === "RARITY") {
        valA = parseFloat(a.trophyEarnedRate ?? "100");
        valB = parseFloat(b.trophyEarnedRate ?? "100");
      } else if (sortMode === "DATE_EARNED") {
        valA = a.earned ? new Date(a.earnedDateTime).getTime() : 0;
        valB = b.earned ? new Date(b.earnedDateTime).getTime() : 0;
        if (valA === 0 && valB > 0) return 1;
        if (valB === 0 && valA > 0) return -1;
      } else {
        return (a.trophyId - b.trophyId) * dir;
      }
      return (valA - valB) * dir;
    });
    return list;
  }, [activeTrophies, searchText, sortMode, sortDirection]);

  // 5. GROUPING LOGIC
  const groupedData = useMemo(() => {
    if (!trophyGroups || trophyGroups.length === 0) return null;

    const result = trophyGroups
      .map((group) => {
        const ids = group.trophyIds || [];
        // Robust ID Matching
        const groupTrophies = processedTrophies.filter((t) =>
          ids.some((id: any) => String(id) === String(t.trophyId))
        );
        if (groupTrophies.length === 0) return null;
        return { ...group, trophies: groupTrophies };
      })
      .filter(Boolean);

    return result.length > 0 ? result : null;
  }, [trophyGroups, processedTrophies]);

  // 6. JUST EARNED SET
  const justEarnedIds = useMemo(() => new Set<number>(), []);

  return {
    game: gameObject,
    isLoadingDetails: isInitialLoading,
    refreshing,
    onRefresh,
    processedTrophies,
    groupedData,
    justEarnedIds,
  };
}
