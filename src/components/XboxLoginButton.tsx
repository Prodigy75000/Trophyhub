// src/components/XboxLoginButton.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
// 🟢 Use the smart client instead of raw fetch
import { clientFetch } from "../api/client";

type Props = {
  onSuccess: (data: any) => void;
};

const CLIENT_ID = "5e278654-b281-411b-85f4-eb7fb056e5ba";

// 🟢 FIX: Use a clean 'auth' path for Xbox redirects
const REDIRECT_URI = AuthSession.makeRedirectUri({
  path: "auth",
});

const DISCOVERY = {
  authorizationEndpoint:
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
  tokenEndpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
};

export default function XboxLoginButton({ onSuccess }: Props) {
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
    if (response?.type === "success") {
      const { code } = response.params;

      const exchangeToken = async () => {
        try {
          // 🟢 Use standardized /api/xbox route via smart client
          const res = await clientFetch("/api/xbox/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              redirectUri: REDIRECT_URI,
              codeVerifier: request?.codeVerifier,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Token exchange failed");

          onSuccess(data);
        } catch (e: any) {
          console.error("❌ Xbox Exchange Error:", e);
          Alert.alert("Xbox Login Failed", e.message);
        }
      };
      exchangeToken();
    }
  }, [response, request]);

  return (
    <TouchableOpacity
      style={[styles.xboxButton, !request && { opacity: 0.5 }]}
      disabled={!request}
      onPress={() => promptAsync()}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name="microsoft-xbox"
        size={20}
        color="white"
        style={styles.buttonIcon}
      />
      <Text style={styles.xboxButtonText}>Sign In with Xbox</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  xboxButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#107c10",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  xboxButtonText: { color: "white", fontSize: 14, fontWeight: "600" },
  buttonIcon: { marginRight: 8 },
});
