// Define a minimal interface for what this utility expects
// You can replace 'any' with your shared Game type later
interface EarnedTrophies {
  bronze?: number;
  silver?: number;
  gold?: number;
  platinum?: number;
}

interface GameEntity {
  earnedTrophies?: EarnedTrophies;
}

export const calculateUserStats = (games: GameEntity[]) => {
  const initialStats = { bronze: 0, silver: 0, gold: 0, platinum: 0, total: 0 };

  if (!games || games.length === 0) return initialStats;

  return games.reduce((acc, game) => {
    const earned = game.earnedTrophies;
    if (!earned) return acc;

    const b = earned.bronze || 0;
    const s = earned.silver || 0;
    const g = earned.gold || 0;
    const p = earned.platinum || 0;

    acc.bronze += b;
    acc.silver += s;
    acc.gold += g;
    acc.platinum += p;
    acc.total += b + s + g + p;

    return acc;
  }, initialStats);
};

export const calculateTotalTrophies = (games: GameEntity[]) => {
  if (!games || games.length === 0) return 0;

  return games.reduce((acc, game) => {
    const earned = game.earnedTrophies;
    if (!earned) return acc;

    return (
      acc +
      (earned.bronze || 0) +
      (earned.silver || 0) +
      (earned.gold || 0) +
      (earned.platinum || 0)
    );
  }, 0);
};
