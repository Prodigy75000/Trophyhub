// components/trophies/GameCard.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GameVersion } from "../../types/GameTypes"; // 🟢 Import Global Type
import { formatDate } from "../../utils/formatDate";
import ProgressCircle from "../ProgressCircle";

// Styles
import { IMG_SIZE, styles } from "../../styles/GameCard.styles";

// ... Assets ...
const ICONS = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

// 🟢 EXTENDED TYPE: Add masterStats support locally for UI logic
type UI_GameVersion = GameVersion & {
  masterStats?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    total: number;
  };
};

type StatItemProps = {
  icon: ImageSourcePropType;
  earned: number;
  total: number;
  disabled?: boolean;
};

// ---------------------------------------------------------------------------
// SUB-COMPONENTS (Defined outside to prevent re-renders)
// ---------------------------------------------------------------------------

// 1. Stat Item
const StatItemComponent = ({ icon, earned, total, disabled = false }: StatItemProps) => (
  <View style={[styles.statItemContainer, disabled && styles.statItemDisabled]}>
    <Image
      source={icon}
      style={[styles.statIcon, disabled && { tintColor: "#888", opacity: 0.3 }]}
      resizeMode="contain"
    />
    <Text style={[styles.statTotal, disabled && { opacity: 0 }]}>
      <Text style={styles.statEarned}>{earned}</Text>/{total}
    </Text>
  </View>
);
const StatItem = memo(StatItemComponent);

// 2. Xbox Stats
const XboxStatsComponent = ({ activeVer }: { activeVer: UI_GameVersion }) => (
  <View style={styles.xboxContainer}>
    <View style={styles.xboxIconGroup}>
      <View style={styles.xboxIconBadge}>
        <MaterialCommunityIcons name="trophy-variant" size={14} color="#107c10" />
      </View>
      <Text style={styles.xboxTextPrimary}>
        {activeVer.counts.earned ?? 0}
        <Text style={styles.xboxTextSecondary}> / {activeVer.counts.total} G</Text>
      </Text>
    </View>
    {activeVer.progress === 100 && (
      <View style={styles.xboxCompletedBadge}>
        <Text style={styles.xboxCompletedText}>COMPLETED</Text>
      </View>
    )}
  </View>
);
const XboxStats = memo(XboxStatsComponent);

// 3. PSN Stats
const PsnStatsComponent = ({ activeVer }: { activeVer: UI_GameVersion }) => {
  // 🟢 Fixed Type Safety: Only allow keys that exist in both objects
  const getCount = (key: "bronze" | "silver" | "gold" | "platinum") => {
    return activeVer.counts[key] || activeVer.masterStats?.[key] || 0;
  };

  const platTotal = getCount("platinum");
  const goldTotal = getCount("gold");
  const silverTotal = getCount("silver");
  const bronzeTotal = getCount("bronze");

  return (
    <View style={styles.statsRow}>
      <StatItem
        icon={ICONS.platinum}
        earned={activeVer.counts.earnedPlatinum}
        total={platTotal}
        disabled={platTotal === 0}
      />
      <StatItem
        icon={ICONS.gold}
        earned={activeVer.counts.earnedGold}
        total={goldTotal}
      />
      <StatItem
        icon={ICONS.silver}
        earned={activeVer.counts.earnedSilver}
        total={silverTotal}
      />
      <StatItem
        icon={ICONS.bronze}
        earned={activeVer.counts.earnedBronze}
        total={bronzeTotal}
      />
    </View>
  );
};
const PsnStats = memo(PsnStatsComponent);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

type GameCardProps = {
  title: string;
  icon: string;
  art?: string;
  versions: UI_GameVersion[];
  justUpdated?: boolean;
  isPinned?: boolean;
  onPin?: (id: string) => void;
  sourceMode?: "OWNED" | "GLOBAL" | "UNOWNED";
};

