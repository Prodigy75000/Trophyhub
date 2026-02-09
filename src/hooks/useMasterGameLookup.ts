import { useCallback, useMemo } from "react";
import masterGamesRaw from "../../data/master_games.json";

export function useMasterGameLookup() {
  // 1. Create a Fast Lookup Map (O(1) access)
  const masterLookup = useMemo(() => {
    const map = new Map<string, any>();

    (masterGamesRaw as any[]).forEach((game) => {
      // Map Canonical ID
      if (game.canonicalId) map.set(game.canonicalId, game);

      // Map Linked Versions (Legacy)
      game.linkedVersions?.forEach((v: any) => {
        if (v.npCommunicationId) map.set(v.npCommunicationId, game);
        if (v.titleId) map.set(v.titleId, game);
      });

      // Map Platforms (New Format)
      if (game.platforms) {
        Object.values(game.platforms).forEach((platformList: any) => {
          if (Array.isArray(platformList)) {
            platformList.forEach((p: any) => {
              if (p.id) map.set(p.id, game);
            });
          }
        });
      }
    });
    return map;
  }, []);

  // 2. The function your Home Screen expects
  const identifyGame = useCallback(
    (id: string) => {
      if (!id) return undefined;
      const cleanId = String(id).trim();
      const baseId = cleanId.split("_")[0];

      // A. Try ID Match (Fastest)
      if (masterLookup.has(cleanId)) return masterLookup.get(cleanId);
      if (masterLookup.has(baseId)) return masterLookup.get(baseId);

      return undefined;
    },
    [masterLookup]
  );

  return { identifyGame };
}
