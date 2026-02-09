// components/trophies/ProfileDashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

// Styles
import { styles } from "../../styles/ProfileDashboard.styles"; // Adjust path if you put styles in src/styles/

// ---------------------------------------------------------------------------
// TYPES & ASSETS
// ---------------------------------------------------------------------------

type DashboardProps = {
  username: string;
  avatarUrl?: string | null; // Allow null for safety
  isPlus?: boolean;
  totalTrophies?: number;
  counts?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  level?: number;
};

const TROPHY_ICONS = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

const DEFAULT_AVATAR = "https://i.psnprofiles.com/avatars/l/G566B09312.png";

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Stat Item
// ---------------------------------------------------------------------------

type StatItemProps = {
  icon: ImageSourcePropType;
  count: number;
  color: string;
};

const StatItemComponent = ({ icon, count, color }: StatItemProps) => (
  <View style={styles.statItem}>
    <Image source={icon} style={styles.statIcon} resizeMode="contain" />
    <Text style={[styles.statCount, { color }]}>{count}</Text>
  </View>
);
const StatItem = memo(StatItemComponent);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

const ProfileDashboardComponent = ({
  username,
  avatarUrl,
  isPlus = false,
  counts = { bronze: 0, silver: 0, gold: 0, platinum: 0 }, // Default safety
  level,
}: DashboardProps) => {
  const safeAvatar = avatarUrl || DEFAULT_AVATAR;

  return (
    <View style={styles.container}>
      {/* LEFT SECTION: Avatar & Identity */}
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: safeAvatar }} style={styles.avatar} />

          {/* PS Plus Badge (Top Left) */}
          {isPlus && (
            <View style={styles.plusOverlay}>
              <Ionicons name="add" size={8} color="black" style={styles.plusIcon} />
            </View>
          )}

          {/* Level Badge (Bottom Right) */}
          {level ? (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.username} numberOfLines={1}>
          {username}
        </Text>
      </View>

      {/* RIGHT SECTION: Compact Trophies */}
      <View style={styles.statsRow}>
        <StatItem icon={TROPHY_ICONS.platinum} count={counts.platinum} color="#E5E4E2" />
        <StatItem icon={TROPHY_ICONS.gold} count={counts.gold} color="#FFD700" />
        <StatItem icon={TROPHY_ICONS.silver} count={counts.silver} color="#C0C0C0" />
        <StatItem icon={TROPHY_ICONS.bronze} count={counts.bronze} color="#CD7F32" />
      </View>
    </View>
  );
};

export default memo(ProfileDashboardComponent);
