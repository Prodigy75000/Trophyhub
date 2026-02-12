// src/types/GameTypes.ts
import { XboxTitle } from "./XboxTypes";

// 🟢 NEW: Type for the regional variants within a platform
export interface MasterGameVariant {
  id: string;
  region?: string | null;
  platform?: string; // Added to match your DB data
  // 🟢 FIX: Define stats here so TS knows they exist on the variant!
  stats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

// --- Master DB Types ---
export interface MasterGameEntry {
  canonicalId: string;
  displayName: string;
  iconUrl?: string;
  art?: {
    hero?: string;
    store?: string;
    [key: string]: string | undefined;
  };
  stats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  // Dictionary structure
  platforms?: {
    [platformName: string]: MasterGameVariant[];
  };
  tags?: string[];
  trophies?: any[];
  trophyGroups?: TrophyGroup[];
}

// --- Trophy Data Types ---
export interface GameTrophy {
  trophyId: number;
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyType: string;
  earned: boolean;
  earnedDateTime?: string;
  trophyEarnedRate?: string;
  trophyProgressValue?: number;
  trophyProgressTargetValue?: number;
}

export interface TrophyGroup {
  trophyGroupId: string;
  trophyGroupName?: string;
  groupName?: string;
  trophyGroupIconUrl: string;
  trophyIds: number[];
}

// --- Helper Types for Processing ---
export interface GameCounts {
  total: number;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  earnedBronze: number;
  earnedSilver: number;
  earnedGold: number;
  earnedPlatinum: number;
  earned?: number; // Gamerscore
}

export interface GameVersion {
  id: string;
  platform: string;
  region?: string;
  progress: number;
  lastPlayed?: string | null;
  counts: GameCounts;
  masterStats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  isOwned: boolean;
}

// --- The Unified Game Type ---
export interface UnifiedGame {
  source: "USER" | "MASTER" | "XBOX";
  id: string;

  trophyTitleName: string;
  trophyTitlePlatform: string;
  trophyTitleIconUrl?: string;

  trophyList?: GameTrophy[];

  npCommunicationId?: string;
  definedTrophies?: { bronze: number; silver: number; gold: number; platinum: number };
  earnedTrophies?: { bronze: number; silver: number; gold: number; platinum: number };

  progress: number;

  originalXbox?: XboxTitle;
  masterData?: MasterGameEntry;
}
