// src/components/trophies/TrophyGroupHeader.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151b2b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4da3ff",
    borderRadius: 4,
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 10,
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#ddd", // Slightly softer white for DLCs
    fontSize: 15,
    fontWeight: "bold",
  },
  baseGameTitle: {
    fontSize: 17,
    color: "#fff", // Bright white for Base Game
  },
  subtitle: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  // Stat Item Styles
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  statText: {
    color: "#666", // Total count color
    fontSize: 12,
  },
  statEarned: {
    color: "#ccc", // Earned count color (brighter)
    fontWeight: "600",
  },
  // Badge Styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#2a3449",
    minWidth: 40,
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "#4caf50",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  completedText: {
    color: "#000",
  },
});
