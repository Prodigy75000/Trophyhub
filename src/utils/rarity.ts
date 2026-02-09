// utils/rarity.ts

export const RARITY_TIERS = {
  ULTRA_RARE: "ULTRA_RARE",
  VERY_RARE: "VERY_RARE",
  RARE: "RARE",
  COMMON: "COMMON",
} as const;

export type RarityTier = (typeof RARITY_TIERS)[keyof typeof RARITY_TIERS];

const RARITY_THRESHOLDS = {
  ULTRA: 5,
  VERY: 15,
  RARE: 50,
};

export const RARITY_COLORS: Record<RarityTier, string> = {
  [RARITY_TIERS.ULTRA_RARE]: "#d4af37", // Gold
  [RARITY_TIERS.VERY_RARE]: "#a0a0a0", // Silver/White
  [RARITY_TIERS.RARE]: "#cd7f32", // Bronze
  [RARITY_TIERS.COMMON]: "#555555", // Dark Grey
};

export function getRarityTier(percentage: number | string): RarityTier {
  const p = typeof percentage === "string" ? parseFloat(percentage) : percentage;

  if (isNaN(p)) return RARITY_TIERS.COMMON;

  if (p <= RARITY_THRESHOLDS.ULTRA) return RARITY_TIERS.ULTRA_RARE;
  if (p <= RARITY_THRESHOLDS.VERY) return RARITY_TIERS.VERY_RARE;
  if (p <= RARITY_THRESHOLDS.RARE) return RARITY_TIERS.RARE;

  return RARITY_TIERS.COMMON;
}

export function getRarityColor(tier: RarityTier): string {
  // Safe access with fallback using the constant key
  return RARITY_COLORS[tier] ?? RARITY_COLORS[RARITY_TIERS.COMMON];
}
