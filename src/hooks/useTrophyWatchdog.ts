// hooks/useTrophyWatchdog.ts
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { PROXY_BASE_URL } from "../../config/endpoints";

type WatchdogProps = {
  accessToken: string | null;
  accountId: string | null;
  isReady: boolean;
  onNewTrophyDetected: () => void;
};

export function useTrophyWatchdog({
  accessToken,
  accountId,
  isReady,
  onNewTrophyDetected,
}: WatchdogProps) {
  const lastTotalTrophiesRef = useRef<number>(-1);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!accessToken || !accountId || !isReady) return;

    const checkTrophyCount = async () => {
      try {
        const res = await fetch(`${PROXY_BASE_URL}/api/user/summary/${accountId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 🟢 DEBUG: Watch for the 401
        if (res.status === 401) {
          console.log("🔒 [Watchdog] Token Expired (401). Waiting for app refresh...");
          return; // Stop processing this attempt
        }

        const data = await res.json();

        if (data.earnedTrophies) {
          const newTotal =
            data.earnedTrophies.bronze +
            data.earnedTrophies.silver +
            data.earnedTrophies.gold +
            data.earnedTrophies.platinum;

          const oldTotal = lastTotalTrophiesRef.current;

          if (oldTotal === -1) {
            lastTotalTrophiesRef.current = newTotal;
            return;
          }

          if (newTotal > oldTotal) {
            console.log(`🏆 [Watchdog] Change detected: ${oldTotal} -> ${newTotal}`);
            lastTotalTrophiesRef.current = newTotal;
            onNewTrophyDetected();
          }
        }
      } catch (e) {
        console.warn("[Watchdog] Poll failed (Network/Server)", e);
      }
    };

    // 1. Run immediately
    checkTrophyCount();

    // 2. Poll every 30 seconds
    const interval = setInterval(checkTrophyCount, 30000);

    // 3. Check when App resumes
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        console.log("📱 [Watchdog] App resumed, checking...");
        checkTrophyCount();
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [accessToken, accountId, isReady, onNewTrophyDetected]); // Dependency array ensures restart on token change

  const updateBaseline = (total: number) => {
    lastTotalTrophiesRef.current = total;
  };

  return { updateBaseline };
}
