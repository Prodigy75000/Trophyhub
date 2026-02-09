// src/components/trophies/TrophyActionSheet.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Modal Background
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)", // Slightly darker for better contrast
    justifyContent: "flex-end",
  },

  // Sheet Content
  sheetContainer: {
    backgroundColor: "#151b2b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16, // Reduced top padding slightly
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  // Little grey bar at top
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },

  // Top Section: Icon + Text
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
  },

  // Big Square Art
  largeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#000",
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  largeIcon: {
    width: "100%",
    height: "100%",
  },

  // Text Column
  headerTextCol: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 4,
  },

  // Title Row (Small Rank Icon + Name)
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap", // Allow wrapping for long titles
  },
  rarityIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  trophyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    flexShrink: 1, // Ensure text wraps instead of pushing layout
  },

  // Subtitles
  description: {
    color: "#a0a0b0",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  gameTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  trophyDesc: {
    color: "#aaa",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 4,
  },

  // Bottom Buttons
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    color: "#ddd",
    fontSize: 13,
    fontWeight: "600",
  },
});
