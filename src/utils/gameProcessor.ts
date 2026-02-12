// src/utils/gameProcessor.ts

// 1. Generic Game Types
import { GameCounts, GameVersion } from "../types/GameTypes";

// 2. Specific Xbox Types
import { XboxTitle } from "../types/XboxTypes";

// --- Types ---
type IdentifyGameFn = (id: string, name?: string) => any;

// --- Helper Constants ---
// 🟢 CLEANUP: Explicitly define that Xbox/Unknown platforms have NO trophies
const ZERO_TROPHIES = {
  bronze: 0,
  silver: 0,
  gold: 0,
  platinum: 0,
  earnedBronze: 0,
  earnedSilver: 0,
  earnedGold: 0,
  earnedPlatinum: 0,
};

// --- Helper Functions ---

const normalizePlatform = (raw: string) => {
  if (!raw) return "UNKNOWN";
  const p = raw.toUpperCase();
  if (p.includes("PS5")) return "PS5";
  if (p.includes("PS4")) return "PS4";
  if (p.includes("VITA")) return "PSVITA";
  return p;
};

const getPsnCounts = (game: any): GameCounts => ({
  total:
    (game.definedTrophies?.bronze || 0) +
    (game.definedTrophies?.silver || 0) +
    (game.definedTrophies?.gold || 0) +
    (game.definedTrophies?.platinum || 0),
  bronze: game.definedTrophies?.bronze || 0,
  silver: game.definedTrophies?.silver || 0,
  gold: game.definedTrophies?.gold || 0,
  platinum: game.definedTrophies?.platinum || 0,
  earnedBronze: game.earnedTrophies?.bronze || 0,
  earnedSilver: game.earnedTrophies?.silver || 0,
  earnedGold: game.earnedTrophies?.gold || 0,
  earnedPlatinum: game.earnedTrophies?.platinum || 0,
});

// 🟢 FIX: Clean semantic mapping for Xbox
const getXboxCounts = (game: XboxTitle): GameCounts => ({
  ...ZERO_TROPHIES, // Spread the zeros because Xbox has no trophies
  total: game.achievement?.totalGamerscore || 0, // Map Total -> Gamerscore
  earned: game.achievement?.currentGamerscore || 0, // Map Earned -> Gamerscore
});

// --- Exported Processors ---

export const processPsnGame = (game: any): GameVersion => {
  return {
    id: game.npCommunicationId,
    platform: normalizePlatform(game.trophyTitlePlatform),
    progress: game.progress,
    lastPlayed: game.lastUpdatedDateTime || game.earnedDateTime,
    counts: getPsnCounts(game),
    isOwned: true,
  };
};

export const processXboxGame = (
  game: XboxTitle,
  identifyGame?: IdentifyGameFn
): GameVersion | null => {
  if (!game) return null;

  return {
    id: game.titleId,
    platform: "XBOX",
    progress: game.achievement.progressPercentage,
    // Ensure lastUnlock is always a string to prevent date errors
    lastPlayed: game.lastUnlock || new Date().toISOString(),
    counts: getXboxCounts(game),
    isOwned: true,
  };
};
