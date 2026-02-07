import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#151b2b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // 🟢 FIX 1: More breathing room at the edges
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24, // Increased spacing from handle
  },
  headerRow: {
    flexDirection: "row",
    // 🟢 FIX 2: Align items to 'flex-start' so text doesn't center-align
    // if the description is long compared to the icon
    alignItems: "flex-start",
    marginBottom: 32, // Push actions further down
  },
  largeIconContainer: {
    // 🟢 FIX 3: Much larger icon (was 72)
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#000",
    marginRight: 20, // More gap between icon and text
    justifyContent: "center",
    alignItems: "center",
  },
  largeIcon: {
    width: "100%",
    height: "100%",
  },
  headerTextCol: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 4, // Slight optical alignment with the top of the big icon
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rarityIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  trophyTitle: {
    color: "white",
    // 🟢 FIX 4: Larger, bolder title
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    flex: 1,
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
  description: {
    color: "#a0a0b0",
    fontSize: 15, // Readable size
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 0,
  },
});
