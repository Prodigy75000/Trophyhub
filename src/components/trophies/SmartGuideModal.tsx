// components/trophies/SmartGuideModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Styles
import { styles } from "../../styles/SmartGuideModal.styles";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type SmartGuideProps = {
  visible: boolean;
  onClose: () => void;
  gameName: string;
  trophyName: string;
  mode: "VIDEO" | "GUIDE" | null;
};

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------

const DARK_MODE_INJECTION = `
  (function() {
    try {
      const darkColor = '#151b2b';
      document.documentElement.style.backgroundColor = darkColor;
      document.body.style.backgroundColor = darkColor;

      const style = document.createElement('style');
      style.innerHTML = \`
        body, html { background-color: #151b2b !important; color: white !important; }
        .mobile-topbar-header, ytm-mobile-topbar-renderer { 
          background-color: #151b2b !important; 
          border-bottom: 1px solid #2a3449 !important;
        }
        .mobile-topbar-header-content .search-mode .placeholder { color: #888 !important; }
        .upsell-dialog-renderer, .big-yoodle, .smart-app-banner, .promotion { display: none !important; }
        #cookie-banner, #onetrust-banner-sdk { display: none !important; }
        .adsbygoogle, .ad-banner, [id^="google_ads"] { display: none !important; }
        #header, #footer { display: none !important; }
        .box.no-top-border { display: none !important; }
      \`;
      document.head.appendChild(style);
    } catch (e) { console.error("Injection failed", e); }
  })();
  true;
`;

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36";

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function SmartGuideModal({
  visible,
  onClose,
  gameName,
  trophyName,
  mode,
}: SmartGuideProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  // Memoize URL generation
  const targetUrl = useMemo(() => {
    if (!mode) return "";

    const safeGame = encodeURIComponent(gameName);
    // Add quotes for stricter search matches on trophy names
    const safeTrophy = encodeURIComponent(`"${trophyName}"`);

    if (mode === "VIDEO") {
      return `https://m.youtube.com/results?search_query=${safeGame}+${safeTrophy}+trophy+guide`;
    }
    // Default to PSNProfiles google search
    return `https://www.google.com/search?q=${safeGame}+${safeTrophy}+trophy+guide+psnprofiles`;
  }, [gameName, trophyName, mode]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#151b2b" />

        {/* HEADER */}
        <View style={[styles.header, { marginTop: insets.top }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {mode === "VIDEO" ? "Video Guide" : "Web Guide"}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {trophyName}
            </Text>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loaderContainer}>
            {loading && <ActivityIndicator size="small" color="#4da3ff" />}
          </View>
        </View>

        {/* WEBVIEW */}
        {targetUrl ? (
          <WebView
            source={{ uri: targetUrl }}
            style={styles.webview}
            containerStyle={styles.webviewContainer}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={DARK_MODE_INJECTION}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            userAgent={USER_AGENT}
            startInLoadingState={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={["*"]} // 🟢 Important for navigation
          />
        ) : null}
      </View>
    </Modal>
  );
}
