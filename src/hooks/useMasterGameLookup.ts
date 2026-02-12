// src/hooks/useMasterGameLookup.ts
import { useCallback, useMemo } from "react";
import { MasterGameEntry, MasterGameVariant } from "../types/GameTypes";

// 🟢 CHANGE: Accept 'games' as an argument instead of importing JSON
export function useMasterGameLookup(games: MasterGameEntry[] = []) {
  // 1. Create a Fast Lookup Map (O(1) access)
  const masterLookup = useMemo(() => {
    const map = new Map<string, MasterGameEntry>();

    if (!games || games.length === 0) return map;

    games.forEach((game) => {
      // Map Canonical ID
      if (game.canonicalId) map.set(game.canonicalId, game);

      // Map Platforms
      if (game.platforms) {
        // 🟢 FIX: Explicit cast to handle Object.values inference
        const platformLists = Object.values(game.platforms) as MasterGameVariant[][];

        platformLists.forEach((platformList) => {
          if (Array.isArray(platformList)) {
            platformList.forEach((p) => {
              if (p.id) map.set(p.id, game);
            });
          }
        });
      }
    });
    return map;
  }, [games]); // 🟢 Re-build map only when database changes

  // 2. The function your Home Screen expects
  const identifyGame = useCallback(
    (id: string) => {
      if (!id) return undefined;
      const cleanId = String(id).trim();
      const baseId = cleanId.split("_")[0];

      // A. Try ID Match (Fastest)
      if (masterLookup.has(cleanId)) return masterLookup.get(cleanId);
      // B. Try Base ID (if strictly needed)
      if (masterLookup.has(baseId)) return masterLookup.get(baseId);

      return undefined;
    },
    [masterLookup]
  );

  return { identifyGame };
}
