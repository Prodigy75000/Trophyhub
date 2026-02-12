// src/hooks/auth/useXboxAuth.ts
import * as AuthSession from "expo-auth-session";
import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";

// 🟢 NEW: Use your smart client and standardized routes
import { useTrophy } from "../../../providers/TrophyContext";
import { clientFetch } from "../../api/client";

const CLIENT_ID = "5e278654-b281-411b-85f4-eb7fb056e5ba";

// 🟢 FIX: Use a clean path.
// When running in Expo Go, this will look like exp://192.168.x.x:8081/--/auth
const REDIRECT_URI = AuthSession.makeRedirectUri({
  path: "auth",
});

const DISCOVERY = {
  authorizationEndpoint:
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
  tokenEndpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
};

export function useXboxAuth() {
  // Consolidate context calls
  const { setXboxProfile, handleXboxLogin, fetchXboxGames } = useTrophy();

  const exchangingRef = useRef(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ["XboxLive.Signin", "offline_access"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { prompt: "select_account" },
    },
    DISCOVERY
  );

  useEffect(() => {
    const handleExchange = async () => {
      if (response?.type !== "success") return;
      if (exchangingRef.current) return;

      const code = response.params.code;
      const codeVerifier = request?.codeVerifier;

      if (!codeVerifier) {
        Alert.alert("Login Error", "State mismatch: PKCE Verifier is missing.");
        return;
      }

      exchangingRef.current = true;

      try {
        console.log("🔄 Exchanging Xbox Code via Smart Client...");

        // 🟢 Use clientFetch and standardized /api/xbox route
        const res = await clientFetch("/api/xbox/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: REDIRECT_URI,
            codeVerifier,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Exchange Failed");

        // 1. Save to Context/Storage
        await handleXboxLogin(data);

        // 2. Fetch Games Immediately
        fetchXboxGames({
          xuid: data.xuid,
          xsts: data.xstsToken,
          hash: data.userHash,
        });

        Alert.alert("Xbox Connected", `Logged in as ${data.gamertag}`);
      } catch (e: any) {
        console.error("❌ Xbox Auth Error:", e);
        Alert.alert("Xbox Login Failed", e.message);
        exchangingRef.current = false;
      }
    };

    handleExchange();
  }, [response, request, setXboxProfile, handleXboxLogin, fetchXboxGames]);

  const login = useCallback(() => {
    if (request) {
      exchangingRef.current = false;
      promptAsync();
    }
  }, [request, promptAsync]);
  console.log("👉 COPY THIS:", REDIRECT_URI);
  return { login };
}
