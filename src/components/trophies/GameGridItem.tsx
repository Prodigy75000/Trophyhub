// src/components/trophies/GameGridItem.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/GameGridItem.styles";
import { GameVersion } from "../../types/GameTypes"; // 🟢 Correct Type Import
import ProgressCircle from "../ProgressCircle";

const trophyIcons = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

// 🟢 EXTENDED TYPE: Local UI version with optional masterStats
type UI_GameVersion = GameVersion & {
  masterStats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    total: number;
  };
};

type Props = {
  title: string;
  icon: string;
  heroArt?: string;
  versions: UI_GameVersion[];
  numColumns: number;
  justUpdated?: boolean;
  isPinned?: boolean;
  onPin?: (id: string) => void;
  isPeeking?: boolean;
  onTogglePeek?: () => void;
  sourceMode?: "OWNED" | "GLOBAL" | "UNOWNED";
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Peek Row
// ---------------------------------------------------------------------------
const PeekRowComponent = ({
  icon,
  earned,
  total,
}: {
  icon: ImageSourcePropType;
  earned: number;
  total: number;
}) => (
  <View style={styles.peekRow}>
    <Image source={icon} style={styles.peekIcon} resizeMode="contain" />
    <View style={styles.peekTextContainer}>
      <Text style={styles.peekEarned}>{earned}</Text>
      <Text style={styles.peekTotal}>/{total}</Text>
    </View>
  </View>
);
const PeekRow = memo(PeekRowComponent);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const GameGridItem = ({
  title,
  icon,
  heroArt,
  versions,
  numColumns,
  justUpdated,
  isPinned,
  onPin,
  isPeeking = false,
  onTogglePeek,
  sourceMode,
}: Props) => {
  const router = useRouter();
  const glowAnim = useRef(new Animated.Value(0)).current;

  // --- Smart Grouping ---
  const groupedVersions = useMemo(() => {
    const groups: Record<string, UI_GameVersion[]> = {};
    if (!versions) return {};
    versions.forEach((v) => {
      if (!groups[v.platform]) groups[v.platform] = [];
      groups[v.platform].push(v);
    });
    // Sort versions inside platforms by progress (optional)
    Object.keys(groups).forEach((plat) => {
      groups[plat].sort((a, b) => b.progress - a.progress);
    });
    return groups;
  }, [versions]);

  const uniquePlatforms = useMemo(() => {
    return Object.keys(groupedVersions).sort((a, b) => {
      if (a === "PS5") return -1;
      if (b === "PS5") return 1;
      return 0;
    });
  }, [groupedVersions]);

  const [activePlatform, setActivePlatform] = useState(uniquePlatforms[0] || "PS4");

  // Update active platform if uniquePlatforms changes (e.g. filter change)
  useEffect(() => {
    if (!uniquePlatforms.includes(activePlatform) && uniquePlatforms.length > 0) {
      setActivePlatform(uniquePlatforms[0]);
    }
  }, [uniquePlatforms]);

  const activeVer = groupedVersions[activePlatform]?.[0] || versions[0];

  const handlePlatformPress = (e: any, plat: string) => {
    e.stopPropagation();
    setActivePlatform(plat);
  };

  // Dimensions
  const screenWidth = Dimensions.get("window").width;
  const size = screenWidth / numColumns;

  const isPS5 = activeVer?.platform === "PS5";
  const dynamicResizeMode = "contain";

  // Helper: Use User Data if available, otherwise Master Stats
  const getCount = (key: "bronze" | "silver" | "gold" | "platinum") => {
    return activeVer.counts[key] || activeVer.masterStats?.[key] || 0;
  };

  // Animation Logic
  useEffect(() => {
    if (justUpdated) {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(2000),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [justUpdated, glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0)", "rgba(255, 215, 0, 1)"],
  });

  // Interaction Logic
  const lastTapRef = useRef<number>(0);
  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 800; //ms

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap -> Navigate
      router.push({
        pathname: "/game/[id]",
        params: { id: activeVer.id, artParam: heroArt || icon, contextMode: sourceMode },
      });
      lastTapRef.current = 0;
    } else {
      // Single Tap -> Peek (Toggle Overlay)
      if (onTogglePeek) onTogglePeek();
      lastTapRef.current = now;
    }
  };

  if (!activeVer) return null;

  return (
    <View style={[styles.gridItemContainer, { width: size, height: size }]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Animated.View
          style={[
            styles.cardContent,
            {
              borderWidth: justUpdated ? 2 : 0,
              borderColor,
            },
          ]}
        >
          <Image
            source={{ uri: icon }}
            style={styles.image}
            resizeMode={dynamicResizeMode}
          />

          {isPS5 && <View style={styles.overlay} />}

          {!isPeeking && (
            <View style={styles.titleBadge}>
              <Text numberOfLines={2} style={styles.titleText}>
                {title}
              </Text>
            </View>
          )}

          {isPeeking && (
            <View style={styles.peekOverlay}>
              <View style={styles.peekContent}>
                {/* Show Platinum only if it exists */}
                {(activeVer.counts.platinum > 0 ||
                  (activeVer.masterStats?.platinum ?? 0) > 0) && (
                  <PeekRow
                    icon={trophyIcons.platinum}
                    earned={activeVer.counts.earnedPlatinum}
                    total={getCount("platinum")}
                  />
                )}
                <PeekRow
                  icon={trophyIcons.gold}
                  earned={activeVer.counts.earnedGold}
                  total={getCount("gold")}
                />
                <PeekRow
                  icon={trophyIcons.silver}
                  earned={activeVer.counts.earnedSilver}
                  total={getCount("silver")}
                />
                <PeekRow
                  icon={trophyIcons.bronze}
                  earned={activeVer.counts.earnedBronze}
                  total={getCount("bronze")}
                />
              </View>
            </View>
          )}

          {!isPeeking && (
            <View style={styles.versionRow}>
              {uniquePlatforms.map((plat) => {
                const isActive = activePlatform === plat;
                return (
                  <Pressable
                    key={plat}
                    style={[
                      styles.versionBadge,
                      isActive ? styles.versionActive : styles.versionInactive,
                    ]}
                    onPress={(e) => handlePlatformPress(e, plat)}
                  >
                    <Text
                      style={[styles.versionText, isActive && styles.versionTextActive]}
                    >
                      {plat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!isPeeking && (
            <View style={styles.progressContainer}>
              <ProgressCircle progress={activeVer.progress} size={36} strokeWidth={3} />
            </View>
          )}
        </Animated.View>
      </Pressable>

      {(isPinned || isPeeking) && (
        <TouchableOpacity
          onPress={() => onPin?.(activeVer.id)}
          style={styles.pinButton}
          hitSlop={10}
        >
          <MaterialCommunityIcons
            name={isPinned ? "pin" : "pin-outline"}
            size={14}
            color={isPinned ? "#4da3ff" : "#fff"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(GameGridItem);
