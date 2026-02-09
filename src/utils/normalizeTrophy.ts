export const TROPHY_TYPES = ["bronze", "silver", "gold", "platinum"] as const;

export type TrophyType = (typeof TROPHY_TYPES)[number];

export function normalizeTrophyType(type?: string): TrophyType {
  if (!type) return "bronze";

  const lowerType = type.toLowerCase();

  // efficient check using the readonly array
  if (TROPHY_TYPES.includes(lowerType as TrophyType)) {
    return lowerType as TrophyType;
  }

  return "bronze";
}
