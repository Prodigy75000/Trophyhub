import React, { createContext, useContext, useEffect, useMemo } from "react";
import { usePsnSession } from "../src/hooks/context/usePsnSession";
import { useTrophyData } from "../src/hooks/context/useTrophyData";
import { useXboxLogic } from "../src/hooks/context/useXboxLogic";
import { useTrophyWatchdog } from "../src/hooks/useTrophyWatchdog"; // 🟢 Used here now
import { TrophyContextType } from "../src/types/ContextTypes";
import { calculateTotalTrophies } from "../src/utils/trophyCalculations";

const TrophyContext = createContext<TrophyContextType | null>(null);

export const TrophyProvider = ({ children }: { children: React.ReactNode }) => {
  const psn = usePsnSession();
  const xbox = useXboxLogic();
  const data = useTrophyData(psn.accessToken, psn.accountId);

  // 🟢 WATCHDOG INTEGRATION (Moved from Data Hook to Context)
  // This prevents circular dependencies and keeps the data hook pure.
  const watchdog = useTrophyWatchdog({
    accessToken: psn.accessToken,
    accountId: psn.accountId,
    isReady: !!data.trophies,
    onNewTrophyDetected: data.refreshAllTrophies,
  });

  // Update Watchdog Baseline when trophies change
  useEffect(() => {
    if (data.trophies?.trophyTitles) {
      const total = calculateTotalTrophies(data.trophies.trophyTitles);
      watchdog.updateBaseline(total);
    }
  }, [data.trophies, watchdog]);

  const handleLogout = async () => {
    await psn.logout();
    data.setTrophies(null);
    xbox.setXboxTitles([]);
    xbox.setXboxProfile(null);
  };

  const value = useMemo(
    () => ({
      ...psn,
      ...xbox,
      ...data, // This includes lastUpdated & isLoadingCache
      logout: handleLogout,
    }),
    [psn, xbox, data]
  );

  return <TrophyContext.Provider value={value}>{children}</TrophyContext.Provider>;
};

export const useTrophy = () => {
  const ctx = useContext(TrophyContext);
  if (!ctx) throw new Error("useTrophy must be used within TrophyProvider");
  return ctx;
};
