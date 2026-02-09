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

// Data
import masterGamesRaw from "../../data/master_games.json";

const HEADER_HEIGHT = 60;
const ZERO_COUNTS = { bronze: 0, silver: 0, gold: 0, platinum: 0 };

export default function GameScreen() {
  const { id: rawId, artParam, contextMode } = useLocalSearchParams();
  const gameId = Array.isArray(rawId) ? rawId[0] : rawId;
  const contextModeStr = Array.isArray(contextMode) ? contextMode[0] : contextMode;

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { trophies } = useTrophy();

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

  // 1. Identify instantly if the game has DLC from local JSON.tsx]
  const hasDlc = useMemo(() => {
    const entry = (masterGamesRaw as any[]).find(
      (g) =>
        g.canonicalId === gameId ||
        Object.values(g.platforms || {}).some((l: any) =>
          l.some((v: any) => v.id === gameId)
        )
    );
    return (entry?.trophyGroups?.length ?? 0) > 1;
  }, [gameId]);

  // --- LOGIC: REVEAL GATING ---
  const isDataStale = game && String(game.id) !== String(gameId);

  const isContentReady =
    !isLoadingDetails &&
    !isDataStale &&
    game &&
    processedTrophies.length > 0 &&
    (sortMode !== "DEFAULT" || !hasDlc || (hasDlc && groupedData !== null)); //.tsx]

  const showListSkeletons = !isContentReady;

  // Reveal Animation.tsx]
  const listOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(listOpacity, {
      toValue: isContentReady ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isContentReady]);

  // --- VERSIONS & SCROLLING ---
  const versions = useMemo(() => {
    const entry = (masterGamesRaw as any[]).find(
      (g) =>
        g.canonicalId === gameId ||
        Object.values(g.platforms || {}).some((l: any) =>
          l.some((v: any) => v.id === gameId)
        )
    );
    let list = entry?.platforms
      ? Object.entries(entry.platforms).flatMap(([p, vs]: any) =>
          vs.map((v: any) => ({ id: v.id, platform: p, region: v.region }))
        )
      : [{ id: gameId, platform: game?.trophyTitlePlatform || "PSN" }];
    const unique = Array.from(new Map(list.map((v) => [v.id, v])).values());
    return contextModeStr !== "GLOBAL" && trophies?.trophyTitles
      ? unique.filter((v) =>
          trophies.trophyTitles.some(
            (o: any) => String(o.npCommunicationId) === String(v.id)
          )
        )
      : unique;
  }, [gameId, game, trophies, contextModeStr]);

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
            iconUrl={game.trophyTitleIconUrl ?? ""}
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

        {/* 🟢 SKELETONS WITH FIXED RESERVED SPACE.tsx] */}
        {showListSkeletons && (
          <View style={styles.skeletonContainer}>
            {/* Reserved space set to 0 horizontal margin to match your fix */}
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

        {/* 🟢 LIST RENDER.tsx] */}
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
