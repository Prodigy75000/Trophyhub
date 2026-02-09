// src/hooks/context/useXboxLogic.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { XboxProfile, XboxTitle } from "../../types/XboxTypes";

const KEY_XBOX_XSTS = "xbox_xsts_token";
const KEY_XBOX_HASH = "xbox_user_hash";
const KEY_XBOX_XUID = "xbox_xuid";
const KEY_XBOX_GT = "xbox_gamertag";
const KEY_XBOX_PIC = "xbox_gamerpic";

export function useXboxLogic() {
  const [xboxTitles, setXboxTitles] = useState<XboxTitle[]>([]);
  const [xboxProfile, setXboxProfile] = useState<XboxProfile | null>(null);

  // Store tokens in state so we can use them for API calls
  const [xboxTokens, setXboxTokens] = useState<{ xsts: string; hash: string } | null>(
    null
  );

  // 1. SAVE SESSION (Login)
  const handleXboxLogin = useCallback(async (data: any) => {
    console.log("🟢 Xbox Login Success:", data.gamertag);

    setXboxProfile({
      gamertag: data.gamertag,
      gamerpic: data.gamerpic,
      xuid: data.xuid,
    });
    setXboxTokens({ xsts: data.xstsToken, hash: data.userHash });

    await AsyncStorage.multiSet([
      [KEY_XBOX_GT, data.gamertag],
      [KEY_XBOX_PIC, data.gamerpic],
      [KEY_XBOX_XUID, data.xuid],
      [KEY_XBOX_XSTS, data.xstsToken],
      [KEY_XBOX_HASH, data.userHash],
    ]);
  }, []);

  // 2. LOGOUT (Clear Session)
  const logoutXbox = useCallback(async () => {
    console.log("👋 Logging out of Xbox...");
    try {
      await AsyncStorage.multiRemove([
        KEY_XBOX_GT,
        KEY_XBOX_PIC,
        KEY_XBOX_XUID,
        KEY_XBOX_XSTS,
        KEY_XBOX_HASH,
      ]);
      setXboxProfile(null);
      setXboxTokens(null);
      setXboxTitles([]);
    } catch (e) {
      console.warn("Error clearing Xbox storage", e);
    }
  }, []);

  // 3. FETCH GAMES (Titles)
  const fetchXboxGames = useCallback(
    async (overrides?: { xuid: string; xsts: string; hash: string }) => {
      // Use overrides (from immediate login) or state (from session)
      const targetXuid = overrides?.xuid || xboxProfile?.xuid;
      const targetXsts = overrides?.xsts || xboxTokens?.xsts;
      const targetHash = overrides?.hash || xboxTokens?.hash;

      if (!targetXuid || !targetXsts || !targetHash) {
        console.log("⚠️ Xbox Fetch Aborted: Missing Credentials");
        return;
      }

      try {
        console.log(`🟢 Fetching Xbox Games for ${targetXuid}...`);
        // Note: Ensure your backend route matches this exactly
        const res = await fetch(`${PROXY_BASE_URL}/api/xbox/titles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xuid: targetXuid,
            xstsToken: targetXsts,
            userHash: targetHash,
          }),
        });

        if (!res.ok) throw new Error(`Xbox API Error: ${res.status}`);

        const data = await res.json();
        const titles = data.titles || [];
        console.log(`✅ Xbox Games Fetched: ${titles.length} titles`);

        setXboxTitles(titles);
      } catch (e) {
        console.error("❌ Xbox Fetch Error:", e);
      }
    },
    [xboxProfile, xboxTokens]
  );

  // 4. RESTORE SESSION ON MOUNT
  useEffect(() => {
    const loadSession = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          KEY_XBOX_GT,
          KEY_XBOX_PIC,
          KEY_XBOX_XUID,
          KEY_XBOX_XSTS,
          KEY_XBOX_HASH,
        ]);

        // Helper to get value safely
        const getVal = (key: string) => values.find((pair) => pair[0] === key)?.[1];

        const gt = getVal(KEY_XBOX_GT);
        const pic = getVal(KEY_XBOX_PIC);
        const xuid = getVal(KEY_XBOX_XUID);
        const xsts = getVal(KEY_XBOX_XSTS);
        const hash = getVal(KEY_XBOX_HASH);

        if (gt && xuid && xsts && hash) {
          console.log("💾 Xbox Session Restored:", gt);
          setXboxProfile({ gamertag: gt, gamerpic: pic || "", xuid });
          setXboxTokens({ xsts, hash });
        }
      } catch (e) {
        console.error("Failed to load Xbox session", e);
      }
    };
    loadSession();
  }, []);

  return {
    xboxTitles,
    setXboxTitles,
    xboxProfile,
    xboxTokens,
    setXboxProfile,
    handleXboxLogin,
    fetchXboxGames,
    logoutXbox,
  };
}
