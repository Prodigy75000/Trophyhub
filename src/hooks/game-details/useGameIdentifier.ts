// src/hooks/game-details/useGameIdentifier.ts
import { useMemo } from "react";
import masterGamesRaw from "../../../data/master_games.json";
import { useTrophy } from "../../../providers/TrophyContext";
import { UnifiedGame } from "../../types/GameTypes";

/**
 * Resolves the master record and creates a unified game object.
 * Accepts trophies as an optional second argument to force reactivity
 * when the global context updates.
 */
export function useGameIdentifier(id: string, trophiesArg?: any) {
  const { trophies: contextTrophies, xboxTitles } = useTrophy();

  // Prioritize passed argument for immediate reactivity
  const trophies = trophiesArg || contextTrophies;

  return useMemo(() => {
    if (!id) return { gameObject: null, masterRecord: null };

    // 🟢 1. ID SANITIZATION
    const cleanId = String(id).trim();
    const baseId = cleanId.split("_")[0];

    // 🟢 2. MASTER RECORD LOOKUP
    const master = (masterGamesRaw as any[]).find((m) => {
      // Direct Canonical Match
      if (String(m.canonicalId) === cleanId || String(m.canonicalId) === baseId)
        return true;

      // Platforms dictionary check (New Structure)
      if (m.platforms) {
        return Object.values(m.platforms).some(
          (platformList: any) =>
            Array.isArray(platformList) &&
            platformList.some(
              (p: any) => String(p.id) === cleanId || String(p.id) === baseId
            )
        );
      }
      return false;
    });

    // 🟢 3. CHECK USER OWNERSHIP (PSN)
    // This block is now reactive to the 'trophies' object to update the Hero bar [cite: 8]
    const psnGame = trophies?.trophyTitles?.find(
      (t: any) =>
        String(t.npCommunicationId) === cleanId || String(t.npCommunicationId) === baseId
    );

    if (psnGame) {
      return {
        masterRecord: master,
        gameObject: {
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
        } as UnifiedGame,
      };
    }

    // 🟢 4. CHECK USER OWNERSHIP (XBOX)
    const xboxGame = xboxTitles?.find((t: any) => String(t.titleId) === cleanId);
    if (xboxGame) {
      return {
        masterRecord: master,
        gameObject: {
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
        } as UnifiedGame,
      };
    }

    // 🟢 5. FALLBACK (Global/Master Only)
    if (master) {
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
        masterRecord: master,
        gameObject: {
          source: "MASTER",
          id: id,
          trophyTitleName: master.displayName,
          trophyTitlePlatform: "PlayStation",
          trophyTitleIconUrl: master.iconUrl,
          trophyList: mappedTrophies,
          masterData: master,
          progress: 0,
          npCommunicationId: id,
          definedTrophies: master.stats || { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        } as UnifiedGame,
      };
    }

    return { gameObject: null, masterRecord: null };
  }, [id, trophies, xboxTitles]); // 🟢 Listens to trophies for automatic Hero updates [cite: 9]
}
