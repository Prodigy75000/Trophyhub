// src/components/trophies/TrophyCard.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Shared Utils
import { formatDate } from "../../utils/formatDate";
import { TrophyType } from "../../utils/normalizeTrophy";
import { getRarityTier, RARITY_TIERS } from "../../utils/rarity";

// Styles
import { styles } from "../../styles/TrophyCard.styles";

// Define strict keys for safety
const ICONS: Record<string, ImageSourcePropType> = {
  bronze: require("../../../assets/icons/trophies/bronze.png"),
  silver: require("../../../assets/icons/trophies/silver.png"),
  gold: require("../../../assets/icons/trophies/gold.png"),
  platinum: require("../../../assets/icons/trophies/platinum.png"),
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Rarity Pyramid
// ---------------------------------------------------------------------------
const RarityPyramidComponent = ({ percentage }: { percentage: string }) => {
  const tier = getRarityTier(percentage);

  const activeLevel = useMemo(() => {
    switch (tier) {
      case RARITY_TIERS.ULTRA_RARE:
        return 4;
      case RARITY_TIERS.VERY_RARE:
        return 3;
      case RARITY_TIERS.RARE:
        return 2;
      default:
        return 1;
    }
  }, [tier]);

  return (
    <View style={styles.pyramidContainer}>
      {[4, 3, 2, 1].map((level, index) => (
        <View
          key={level}
          style={[
            styles.pyramidBar,
            {
              width: (index + 1) * 4,
              // Highlight only the active level (matches original design)
              opacity: activeLevel === level ? 1 : 0.2,
            },
          ]}
        />
      ))}
    </View>
  );
};
const RarityPyramid = React.memo(RarityPyramidComponent);

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Progress Bar
// ---------------------------------------------------------------------------
const TrophyProgressBarComponent = ({
  current,
  target,
}: {
  current: string;
  target: string;
}) => {
  const percent = useMemo(() => {
    const c = parseFloat(current);
    const m = parseFloat(target);
    if (isNaN(c) || isNaN(m) || m === 0) return 0;
    return Math.min(100, Math.max(0, (c / m) * 100));
  }, [current, target]);

  return (
    <View style={styles.progressWrapper}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {current} / {target}
      </Text>
    </View>
  );
};
const TrophyProgressBar = React.memo(TrophyProgressBarComponent);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

type Props = {
  id?: number;
  name: string;
  description: string;
  icon?: string | null;
  type: TrophyType;
  earned: boolean;
  earnedAt?: string | null;
  rarity?: string;
  justEarned?: boolean;
  progressValue?: string | null;
  progressTarget?: string | null;
  onPress: () => void;
};

const TrophyCardComponent = ({
  name,
  description,
  icon,
  type,
  earned,
  earnedAt,
  rarity,
  justEarned,
  progressValue,
  progressTarget,
  onPress,
}: Props) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const showProgress = !!(progressValue && progressTarget);

  useEffect(() => {
    if (justEarned) {
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
  }, [justEarned, glowAnim]);

  // Memoize interpolations
  const animatedStyles = useMemo(
    () => ({
      backgroundColor: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#1e1e2d", "#3a3a50"],
      }),
      borderColor: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", "#ffd700"],
      }),
    }),
    [glowAnim]
  );

  const rarityIcon = ICONS[type] || ICONS.bronze;
  const imageUri = icon ? { uri: icon } : ICONS.bronze;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: animatedStyles.backgroundColor,
            borderColor: animatedStyles.borderColor,
            borderWidth: 1,
            opacity: earned ? 1 : 0.7,
          },
        ]}
      >
        <Image source={imageUri} style={styles.icon} />

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Image source={rarityIcon} style={styles.miniRankIcon} resizeMode="contain" />
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.bottomRow}>
            <View style={styles.statusContainer}>
              {showProgress ? (
                <TrophyProgressBar current={progressValue!} target={progressTarget!} />
              ) : earnedAt ? (
                <Text style={styles.earnedDate}>{formatDate(earnedAt)}</Text>
              ) : (
                <Text style={styles.lockedText}>Locked</Text>
              )}
            </View>

            {rarity && (
              <View style={styles.rarityWrapper}>
                <RarityPyramid percentage={rarity} />
                <Text style={styles.rarity}>{rarity}%</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(TrophyCardComponent);
