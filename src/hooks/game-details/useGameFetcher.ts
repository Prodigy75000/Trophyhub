import { useCallback, useEffect, useRef, useState } from "react";
import { PROXY_BASE_URL } from "../../../config/endpoints";
import { useTrophy } from "../../../providers/TrophyContext";

export function useGameFetcher(id: string, gameObject: any) {
  const { accessToken, accountId } = useTrophy();
  const [localTrophies, setLocalTrophies] = useState<any[]>([]);
  const [trophyGroups, setTrophyGroups] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedData = useRef(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!id || !accessToken || !accountId) return;

      if (!isRefresh && !hasLoadedData.current) setIsInitialLoading(true);

      try {
        const response = await fetch(
          `${PROXY_BASE_URL}/api/trophies/${accountId}/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) throw new Error("Fetch failed");

        const json = await response.json();

        const rawTrophies = json.trophies || [];
        // 🟢 FIXED: Match the backend key 'groups' sent by trophyController.js
        const rawGroups = json.groups || [];

        if (rawTrophies.length === 0 && localTrophies.length > 0 && !isRefresh) {
          setIsInitialLoading(false);
          return;
        }

        if (rawTrophies.length > 0) {
          hasLoadedData.current = true;
        }

        // 1. NORMALIZE TROPHIES
        const normalizedTrophies = rawTrophies.map((t: any) => ({
          ...t,
          trophyId: Number(t.trophyId),
          trophyGroupId: String(t.trophyGroupId || "default"),
          earned: !!t.earned,
        }));

        setLocalTrophies(normalizedTrophies);

        // 2. PROCESS GROUPS
        let processedGroups: any[] = [];

        if (rawGroups.length > 0) {
          processedGroups = rawGroups.map((g: any) => ({
            ...g,
            trophyGroupId: String(g.trophyGroupId),
            // 🟢 PRESERVE NAMES: Ensure names aren't lost before useTrophyGrouper
            name: g.trophyGroupName || g.groupName || g.name,
            trophyIds: g.trophyIds ? g.trophyIds.map((tid: any) => Number(tid)) : [],
          }));
        }

        // 3. SELF-HEALING (If API groups are missing/incomplete)
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
    [id, accessToken, accountId, localTrophies.length]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  // 🟢 EXPORT SETTERS: Required for useGameDetails to clear stale state for Skeletons
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
