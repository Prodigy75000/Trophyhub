// components/trophies/GameCard.styles.ts
import { StyleSheet } from "react-native";

export const IMG_SIZE = 124;

export const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#1e1e2d",
    borderRadius: 12,
    padding: 1,
    marginVertical: 1,
    width: "100%",
    alignItems: "center",
  },
  imageColumn: { position: "relative", marginRight: 14, alignItems: "center" },
  imageWrapper: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 8,
    backgroundColor: "#111",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  versionRow: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 4,
    padding: 2,
    gap: 2,
  },
  versionBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  versionActive: { backgroundColor: "#4da3ff" },
  versionInactive: { backgroundColor: "transparent" },
  versionText: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase" },
  infoColumn: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 6,
    marginRight: 8,
  },
  title: { color: "#fff", fontSize: 14, fontWeight: "700", paddingRight: 0 },

  // --- Stats Row Shared ---
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 0,
  },

  // --- PSN Stat Items ---
  statItemContainer: { width: 44, alignItems: "center", marginRight: 4 },
  statItemDisabled: { opacity: 0.5 },
  statIcon: { width: 24, height: 24, marginBottom: 2 },
  statTotal: { color: "#666", fontSize: 11, fontWeight: "600" },
  statEarned: { fontWeight: "800", fontSize: 13, color: "#fff" }, // Added color here

  // --- Xbox Stat Items (New) ---
  xboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  xboxIconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  xboxIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(16, 124, 16, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 124, 16, 0.3)",
  },
  xboxTextPrimary: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  xboxTextSecondary: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
  },
  xboxCompletedBadge: {
    backgroundColor: "rgba(16, 124, 16, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(16, 124, 16, 0.3)",
  },
  xboxCompletedText: {
    color: "#107c10",
    fontSize: 9,
    fontWeight: "bold",
  },

  // --- Footer ---
  circleColumn: { justifyContent: "center", alignItems: "center", paddingRight: 4 },
  dateText: { color: "#888", fontSize: 11 },
  pinButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: "rgba(20, 20, 30, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 10,
  },
});
