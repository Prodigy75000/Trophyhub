// src/styles/TrophySkeleton.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1e1e2d",
    borderRadius: 12,
    padding: 4, // was 8
    marginBottom: 2, // was 6
    alignItems: "center",
    // remove height: 80
  },

  icon: {
    width: 100, // was 64
    height: 100, // was 64
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#2a2a3d", // match TrophyCard.icon bg
  },

  info: {
    flex: 1,
    justifyContent: "space-between", // was "center"
    paddingVertical: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Shared Bar Style
  bar: {
    backgroundColor: "#2a2a3a",
    borderRadius: 4,
  },
  // Specific Bars
  titleBar: {
    width: "65%",
    height: 14, // Roughly matches fontSize 14 text height
  },
  descBar: {
    width: "45%",
    height: 12, // Roughly matches fontSize 12 text height
  },
  statusBar: {
    width: 80,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#2a2a3d",
  },

  rarityBar: {
    width: 70,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#2a2a3d",
  },
  // Side Stripe (Matches the 'earned' indicator stripe if you have one, or generic decoration)
  stripe: {
    width: 4,
    height: "60%",
    borderRadius: 2,
    marginLeft: 10,
    backgroundColor: "#2a2a3a",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  miniRankIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "#2a2a3d",
  },

  nameBar: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#2a2a3d",
  },

  descLine1: {
    width: "85%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#2a2a3d",
  },

  descLine2: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#2a2a3d",
    marginTop: 4,
  },

  descriptionBlock: {
    height: 32, // EXACTLY like TrophyCard description height
    marginBottom: 8,
    justifyContent: "center",
  },
});
