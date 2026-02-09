// components/trophies/ProfileDashboard.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151b2b",
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#2a3449",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  // Avatar
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
  },
  // Badges
  plusOverlay: {
    position: "absolute",
    top: -2,
    left: -2,
    backgroundColor: "#FFD700",
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#151b2b",
    zIndex: 2,
  },
  plusIcon: {
    fontWeight: "900",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#DAA520",
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderWidth: 1,
    borderColor: "#151b2b",
    zIndex: 2,
  },
  levelText: {
    color: "#000",
    fontSize: 8,
    fontWeight: "bold",
  },
  username: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    flexShrink: 1,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  statCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
