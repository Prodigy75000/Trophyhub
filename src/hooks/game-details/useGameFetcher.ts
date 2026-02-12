// src/hooks/game-details/useGameFetcher.ts
import { useCallback, useEffect, useRef, useState } from "react";
// 🟢 1. Import the smart client (Adjust path if your folder structure is different)
import { useTrophy } from "../../../providers/TrophyContext";
import { clientFetch } from "../../api/client";

export function useGameFetcher(id: string, gameObject: any) {
  const { accessToken, accountId, trophies } = useTrophy();

  const [localTrophies, setLocalTrophies] = useState<any[]>([]);
  const [trophyGroups, setTrophyGroups] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedData = useRef(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      // Basic guard: If we don't have a token in Context yet, don't even try.
      if (!id || !accessToken || !accountId) return;

      if (!isRefresh && !hasLoadedData.current) setIsInitialLoading(true);

      try {
        // 🟢 2. Use clientFetch instead of raw fetch
        // - No PROXY_BASE_URL needed (handled by client)
        // - No Headers needed (handled by client)
        const response = await clientFetch(`/api/trophies/${accountId}/${id}`);

        if (!response.ok) throw new Error("Fetch failed");

        const json = await response.json();

        const rawTrophies = json.trophies || [];
        const rawGroups = json.groups || [];

        // Safety check to prevent UI flickering
        if (rawTrophies.length === 0 && localTrophies.length > 0 && !isRefresh) {
          setIsInitialLoading(false);
          return;
        }

        if (rawTrophies.length > 0) {
          hasLoadedData.current = true;
        }

        // --- STEP 1: NORMALIZE TROPHIES ---
        const normalizedTrophies = rawTrophies.map((t: any) => ({
          ...t,
          trophyId: Number(t.trophyId),
          trophyGroupId: String(t.trophyGroupId || "default"),
          earned: !!t.earned,
        }));

        setLocalTrophies(normalizedTrophies);

        // --- STEP 2: PROCESS GROUPS ---
        let processedGroups: any[] = [];

        if (rawGroups.length > 0) {
          processedGroups = rawGroups.map((g: any) => ({
            ...g,
            trophyGroupId: String(g.trophyGroupId),
            name: g.trophyGroupName || g.groupName || g.name,
            trophyIds: g.trophyIds ? g.trophyIds.map((tid: any) => Number(tid)) : [],
          }));
        }

        // --- STEP 3: SELF-HEALING LOGIC ---
        if (processedGroups.length === 0 || !processedGroups[0].trophyIds?.length) {
          const groupMap = new Map<string, any>();

          normalizedTrophies.forEach((t: any) => {
            const gId = t.trophyGroupId;

            if (!groupMap.has(gId)) {
              const match = rawGroups.find(
                (rg: any) =>
                  String(rg.trophyGroupId) === gId ||
                  Number(rg.trophyGroupId) === Number(gId)
              );

              let name = match?.trophyGroupName || match?.groupName || match?.name;
              if (!name) {
                if (gId === "default" || gId === "0" || gId === "-1") {
                  name = "Base Game";
                } else {
                  name = `DLC ${parseInt(gId, 10) || gId}`;
                }
              }

              groupMap.set(gId, {
                trophyGroupId: gId,
                name: name,
                trophyIds: [],
              });
            }
            groupMap.get(gId).trophyIds.push(t.trophyId);
          });

          processedGroups = Array.from(groupMap.values());
        }

        setTrophyGroups(processedGroups);
      } catch (error) {
        console.error("❌ [Fetcher] Error:", error);
      } finally {
        setIsInitialLoading(false);
        setRefreshing(false);
      }
    },
    [id, accessToken, accountId, localTrophies.length, trophies]
  );

  useEffect(() => {
    fetchData(hasLoadedData.current);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  return {
    localTrophies,
    setLocalTrophies,
    trophyGroups,
    setTrophyGroups,
    isInitialLoading,
    refreshing,
    onRefresh,
  };
}
