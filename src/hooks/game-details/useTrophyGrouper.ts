// src/hooks/game-details/useTrophyGrouper.ts
import { useMemo } from "react";

export function useTrophyGrouper(
  trophyGroups: any[] | null,
  masterRecord: any,
  processedTrophies: any[]
) {
  return useMemo(() => {
    // 1. Determine Source
    const groups =
      trophyGroups && trophyGroups.length > 0 ? trophyGroups : masterRecord?.trophyGroups;

    if (!groups || groups.length === 0) return null;

    // 2. Map and Process Groups
    const result = groups
      .map((group: any) => {
        // Handle ID for Base Game
        const isBaseId = group.trophyGroupId === "default" || group.trophyGroupId === "0";

        // Resolve Name
        const groupName =
          group.trophyGroupName ||
          group.groupName ||
          group.name ||
          (isBaseId ? "Base Game" : `DLC ${group.trophyGroupId}`);

        const ids = group.trophyIds || [];
        if (ids.length === 0) return null;

        const groupTrophies = processedTrophies.filter((t) =>
          ids.includes(Number(t.trophyId))
        );

        if (groupTrophies.length === 0) return null;

        const earnedCount = groupTrophies.filter((t: any) => t.earned).length;
        const progress = Math.round((earnedCount / groupTrophies.length) * 100);

        return {
          ...group,
          id: group.trophyGroupId || groupName,
          name: groupName,
          trophies: groupTrophies,
          isBaseGame: isBaseId || groupName === "Base Game" || groupName === "Main Game",
          progress,
          earnedCounts: {
            bronze: groupTrophies.filter(
              (t: any) => t.earned && t.trophyType === "bronze"
            ).length,
            silver: groupTrophies.filter(
              (t: any) => t.earned && t.trophyType === "silver"
            ).length,
            gold: groupTrophies.filter((t: any) => t.earned && t.trophyType === "gold")
              .length,
            platinum: groupTrophies.filter(
              (t: any) => t.earned && t.trophyType === "platinum"
            ).length,
          },
          counts: {
            bronze: groupTrophies.filter((t: any) => t.trophyType === "bronze").length,
            silver: groupTrophies.filter((t: any) => t.trophyType === "silver").length,
            gold: groupTrophies.filter((t: any) => t.trophyType === "gold").length,
            platinum: groupTrophies.filter((t: any) => t.trophyType === "platinum")
              .length,
          },
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        if (a.isBaseGame) return -1;
        if (b.isBaseGame) return 1;
        return (a.trophyGroupId || "").localeCompare(b.trophyGroupId || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });

    // 🟢 FINAL CONDITION: Only return groups if there is more than one.
    // This prevents showing a single "Base Game" group for games without DLC.
    return result.length > 1 ? result : null;
  }, [trophyGroups, masterRecord, processedTrophies]);
}
