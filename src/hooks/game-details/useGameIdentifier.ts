import { useMemo } from "react";
import masterGamesRaw from "../../../data/master_games.json";
import { useTrophy } from "../../../providers/TrophyContext";
import { UnifiedGame } from "../../types/GameTypes";

export function useGameIdentifier(id: string) {
  const { trophies, xboxTitles } = useTrophy();

  return useMemo(() => {
    if (!id) return { gameObject: null, masterRecord: null };

    // 🟢 1. ID SANITIZATION (Fixes Borderlands 2)
    const cleanId = String(id).trim();
    const baseId = cleanId.split("_")[0]; // "NPWR12345_00" -> "NPWR12345"

    console.log(`\n🔍 [Identifier] Looking for: "${baseId}`);

    // 🟢 2. MASTER RECORD LOOKUP (Robust)
    const master = (masterGamesRaw as any[]).find((m) => {
      // A. Direct Canonical Match
      if (String(m.canonicalId) === cleanId) return true;
      if (String(m.canonicalId) === baseId) return true;

      // B. Linked Versions (Legacy Array)
      if (
        m.linkedVersions?.some(
          (v: any) =>
            String(v.npCommunicationId) === cleanId || String(v.titleId) === cleanId
        )
      )
        return true;

      // C. Platforms (New Object Structure)
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

    if (master) {
      console.log(`   ✅ Match Found: "${master.displayName}"`);
    } else {
      console.warn(`   ❌ No Match in Master DB for "${cleanId}"`);
    }

    // 🟢 3. CHECK USER OWNERSHIP (PSN)
    const psnGame = trophies?.trophyTitles?.find(
      (t: any) => String(t.npCommunicationId) === cleanId
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
          trophyList: psnGame.trophies || [], // Often empty summary
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
    // This ensures we always have a game object to render, even if the user doesn't own it
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
  }, [id, trophies, xboxTitles]);
}
