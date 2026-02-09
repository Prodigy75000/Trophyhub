// components/trophies/TrophyActionSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components & Utils
import { TrophyType } from "../../utils/normalizeTrophy";
import SmartGuideModal from "./SmartGuideModal";

// Styles
import { styles } from "../../styles/TrophyActionSheet.styles";

// ---------------------------------------------------------------------------
// TYPES & ASSETS
// ---------------------------------------------------------------------------

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  gameName: string;
  trophyName: string;
  trophyType: TrophyType;
  trophyIconUrl?: string;
  trophyDetail?: string;
  description: string;
};

// Use explicit Require to avoid dynamic require issues
const TROPHY_ICONS: Record<string, any> = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

const RANK_COLORS: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
  platinum: "#e5e4e2",
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Action Button
// ---------------------------------------------------------------------------

type ActionButtonProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  onPress: () => void;
};

const ActionButtonComponent = ({
  iconName,
  color,
  label,
  onPress,
}: ActionButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionBtn,
      {
        backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
      },
    ]}
  >
    <View style={[styles.actionIconCircle, { backgroundColor: `${color}20` }]}>
      <Ionicons name={iconName} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>
);

const ActionButton = memo(ActionButtonComponent);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

function TrophyActionSheet({
  visible,
  onClose,
  gameName,
  trophyName,
  trophyType,
  trophyIconUrl,
  trophyDetail,
  description,
}: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeGuide, setActiveGuide] = useState<{
    mode: "VIDEO" | "GUIDE";
  } | null>(null);

  // --- Handlers ---
  const handleWatchGuide = () => {
    // 🟢 Temporarily close sheet to show guide modal (optional UX choice)
    // onClose();
    setActiveGuide({ mode: "VIDEO" });
  };

  const handleReadGuide = () => {
    setActiveGuide({ mode: "GUIDE" });
  };

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(`${gameName} ${trophyName} trophy guide`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
    onClose();
  };

  // 1. Large Art (Left Side): Use specific art if available, otherwise rank icon
  const displayArt = trophyIconUrl
    ? { uri: trophyIconUrl }
    : TROPHY_ICONS[trophyType] || TROPHY_ICONS.bronze;

  // 2. Small Icon (Title Row): Always show the rank icon (Bronze/Silver/...)
  const rankIcon = TROPHY_ICONS[trophyType] || TROPHY_ICONS.bronze;
  const rankColor = RANK_COLORS[trophyType] || "#ffffff";

  return (
    <>
      {/* 1. Guide Modal (Shows on top of everything) */}
      <SmartGuideModal
        visible={!!activeGuide}
        onClose={() => setActiveGuide(null)}
        gameName={gameName}
        trophyName={trophyName}
        mode={activeGuide?.mode ?? null}
      />

      {/* 2. The Action Sheet Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          {/* Tap outside to close */}
          <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

          <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.dragHandle} />

            {/* HEADER ROW */}
            <View style={styles.headerRow}>
              {/* Left: Large Square Art */}
              <View style={[styles.largeIconContainer, { borderColor: rankColor }]}>
                <Image source={displayArt} style={styles.largeIcon} resizeMode="cover" />
              </View>

              {/* Right: Info Column */}
              <View style={styles.headerTextCol}>
                <View style={styles.titleRow}>
                  <Image
                    source={rankIcon}
                    style={styles.rarityIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.trophyTitle} numberOfLines={2}>
                    {trophyName}
                  </Text>
                </View>

                <Text style={styles.description}>{description}</Text>

                <Text style={styles.gameTitle} numberOfLines={1}>
                  {gameName}
                </Text>

                {trophyDetail ? (
                  <Text style={styles.trophyDesc} numberOfLines={2}>
                    {trophyDetail}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* ACTIONS GRID */}
            <View style={styles.actionsGrid}>
              <ActionButton
                iconName="logo-youtube"
                color="#ff4444"
                label="Video"
                onPress={handleWatchGuide}
              />
              <ActionButton
                iconName="book"
                color="#4da3ff"
                label="Guide"
                onPress={handleReadGuide}
              />
              <ActionButton
                iconName="search"
                color="#aaaaaa"
                label="Google"
                onPress={handleGoogleSearch}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default memo(TrophyActionSheet);
