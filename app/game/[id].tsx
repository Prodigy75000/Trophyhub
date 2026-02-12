// app/game/[id].tsx
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context & Providers
import { useTrophy } from "../../providers/TrophyContext";
// Components
import TrophySkeleton from "../../src/components/skeletons/TrophySkeleton";
import GameHero from "../../src/components/trophies/GameHero";
import TrophyActionSheet from "../../src/components/trophies/TrophyActionSheet";
import TrophyCard from "../../src/components/trophies/TrophyCard";
import TrophyGroupHeader from "../../src/components/trophies/TrophyGroupHeader";
import TrophyListHeader, {
  TrophySortMode,
} from "../../src/components/trophies/TrophyListHeader";

// Hooks & Utils
import { useGameDetails } from "../../src/hooks/game-details/useGameDetails";
import { normalizeTrophyType } from "../../src/utils/normalizeTrophy";

// Styles
import { styles } from "../../src/styles/GameScreen.styles";

const HEADER_HEIGHT = 60;
const ZERO_COUNTS = { bronze: 0, silver: 0, gold: 0, platinum: 0 };

export default function GameScreen() {
  const { id: rawId, artParam, contextMode } = useLocalSearchParams();
  const gameId = Array.isArray(rawId) ? rawId[0] : rawId;
  const contextModeStr = Array.isArray(contextMode) ? contextMode[0] : contextMode;

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 🟢 FIX 1: Consume masterDatabase from Context (No local fetch!)
  const { trophies, masterDatabase } = useTrophy();

  // --- UI STATE ---
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState<TrophySortMode>("DEFAULT");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedTrophy, setSelectedTrophy] = useState<any>(null);

  // --- DATA HOOK ---
  const {
    game,
    isLoadingDetails,
    refreshing,
    onRefresh,
    processedTrophies,
    groupedData,
    justEarnedIds,
  } = useGameDetails(gameId, searchText, sortMode as any, sortDirection);

  // 泙 1. MASTER ENTRY LOOKUP (Uses Context DB)
  const masterEntry = useMemo(() => {
    if (!masterDatabase || masterDatabase.length === 0) return null;

    return masterDatabase.find(
      (g) =>
        g.canonicalId === gameId ||
        // Check platform variants
        (g.platforms &&
          Object.values(g.platforms).some(
            (list: any) => Array.isArray(list) && list.some((v: any) => v.id === gameId)
          ))
    );
  }, [gameId, masterDatabase]);

  // 泙 2. ROBUST ICON RESOLUTION
  const resolvedIcon = useMemo(() => {
    const mArt = masterEntry?.art;
    return (
      mArt?.icon ||
      mArt?.storesquare ||
      game?.trophyTitleIconUrl ||
      mArt?.square ||
      masterEntry?.iconUrl ||
      ""
    );
  }, [masterEntry, game]);

  // 3. Identify instantly if the game has DLC
  const hasDlc = useMemo(() => {
    // Check if we have multiple groups defined in processed data
    return (
      (groupedData && groupedData.length > 1) ||
      (masterEntry?.trophyGroups?.length ?? 0) > 1
    );
  }, [masterEntry, groupedData]);

  // --- LOGIC: REVEAL GATING ---
  const isDataStale = game && String(game.id) !== String(gameId);

  const isContentReady =
    !isLoadingDetails &&
    !isDataStale &&
    game &&
    processedTrophies.length > 0 &&
    (sortMode !== "DEFAULT" || !hasDlc || (hasDlc && groupedData !== null));

  const showListSkeletons = !isContentReady;

  // Reveal Animation
  const listOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(listOpacity, {
      toValue: isContentReady ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isContentReady]);

  // --- 🟢 FIX 2: VERSIONS & SCROLLING ---
  const versions = useMemo(() => {
    let list: any[] = [];

    if (masterEntry?.platforms) {
      // Flatten the dictionary values
      list = Object.values(masterEntry.platforms).flatMap((variantList: any) =>
        Array.isArray(variantList)
          ? variantList.map((v: any) => ({
              id: v.id,
              // 🟢 KEY FIX: Use the specific platform from the variant, not the dictionary key
              platform: v.platform || "Unknown",
              region: v.region,
            }))
          : []
      );
    } else {
      // Fallback if no master data
      list = [{ id: gameId, platform: game?.trophyTitlePlatform || "PSN" }];
    }

    // Deduplicate by ID
    const unique = Array.from(new Map(list.map((v) => [v.id, v])).values());

    // If context is NOT global, filter to only show versions the user has played
    return contextModeStr !== "GLOBAL" && trophies?.trophyTitles
      ? unique.filter((v) =>
          trophies.trophyTitles.some(
            (o: any) => String(o.npCommunicationId) === String(v.id)
          )
        )
      : unique;
  }, [gameId, game, trophies, contextModeStr, masterEntry]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const totalHeaderHeight = HEADER_HEIGHT + insets.top;
  const translateY = Animated.diffClamp(scrollY, 0, totalHeaderHeight).interpolate({
    inputRange: [0, totalHeaderHeight],
    outputRange: [0, -totalHeaderHeight],
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    scrollY.setValue(0);
    setCollapsedGroups(new Set());
    setSearchText("");
  }, [gameId]);

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shouldShowGroups =
    sortMode === "DEFAULT" && groupedData && groupedData.length > 0;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            height: totalHeaderHeight,
            paddingTop: insets.top,
            transform: [{ translateY }],
          },
        ]}
      >
        <TrophyListHeader
          onBack={() => navigation.goBack()}
          onSearch={setSearchText}
          sortMode={sortMode}
          onSortChange={setSortMode}
          sortDirection={sortDirection}
          onSortDirectionChange={() =>
            setSortDirection((p) => (p === "ASC" ? "DESC" : "ASC"))
          }
        />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[styles.listContent, { paddingTop: totalHeaderHeight }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {game && (
          <GameHero
            iconUrl={resolvedIcon}
            title={game.trophyTitleName ?? "Unknown"}
            platform={game.trophyTitlePlatform}
            progress={game.progress}
            earnedTrophies={game.earnedTrophies ?? ZERO_COUNTS}
            definedTrophies={game.definedTrophies ?? ZERO_COUNTS}
            displayArt={typeof artParam === "string" ? artParam : null}
            versions={versions}
            activeId={gameId}
            contextMode={contextModeStr}
          />
        )}

        {/* 泙 SKELETONS */}
        {showListSkeletons && (
          <View style={styles.skeletonContainer}>
            {hasDlc && sortMode === "DEFAULT" && (
              <View
                style={{
                  height: 94,
                  marginHorizontal: 0,
                  marginBottom: 12,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                }}
              />
            )}
            {Array.from({ length: 8 }).map((_, i) => (
              <TrophySkeleton key={i} />
            ))}
          </View>
        )}

        {/* 泙 LIST RENDER */}
        {!showListSkeletons && (
          <Animated.View style={{ opacity: listOpacity }}>
            {shouldShowGroups
              ? (groupedData as any[]).map((group: any) => (
                  <View key={group.id}>
                    <TrophyGroupHeader
                      title={group.name}
                      isBaseGame={group.isBaseGame}
                      counts={group.counts}
                      earnedCounts={group.earnedCounts}
                      progress={group.progress}
                      collapsed={collapsedGroups.has(group.id)}
                      onToggle={() => toggleGroup(group.id)}
                    />
                    {!collapsedGroups.has(group.id) &&
                      group.trophies.map((t: any) => (
                        <TrophyCard
                          key={t.trophyId}
                          {...mapTrophyToProps(t, justEarnedIds, setSelectedTrophy)}
                        />
                      ))}
                  </View>
                ))
              : processedTrophies.map((t: any) => (
                  <TrophyCard
                    key={t.trophyId}
                    {...mapTrophyToProps(t, justEarnedIds, setSelectedTrophy)}
                  />
                ))}
          </Animated.View>
        )}
      </Animated.ScrollView>

      <TrophyActionSheet
        visible={!!selectedTrophy}
        onClose={() => setSelectedTrophy(null)}
        gameName={game?.trophyTitleName ?? ""}
        trophyName={selectedTrophy?.name ?? ""}
        trophyType={selectedTrophy?.type ?? "bronze"}
        trophyIconUrl={selectedTrophy?.iconUrl}
        description={selectedTrophy?.description ?? ""}
      />
    </View>
  );
}

const mapTrophyToProps = (
  trophy: any,
  justEarnedIds: Set<number>,
  onSelect: Function
) => ({
  id: trophy.trophyId,
  name: trophy.trophyName,
  description: trophy.trophyDetail,
  icon: trophy.trophyIconUrl,
  type: normalizeTrophyType(trophy.trophyType),
  earned: !!trophy.earned,
  earnedAt: trophy.earnedDateTime,
  rarity: trophy.trophyEarnedRate,
  justEarned: justEarnedIds.has(trophy.trophyId),
  onPress: () =>
    onSelect({
      name: trophy.trophyName,
      type: normalizeTrophyType(trophy.trophyType),
      iconUrl: trophy.trophyIconUrl,
      description: trophy.trophyDetail,
    }),
});
