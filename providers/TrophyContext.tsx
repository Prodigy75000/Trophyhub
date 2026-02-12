// providers/TrophyContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PROXY_BASE_URL } from "../config/endpoints";
import { setupApiClient } from "../src/api/client";
import { usePsnSession } from "../src/hooks/context/usePsnSession";
import { useTrophyData } from "../src/hooks/context/useTrophyData";
import { useXboxLogic } from "../src/hooks/context/useXboxLogic";
import { useTrophyWatchdog } from "../src/hooks/useTrophyWatchdog";
import { TrophyContextType } from "../src/types/ContextTypes";
import { MasterGameEntry } from "../src/types/GameTypes";
import { calculateTotalTrophies } from "../src/utils/trophyCalculations";

const TrophyContext = createContext<TrophyContextType | null>(null);

export const TrophyProvider = ({ children }: { children: React.ReactNode }) => {
  const psn = usePsnSession();
  const xbox = useXboxLogic();
  const data = useTrophyData(psn.accessToken, psn.accountId);

  const [masterDatabase, setMasterDatabase] = useState<MasterGameEntry[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(true);

  // 1. Define Logout FIRST so it can be used in dependencies
  const handleLogout = React.useCallback(async () => {
    await psn.logout();
    await xbox.logoutXbox();
    data.setTrophies(null);
    xbox.setXboxTitles([]);
    xbox.setXboxProfile(null);
  }, [psn, xbox, data]);

  // 2. Initialize API Client
  useEffect(() => {
    setupApiClient(
      psn.accessToken,
      psn.refreshToken,
      (newAccess, newRefresh) => {
        console.log("💾 [Context] Syncing refreshed tokens...");
        psn.updateTokensOnly(newAccess, newRefresh);
      },
      () => {
        handleLogout();
      }
    );
    // 🟢 Fixed Dependencies
  }, [psn.accessToken, psn.refreshToken, psn.updateTokensOnly, handleLogout]);

  // 3. Fetch Master DB
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const res = await fetch(`${PROXY_BASE_URL}/api/games`);
        const dbData = await res.json();
        setMasterDatabase(Array.isArray(dbData) ? dbData : []);
      } catch (e) {
        console.warn("⚠️ Master DB fetch failed in Context:", e);
      } finally {
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

  const value = useMemo(
    () => ({
      ...psn,
      ...xbox,
      ...data,
      logout: handleLogout,
      isMasterLoading,
      masterDatabase,
    }),
    // 🟢 Fixed Dependencies
    [psn, xbox, data, masterDatabase, isMasterLoading, handleLogout]
  );

  return <TrophyContext.Provider value={value}>{children}</TrophyContext.Provider>;
};

export const useTrophy = () => {
  const ctx = useContext(TrophyContext);
  if (!ctx) throw new Error("useTrophy must be used within TrophyProvider");
  return ctx;
};
