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

  // 🟢 Fix: Store callback in ref to prevent effect re-running
  const onNewTrophyDetectedRef = useRef(onNewTrophyDetected);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onNewTrophyDetectedRef.current = onNewTrophyDetected;
  }, [onNewTrophyDetected]);

  useEffect(() => {
    if (!accessToken || !accountId || !isReady) return;

    const checkTrophyCount = async () => {
      try {
        const res = await fetch(`${PROXY_BASE_URL}/api/user/summary/${accountId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.status === 401) {
          console.log("🔒 [Watchdog] Token Expired (401). Pause polling.");
          return;
        }

        const data = await res.json();

        if (data.earnedTrophies) {
          const newTotal =
            (data.earnedTrophies.bronze || 0) +
            (data.earnedTrophies.silver || 0) +
            (data.earnedTrophies.gold || 0) +
            (data.earnedTrophies.platinum || 0);

          const oldTotal = lastTotalTrophiesRef.current;

          // Initialize baseline on first run
          if (oldTotal === -1) {
            lastTotalTrophiesRef.current = newTotal;
            return;
          }

          if (newTotal > oldTotal) {
            console.log(`🏆 [Watchdog] Change detected: ${oldTotal} -> ${newTotal}`);
            lastTotalTrophiesRef.current = newTotal;
            // Call the ref
            onNewTrophyDetectedRef.current?.();
          }
        }
      } catch (e) {
        console.warn("[Watchdog] Poll failed", e);
      }
    };

    // 1. Run immediately
    checkTrophyCount();

    // 2. Poll every 30 seconds
    const interval = setInterval(checkTrophyCount, 30000);

    // 3. Listen for App Resume
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        console.log("📱 [Watchdog] App resumed, forcing check...");
        checkTrophyCount();
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [accessToken, accountId, isReady]);
  // 🟢 Removed `onNewTrophyDetected` from dependency array to prevent loops

  const updateBaseline = (total: number) => {
    lastTotalTrophiesRef.current = total;
  };

  return { updateBaseline };
}
