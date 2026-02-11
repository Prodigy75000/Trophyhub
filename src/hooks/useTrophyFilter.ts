// src/hooks/useTrophyFilter.ts
import { useMemo } from "react";
import type {
  FilterMode,
  OwnershipMode,
  PlatformFilter,
  SortDirection,
  SortMode,
} from "../components/HeaderActionBar";
import { GameVersion, MasterGameEntry } from "../types/GameTypes";
import { XboxTitle } from "../types/XboxTypes";
import { processPsnGame, processXboxGame } from "../utils/gameProcessor";
import { calculateUserStats } from "../utils/trophyCalculations";
import { useMasterGameLookup } from "./useMasterGameLookup";

/**
 * Type Extension to handle masterStats until GameTypes.ts is fully re-synced.
 */
type AugmentedGameVersion = GameVersion & {
  masterStats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    total: number;
  };
};

export function useTrophyFilter(
  userTrophies: any | null,
  masterGames: MasterGameEntry[],
  xboxTitles: XboxTitle[],
  searchText: string,
  filterMode: FilterMode,
  ownershipMode: OwnershipMode,
  sortMode: SortMode,
  sortDirection: SortDirection,
  pinnedIds: Set<string>,
  showShovelware: boolean,
  platforms: PlatformFilter
) {
  // 1. INITIALIZE HELPERS
  const { identifyGame } = useMasterGameLookup();

  // 2. CALCULATE DASHBOARD STATS
  const userStats = useMemo(() => {
    return calculateUserStats(userTrophies?.trophyTitles);
  }, [userTrophies]);

  // 3. MAIN MERGE & PROCESS LOGIC
  const processedList = useMemo(() => {
    const groupedMap = new Map<
      string,
      {
        id: string;
        title: string;
        icon?: string;
        art?: string;
        tags: string[];
        versions: AugmentedGameVersion[];
      }
    >();

    // Helper: Platform Filter Toggle logic
    const isPlatformEnabled = (plat: string) => {
      if (!plat) return false;
      const p = plat.toUpperCase();
      if (p.includes("PS5") && platforms.PS5) return true;
      if (p.includes("PS4") && platforms.PS4) return true;
      if (p.includes("PS3") && platforms.PS3) return true;
      if ((p.includes("VITA") || p.includes("PS VITA")) && platforms.PSVITA) return true;
      if (p === "XBOX") return true;
      return false;
    };

    // --- A. PROCESS OWNED PSN GAMES ---
    userTrophies?.trophyTitles?.forEach((game: any) => {
      const processed = processPsnGame(game) as AugmentedGameVersion;
      if (!isPlatformEnabled(processed.platform)) return;

      const master = identifyGame(game.npCommunicationId);
      const key = master?.canonicalId || game.npCommunicationId;

      // Inject Master Stats
      if (master?.stats) {
        processed.masterStats = master.stats;
      }

      if (!groupedMap.has(key)) {
        const mArt = master?.art;

        // 🟢 ARTWORK FIX (OWNED):
        // 1. storesquare (If you manually enriched the JSON)
        // 2. game.trophyTitleIconUrl (The LIVE Backend Enriched Art) 👈 MOVED UP
        // 3. icon (The Standard Lite JSON Icon)
        const icon =
          mArt?.storesquare ||
          game.trophyTitleIconUrl || // Prioritize Backend over Static JSON
          mArt?.icon ||
          mArt?.square;

        const art = mArt?.hero || game.gameArtUrl || mArt?.master || icon;

        groupedMap.set(key, {
          id: key,
          title: master?.displayName || game.trophyTitleName,
          icon,
          art,
          tags: master?.tags || [],
          versions: [],
        });
      }
      groupedMap.get(key)!.versions.push(processed);
    });

    // --- B. PROCESS OWNED XBOX GAMES ---
    xboxTitles?.forEach((game) => {
      const processed = processXboxGame(game, identifyGame) as AugmentedGameVersion;
      if (!processed) return;

      const master = identifyGame(game.titleId);
      const key = master?.canonicalId || `xbox_${game.titleId}`;

      if (master?.stats) {
        processed.masterStats = master.stats;
      }

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: key,
          title: master?.displayName || game.name,
          icon: game.displayImage,
          art: game.displayImage,
          tags: master?.tags || [],
          versions: [],
        });
      }
      groupedMap.get(key)!.versions.push(processed);
    });

    // --- C. PROCESS UNOWNED (Global/Discover Mode) ---
    if (ownershipMode !== "OWNED") {
      masterGames.forEach((master) => {
        const key = master.canonicalId;
        if (!key || !master.platforms) return;

        let group = groupedMap.get(key);

        if (!group) {
          const mArt = master.art;

          // Unowned games rely on JSON data
          const icon = mArt?.storesquare || mArt?.square || mArt?.icon || master.iconUrl;
          const art = mArt?.hero || mArt?.master || icon;

          group = {
            id: key,
            title: master.displayName,
            icon,
            art,
            tags: master.tags || [],
            versions: [],
          };
          groupedMap.set(key, group);
        }

        // Iterate values to check specific versions (Fixes Shovelware Bug)
        Object.values(master.platforms).forEach((variants: any[]) => {
          variants.forEach((v: any) => {
            if (!isPlatformEnabled(v.platform)) return;
            if (group!.versions.some((gv) => gv.id === v.id)) return;

            group!.versions.push({
              id: v.id || "unknown",
              platform: v.platform || "Unknown",
              region: v.region,
              progress: 0,
              isOwned: false,
              masterStats: master.stats,
              lastPlayed: "",
              counts: {
                total: 0,
                bronze: 0,
                silver: 0,
                gold: 0,
                platinum: 0,
                earnedBronze: 0,
                earnedSilver: 0,
                earnedGold: 0,
                earnedPlatinum: 0,
              },
            } as AugmentedGameVersion);
          });
        });
      });
    }

    // --- D. FINAL FILTERING ---
    let combinedList = Array.from(groupedMap.values()).filter(
      (g) => g.versions.length > 0
    );

    if (!showShovelware) {
      combinedList = combinedList.filter((g) => !g.tags?.includes("shovelware"));
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      combinedList = combinedList.filter((g) => g.title?.toLowerCase().includes(lower));
    }

    if (filterMode !== "ALL") {
      combinedList = combinedList.filter((g) => {
        return g.versions.some((v) => {
          if (filterMode === "IN_PROGRESS") return v.progress > 0 && v.progress < 100;
          if (filterMode === "COMPLETED") return v.progress === 100;
          if (filterMode === "NOT_STARTED") return v.progress === 0;
          return true;
        });
      });
    }

    return combinedList;
  }, [
    userTrophies,
    xboxTitles,
    masterGames,
    identifyGame,
    searchText,
    filterMode,
    ownershipMode,
    showShovelware,
    platforms,
  ]);

  // 4. SORTING LOGIC
  const sortedList = useMemo(() => {
    const list = [...processedList];
    const dir = sortDirection === "ASC" ? 1 : -1;

    list.sort((a, b) => {
      const isPinnedA = a.versions.some((v) => pinnedIds.has(v.id));
      const isPinnedB = b.versions.some((v) => pinnedIds.has(v.id));

      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;

      if (sortMode === "TITLE") {
        return (a.title || "").localeCompare(b.title || "") * dir;
      }

      if (sortMode === "PROGRESS") {
        const progA = Math.max(...a.versions.map((v) => v.progress || 0));
        const progB = Math.max(...b.versions.map((v) => v.progress || 0));
        return (progA - progB) * dir;
      }

      // Default: Last Played
      const bestA = a.versions[0];
      const bestB = b.versions[0];
      const timeA = bestA?.lastPlayed ? new Date(bestA.lastPlayed).getTime() : 0;
      const timeB = bestB?.lastPlayed ? new Date(bestB.lastPlayed).getTime() : 0;

      return (timeA - timeB) * dir;
    });

    return list;
  }, [processedList, sortMode, sortDirection, pinnedIds]);

  return { userStats, sortedList };
}
