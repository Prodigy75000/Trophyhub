// src/hooks/game-details/useGameIdentifier.ts
import { useMemo } from "react";
import { useTrophy } from "../../../providers/TrophyContext";
import { MasterGameEntry, UnifiedGame } from "../../types/GameTypes";
import { useMasterGameLookup } from "../useMasterGameLookup"; // 🟢 Import the lookup hook

/**
 * Resolves the master record and creates a unified game object.
 * 🟢 Now accepts masterGames to use the live DB instead of a static file.
 */
export function useGameIdentifier(
  id: string,
  masterGames: MasterGameEntry[], // 🟢 Required: Live DB data
  trophiesArg?: any
) {
  const { trophies: contextTrophies, xboxTitles } = useTrophy();

  // 🟢 Use our optimized lookup hook (O(1) speed)
  const { identifyGame } = useMasterGameLookup(masterGames);

  // Prioritize passed argument for immediate reactivity
  const trophies = trophiesArg || contextTrophies;

  return useMemo(() => {
    if (!id) return { gameObject: null, masterRecord: null };

    const cleanId = String(id).trim();
    const baseId = cleanId.split("_")[0];

    // 🟢 REPLACED: The heavy .find() loop is gone. We use the O(1) lookup now.
    const master = identifyGame(cleanId);

    // 泙 3. CHECK USER OWNERSHIP (PSN)
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

    // 泙 4. CHECK USER OWNERSHIP (XBOX)
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

    // 泙 5. FALLBACK (Global/Master Only)
    if (master) {
      // 🟢 FIX: Handle cases where trophies might be missing in DB or named differently
      const mappedTrophies = (master["trophies"] || []).map((t: any) => ({
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
  }, [id, trophies, xboxTitles, identifyGame, masterGames]);
}
