// providers/TrophyContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PROXY_BASE_URL } from "../config/endpoints"; // 🟢 Import Config
import { usePsnSession } from "../src/hooks/context/usePsnSession";
import { useTrophyData } from "../src/hooks/context/useTrophyData";
import { useXboxLogic } from "../src/hooks/context/useXboxLogic";
import { useTrophyWatchdog } from "../src/hooks/useTrophyWatchdog";
import { TrophyContextType } from "../src/types/ContextTypes";
import { MasterGameEntry } from "../src/types/GameTypes"; // 🟢 Import Type
import { calculateTotalTrophies } from "../src/utils/trophyCalculations";

const TrophyContext = createContext<TrophyContextType | null>(null);

export const TrophyProvider = ({ children }: { children: React.ReactNode }) => {
  const psn = usePsnSession();
  const xbox = useXboxLogic();
  const data = useTrophyData(psn.accessToken, psn.accountId);

  // 🟢 STATE: Hold the Master DB globally
  const [masterDatabase, setMasterDatabase] = useState<MasterGameEntry[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(true);

  // 🟢 EFFECT: Fetch Master DB once on mount
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const res = await fetch(`${PROXY_BASE_URL}/api/games`);
        const dbData = await res.json();
        setMasterDatabase(Array.isArray(dbData) ? dbData : []);
      } catch (e) {
        console.warn("⚠️ Master DB fetch failed in Context:", e);
      } finally {
        // 🟢 DONE: Whether it worked or failed, stop loading
        setIsMasterLoading(false);
      }
    };
    loadMaster();
  }, []);

  const watchdog = useTrophyWatchdog({
    accessToken: psn.accessToken,
    accountId: psn.accountId,
    isReady: !!data.trophies,
    onNewTrophyDetected: data.refreshAllTrophies,
  });

  useEffect(() => {
    if (data.trophies?.trophyTitles) {
      const total = calculateTotalTrophies(data.trophies.trophyTitles);
      watchdog.updateBaseline(total);
    }
  }, [data.trophies, watchdog]);

  const handleLogout = async () => {
    await psn.logout();
    await xbox.logoutXbox();
    data.setTrophies(null);
    xbox.setXboxTitles([]);
    xbox.setXboxProfile(null);
  };

  const value = useMemo(
    () => ({
      ...psn,
      ...xbox,
      ...data,
      logout: handleLogout,
      isMasterLoading,
      masterDatabase, // 🟢 EXPOSE IT HERE
    }),
    [psn, xbox, data, masterDatabase]
  );

  return <TrophyContext.Provider value={value}>{children}</TrophyContext.Provider>;
};

export const useTrophy = () => {
  const ctx = useContext(TrophyContext);
  if (!ctx) throw new Error("useTrophy must be used within TrophyProvider");
  return ctx;
};
