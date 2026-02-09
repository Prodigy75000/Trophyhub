import { useMemo } from "react";

export function useTrophyProcessor(
  localTrophies: any[],
  masterRecord: any,
  gameObject: any,
  searchText: string,
  sortMode: string,
  sortDirection: "ASC" | "DESC"
) {
  return useMemo(() => {
    let baseList: any[] = [];
    let source = "NONE";

    // PRIORITY 1: API Fetch (Live status)
    if (localTrophies && localTrophies.length > 0) {
      baseList = localTrophies;
      source = "API";
    }
    // PRIORITY 2: Master Data (Fallback for blank screens)
    else if (masterRecord?.trophies && masterRecord.trophies.length > 0) {
      baseList = masterRecord.trophies.map((t: any) => ({
        trophyId: t.id,
        trophyName: t.name,
        trophyDetail: t.detail,
        trophyIconUrl: t.iconUrl,
        trophyType: t.type,
        trophyEarnedRate: t.rarity || "0.0",
        earned: false,
      }));
      source = "MASTER";
    }
    // PRIORITY 3: Context (Summary)
    else if (gameObject?.trophyList) {
      baseList = gameObject.trophyList;
      source = "CONTEXT";
    }

    let list = [...baseList];

    // Filter
    if (searchText) {
      list = list.filter((t) =>
        t.trophyName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort
    list.sort((a, b) => {
      const dir = sortDirection === "ASC" ? 1 : -1;

      if (sortMode === "RARITY") {
        const valA = parseFloat(a.trophyEarnedRate ?? "100");
        const valB = parseFloat(b.trophyEarnedRate ?? "100");
        return (valA - valB) * dir;
      }

      if (sortMode === "DATE_EARNED") {
        const timeA =
          a.earned && a.earnedDateTime ? new Date(a.earnedDateTime).getTime() : 0;
        const timeB =
          b.earned && b.earnedDateTime ? new Date(b.earnedDateTime).getTime() : 0;
        if (timeA === 0 && timeB > 0) return 1;
        if (timeB === 0 && timeA > 0) return -1;
        return (timeA - timeB) * dir;
      }

      // Default: Sort by ID (Safe Parse)
      const idA = parseInt(String(a.trophyId || "0"), 10);
      const idB = parseInt(String(b.trophyId || "0"), 10);
      return (idA - idB) * dir;
    });

    return list;
  }, [localTrophies, masterRecord, gameObject, searchText, sortMode, sortDirection]);
}