const GameCard = ({
  title,
  icon,
  art,
  versions,
  justUpdated,
  isPinned,
  onPin,
  sourceMode,
}: GameCardProps) => {
  const router = useRouter();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [loadIcon, setLoadIcon] = useState(false);

  // Group versions by platform
  const groupedVersions = useMemo(() => {
    const groups: Record<string, UI_GameVersion[]> = {};
    versions.forEach((v) => {
      if (!groups[v.platform]) groups[v.platform] = [];
      groups[v.platform].push(v);
    });
    return groups;
  }, [versions]);

  // Sort platforms (PS5 first)
  const uniquePlatforms = useMemo(() => {
    return Object.keys(groupedVersions).sort((a, b) => {
      if (a === "PS5") return -1;
      if (b === "PS5") return 1;
      return 0;
    });
  }, [groupedVersions]);

  const [activePlatform, setActivePlatform] = useState(uniquePlatforms[0]);

  // Ensure active platform exists in list if props change
  useEffect(() => {
    if (!uniquePlatforms.includes(activePlatform)) {
      setActivePlatform(uniquePlatforms[0]);
    }
  }, [uniquePlatforms, activePlatform]);

  const currentStack = groupedVersions[activePlatform] || [];
  const activeVer = currentStack[0] || versions[0];

  const displayImage = icon;
  const heroArt = art || icon;
  const isSquareFormat = activeVer.platform === "PS5";
  const imageResizeMode = isSquareFormat ? "cover" : "contain";

  // Calculate total for "Started" check
  const totalEarned = useMemo(() => {
    if (!activeVer) return 0;
    return (
      (activeVer.counts.earned || 0) +
      activeVer.counts.earnedBronze +
      activeVer.counts.earnedSilver +
      activeVer.counts.earnedGold +
      activeVer.counts.earnedPlatinum
    );
  }, [activeVer]);

  const hasStarted = totalEarned > 0;

  // Delay image load slightly for smoother list mounting
  useEffect(() => {
    const t = setTimeout(() => setLoadIcon(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Flash animation logic
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
    outputRange: ["rgba(0,0,0,0)", "rgba(255, 215, 0, 0.8)"],
  });

  const handlePress = () => {
    router.push({
      pathname: "/game/[id]",
      params: { id: activeVer.id, artParam: heroArt, contextMode: sourceMode },
    });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <Animated.View style={[styles.cardContainer, { borderColor, borderWidth: 1 }]}>
          {/* LEFT: Cover Image & Badges */}
          <View style={styles.imageColumn}>
            <View style={styles.imageWrapper}>
              {loadIcon && (
                <Image
                  source={{ uri: displayImage }}
                  style={styles.image}
                  resizeMode={imageResizeMode}
                />
              )}
            </View>
            <View style={styles.versionRow}>
              {uniquePlatforms.map((plat) => (
                <TouchableOpacity
                  key={plat}
                  style={[
                    styles.versionBadge,
                    activePlatform === plat
                      ? styles.versionActive
                      : styles.versionInactive,
                  ]}
                  onPress={() => setActivePlatform(plat)}
                >
                  <Text
                    style={[
                      styles.versionText,
                      activePlatform === plat ? { color: "white" } : { color: "#888" },
                    ]}
                  >
                    {plat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* MIDDLE: Info & Stats */}
          <View style={[styles.infoColumn, { height: IMG_SIZE }]}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {title}
            </Text>

            {activeVer.platform === "XBOX" ? (
              <XboxStats activeVer={activeVer} />
            ) : (
              <PsnStats activeVer={activeVer} />
            )}

            {hasStarted ? (
              <Text style={styles.dateText}>
                Last Earned: {formatDate(activeVer.lastPlayed)}
              </Text>
            ) : (
              <Text style={[styles.dateText, { opacity: 0.5 }]}>
                {activeVer.isOwned ? "Not Started" : "Unowned"}
              </Text>
            )}
          </View>

          {/* RIGHT: Progress Circle */}
          <View style={styles.circleColumn}>
            <ProgressCircle progress={activeVer.progress} size={42} strokeWidth={3} />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Pin Button */}
      <TouchableOpacity
        onPress={() => onPin?.(activeVer.id)}
        style={styles.pinButton}
        hitSlop={12}
      >
        <MaterialCommunityIcons
          name={isPinned ? "pin" : "pin-outline"}
          size={16}
          color={isPinned ? "#4da3ff" : "#555"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default memo(GameCard);
