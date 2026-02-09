// components/trophies/GameHero.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ProgressCircle from "../ProgressCircle";

// Types
import { GameVersion } from "../../types/GameTypes"; // 🟢 Use shared types

// Styles
import { BASE_ICON_HEIGHT, styles } from "../../styles/GameHero.styles";

type HeroProps = {
  iconUrl: string;
  title: string;
  platform: string;
  progress: number;
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  displayArt?: string | null;
  versions?: GameVersion[]; // 🟢 Typed correctly
  activeId?: string;
  contextMode?: string;
};

export default function GameHero({
  iconUrl,
  title,
  platform,
  progress,
  earnedTrophies = { bronze: 0, silver: 0, gold: 0, platinum: 0 }, // Defaults
  definedTrophies = { bronze: 0, silver: 0, gold: 0, platinum: 0 },
  displayArt,
  versions = [],
  activeId,
  contextMode,
}: HeroProps) {
  const router = useRouter();

  // 1. ASPECT RATIO LOGIC
  const [aspectRatio, setAspectRatio] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (iconUrl) {
      Image.getSize(
        iconUrl,
        (width, height) => {
          if (isMounted && width && height) {
            setAspectRatio(width / height);
            setImageLoaded(true);
          }
        },
        (error) => {
          console.log("Image size error:", error);
          if (isMounted) setImageLoaded(true); // Show fallback
        }
      );
    }
    return () => {
      isMounted = false;
    };
  }, [iconUrl]);

  const isLandscape = aspectRatio > 1.2;
  const iconStyle = {
    height: BASE_ICON_HEIGHT,
    width: isLandscape ? BASE_ICON_HEIGHT * aspectRatio : BASE_ICON_HEIGHT,
    maxWidth: 180, // Prevent it from getting too wide on tablets
  };

  // --- Smart Grouping & State ---
  const grouped = useMemo(() => {
    const map: Record<string, GameVersion[]> = {};
    versions.forEach((v) => {
      // Normalize platform string if needed, or rely on raw data
      const p = v.platform || "Unknown";
      if (!map[p]) map[p] = [];
      map[p].push(v);
    });
    return map;
  }, [versions]);

  const uniquePlatforms = useMemo(
    () =>
      Object.keys(grouped).sort((a, b) => {
        // Prioritize PS5, then PS4
        if (a.includes("PS5")) return -1;
        if (b.includes("PS5")) return 1;
        return 0;
      }),
    [grouped]
  );

  // Determine initial state based on activeId (URL param)
  const initialSetup = useMemo(() => {
    if (!activeId) return { plat: uniquePlatforms[0] || platform, idx: 0 };

    for (const plat of uniquePlatforms) {
      const idx = grouped[plat].findIndex((v) => v.id === activeId);
      if (idx !== -1) return { plat, idx };
    }
    return { plat: uniquePlatforms[0] || platform, idx: 0 };
  }, [activeId, grouped, uniquePlatforms, platform]);

  const [activePlatform, setActivePlatform] = useState(initialSetup.plat);
  const [variantIndex, setVariantIndex] = useState(initialSetup.idx);

  // Sync state when URL params change (e.g., user navigated)
  useEffect(() => {
    setActivePlatform(initialSetup.plat);
    setVariantIndex(initialSetup.idx);
  }, [initialSetup]);

  const handlePlatformSwitch = (plat: string) => {
    if (plat === activePlatform) return;

    // Find the first game ID for this platform
    const targetGame = grouped[plat]?.[0];
    if (targetGame) {
      // Navigation forces a re-mount/update, so we don't strictly need to set state here,
      // but it makes the UI feel snappier.
      setActivePlatform(plat);
      setVariantIndex(0);

      router.replace({
        pathname: "/game/[id]",
        params: { id: targetGame.id, artParam: displayArt, contextMode },
      });
    }
  };

  const handleVariantCycle = () => {
    const stack = grouped[activePlatform] || [];
    if (stack.length <= 1) return;

    const nextIndex = (variantIndex + 1) % stack.length;
    const nextGame = stack[nextIndex];

    setVariantIndex(nextIndex);
    router.replace({
      pathname: "/game/[id]",
      params: { id: nextGame.id, artParam: displayArt, contextMode },
    });
  };

  const totalEarned = useMemo(
    () =>
      (earnedTrophies.bronze || 0) +
      (earnedTrophies.silver || 0) +
      (earnedTrophies.gold || 0) +
      (earnedTrophies.platinum || 0),
    [earnedTrophies]
  );

  const totalDefined = useMemo(
    () =>
      (definedTrophies.bronze || 0) +
      (definedTrophies.silver || 0) +
      (definedTrophies.gold || 0) +
      (definedTrophies.platinum || 0),
    [definedTrophies]
  );

  const currentStack = grouped[activePlatform] || [];
  const hasVariants = currentStack.length > 1;
  const currentRegion = currentStack[variantIndex]?.region || "Region"; // Fallback text

  return (
    <View style={styles.container}>
      {/* ARTWORK BACKGROUND */}
      <View style={styles.artContainer}>
        <Image
          source={{ uri: displayArt || iconUrl }}
          style={styles.artImage}
          blurRadius={displayArt ? 0 : 30}
          resizeMode="cover"
        />
        <LinearGradient colors={["transparent", "#000"]} style={styles.gradient} />
      </View>

      {/* TOP LEFT: Platform Badges */}
      <View style={styles.topBadgesContainer}>
        <View style={styles.platformRow}>
          {uniquePlatforms.length > 0 ? (
            uniquePlatforms.map((plat) => (
              <TouchableOpacity
                key={plat}
                style={[
                  styles.versionBadge,
                  plat === activePlatform ? styles.versionActive : styles.versionInactive,
                ]}
                onPress={() => handlePlatformSwitch(plat)}
              >
                <Text
                  style={[
                    styles.versionText,
                    plat === activePlatform ? { color: "white" } : { color: "#888" },
                  ]}
                >
                  {plat}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.platformBadgeFallback}>
              <Text style={styles.versionText}>{platform}</Text>
            </View>
          )}
        </View>
      </View>

      {/* TOP RIGHT: Region Switcher */}
      {hasVariants && (
        <TouchableOpacity
          style={styles.regionBtn}
          onPress={handleVariantCycle}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="earth" size={14} color="#4da3ff" />
          <Text style={styles.regionBtnText}>
            {currentRegion}
            <Text style={styles.regionCounterText}>
              {" "}
              ({variantIndex + 1}/{currentStack.length})
            </Text>
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#aaa" />
        </TouchableOpacity>
      )}

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {/* ICON */}
          <View
            style={[
              styles.iconWrapperBase,
              { width: iconStyle.width, height: iconStyle.height },
            ]}
          >
            {/* Only show icon if loaded or fallback to square to prevent jump */}
            <Image source={{ uri: iconUrl }} style={styles.icon} resizeMode="cover" />
          </View>

          {/* TITLE & STATS */}
          <View style={styles.rightColumn}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.trophyCount}>
                <Text style={styles.trophyLabel}>Trophies Earned</Text>
                <Text style={styles.trophyValue}>
                  {totalEarned} <Text style={styles.totalText}>/ {totalDefined}</Text>
                </Text>
              </View>

              <View style={styles.circleWrapper}>
                <ProgressCircle progress={progress} size={46} strokeWidth={4} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
