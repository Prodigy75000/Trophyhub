// src/types/XboxTypes.ts
export interface XboxTitle {
  titleId: string;
  name: string;
  displayImage: string;
  devices: string[];
  achievement: {
    currentAchievements: number;
    totalAchievements: number;
    currentGamerscore: number;
    totalGamerscore: number;
    progressPercentage: number;
  };
  lastUnlock: string;
}

export interface XboxProfile {
  xuid: string;
  gamertag: string;
  gamerpic: string;
}
