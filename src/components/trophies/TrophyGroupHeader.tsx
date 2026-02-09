// components/trophies/TrophyGroupHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

// Styles
import { styles } from "../../styles/TrophyGroupHeader.styles"; // Adjust path if needed

// ---------------------------------------------------------------------------
// ASSETS & TYPES
// ---------------------------------------------------------------------------

const ICONS = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

type CountSet = {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
};

type Props = {
  title: string;
  image?: string;
  isBaseGame: boolean;
  counts: CountSet;
  earnedCounts: CountSet;
  progress?: number;
  collapsed: boolean;
  onToggle: () => void;
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Stat Item
// ---------------------------------------------------------------------------

type StatProps = {
  icon: ImageSourcePropType;
  earned: number;
  total: number;
};

// Defined as a named function for better debugging/linting
const StatItem = ({ icon, earned, total }: StatProps) => (
  <View style={styles.statContainer}>
    <Image source={icon} style={styles.statIcon} resizeMode="contain" />
    <Text style={styles.statText}>
      <Text style={styles.statEarned}>{earned}</Text>/{total}
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

const TrophyGroupHeaderComponent = ({
  title,
  isBaseGame,
  counts,
  earnedCounts,
  progress,
  collapsed,
  onToggle,
}: Props) => {
  // 1. Calculate Totals
  const totalCount = counts.bronze + counts.silver + counts.gold + counts.platinum;
  const earnedCount =
    earnedCounts.bronze + earnedCounts.silver + earnedCounts.gold + earnedCounts.platinum;

  // 2. Determine Display Percentage
  const displayPercent =
    progress !== undefined
      ? progress
      : totalCount > 0
        ? Math.round((earnedCount / totalCount) * 100)
        : 0;

  const isCompleted = displayPercent === 100;

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      {/* TOP ROW: Title & Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text
            style={[styles.title, isBaseGame && styles.baseGameTitle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {isBaseGame ? "Base Game" : "DLC"} • {earnedCount}/{totalCount} Trophies
          </Text>
        </View>

        {/* Right Side: Badge + Chevron */}
        <View style={styles.rightSide}>
          <View style={[styles.badge, isCompleted && styles.completedBadge]}>
            <Text style={[styles.badgeText, isCompleted && styles.completedText]}>
              {displayPercent}%
            </Text>
          </View>

          <Ionicons
            name={collapsed ? "chevron-down" : "chevron-up"}
            size={20}
            color="#888"
          />
        </View>
      </View>

      {/* BOTTOM ROW: Stats Summary */}
      <View style={styles.statsRow}>
        <StatItem
          icon={ICONS.bronze}
          earned={earnedCounts.bronze}
          total={counts.bronze}
        />
        <StatItem
          icon={ICONS.silver}
          earned={earnedCounts.silver}
          total={counts.silver}
        />
        <StatItem icon={ICONS.gold} earned={earnedCounts.gold} total={counts.gold} />
        {counts.platinum > 0 && (
          <StatItem
            icon={ICONS.platinum}
            earned={earnedCounts.platinum}
            total={counts.platinum}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Export memoized component
export default memo(TrophyGroupHeaderComponent);
