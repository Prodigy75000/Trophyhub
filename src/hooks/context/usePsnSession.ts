// src/hooks/context/usePsnSession.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { UserProfile } from "../../types/ContextTypes";

// Constants for Storage Keys
const KEY_ACCESS_TOKEN = "user_access_token";
const KEY_REFRESH_TOKEN = "user_refresh_token";
const KEY_EXPIRES_AT = "user_token_expires_at";
const KEY_ACCOUNT_ID = "user_account_id";
const KEY_ONLINE_ID = "user_online_id";
const KEY_AVATAR_URL = "user_avatar_url";

export function usePsnSession() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // 1. LOGOUT
  const logout = useCallback(async () => {
    console.log("👋 Logging out...");
    try {
      await AsyncStorage.multiRemove([
        KEY_ACCESS_TOKEN,
        KEY_REFRESH_TOKEN,
        KEY_EXPIRES_AT,
        KEY_ACCOUNT_ID,
        KEY_ONLINE_ID,
        KEY_AVATAR_URL,
      ]);
    } catch (e) {
      console.warn("Error clearing storage", e);
    }
    setAccessToken(null);
    setAccountId(null);
    setUser(null);
  }, []);

  // 2. SAVE LOGIN
  const handleLoginResponse = useCallback(async (data: any) => {
    const now = Date.now();
    // Default to 1 hour if not provided
    const expiresIn = data.expiresIn || 3600;
    const expiresAt = now + expiresIn * 1000;

    // Update State
    setAccessToken(data.accessToken);
    setAccountId(data.accountId);

    // Construct User Object
    // 🟢 FIX: Remove explicit ': UserProfile' type to allow 'isPlus' property
    const newProfile = {
      onlineId: data.onlineId || "Guest",
      avatarUrl: data.avatarUrl || "https://i.imgur.com/6Cklq5z.png",
      isPlus: data.isPlus || false,
      trophyLevel: data.trophyLevel || 1,
    };

    // Cast to unknown first to bypass 'excess property' checks
    setUser(newProfile as unknown as UserProfile);

    // Persist to Storage
    const pairs: [string, string][] = [
      [KEY_ACCESS_TOKEN, data.accessToken],
      [KEY_ACCOUNT_ID, data.accountId],
      [KEY_EXPIRES_AT, expiresAt.toString()],
    ];

    if (data.refreshToken) pairs.push([KEY_REFRESH_TOKEN, data.refreshToken]);
    if (data.onlineId) pairs.push([KEY_ONLINE_ID, data.onlineId]);
    if (data.avatarUrl) pairs.push([KEY_AVATAR_URL, data.avatarUrl]);

    try {
      await AsyncStorage.multiSet(pairs);
    } catch (e) {
      console.error("Failed to save session to storage", e);
    }
  }, []);

  // 3. AUTO LOAD SESSION
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        // Read all keys safely
        const values = await AsyncStorage.multiGet([
          KEY_ACCESS_TOKEN,
          KEY_ACCOUNT_ID,
          KEY_REFRESH_TOKEN,
          KEY_EXPIRES_AT,
          KEY_ONLINE_ID,
          KEY_AVATAR_URL,
        ]);

        // Helper to get value by key
        const getVal = (key: string) => values.find((pair) => pair[0] === key)?.[1];

        const token = getVal(KEY_ACCESS_TOKEN);
        const id = getVal(KEY_ACCOUNT_ID);
        const refresh = getVal(KEY_REFRESH_TOKEN);
        const expiryStr = getVal(KEY_EXPIRES_AT);
        const onlineId = getVal(KEY_ONLINE_ID);
        const avatarUrl = getVal(KEY_AVATAR_URL);

        if (token && id) {
          const now = Date.now();
          const expiresAt = expiryStr ? parseInt(expiryStr, 10) : 0;

          // Check if expired (or expiring in < 5 mins)
          if (refresh && now > expiresAt - 5 * 60 * 1000) {
            console.log("⚠️ Token Expired! Attempting Refresh...");
            try {
              const res = await fetch(`${PROXY_BASE_URL}/api/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: refresh }),
              });

              if (res.ok) {
                const newData = await res.json();
                console.log("✅ Session Refreshed Successfully!");
                if (mounted) {
                  // We pass 'id' because refresh endpoint might not return accountId
                  await handleLoginResponse({ ...newData, accountId: id });
                }
                return;
              } else {
                console.warn("Refresh failed (4xx/5xx), logging out.");
                if (mounted) await logout();
                return;
              }
            } catch (err) {
              console.warn("Refresh failed (Network), logging out.");
              if (mounted) await logout();
              return;
            }
          }

          console.log("💾 PSN Session Valid");
          if (mounted) {
            setAccessToken(token);
            setAccountId(id);
            // 🟢 FIX: Handle potential missing props in type definition
            setUser({
              onlineId: onlineId || "Unknown",
              avatarUrl: avatarUrl || "https://i.imgur.com/6Cklq5z.png",
              isPlus: false,
              trophyLevel: 1,
            } as unknown as UserProfile);
          }
        }
      } catch (e) {
        console.error("Failed to load PSN session", e);
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [logout, handleLoginResponse]);

  return {
    accountId,
    setAccountId,
    accessToken,
    setAccessToken,
    user,
    setUser,
    logout,
    handleLoginResponse,
  };
}
