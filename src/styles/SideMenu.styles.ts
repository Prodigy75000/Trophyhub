// src/styles/SideMenu.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0b0f" },

  // Header Profile Section
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#4da3ff",
    backgroundColor: "#000",
  },
  userInfo: { marginLeft: 16, flex: 1 },
  username: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  guestText: { color: "#888", fontSize: 14 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  levelText: { color: "#ffd700", fontSize: 12, fontWeight: "800", marginLeft: 4 },

  // --- Auth Buttons ---
  authButtonsContainer: {
    gap: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  // PSN Button (Blue)
  webButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00439c",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  webButtonText: { color: "white", fontSize: 14, fontWeight: "600" },

  // 🟢 NEW: Xbox Button (Green)
  xboxButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#107c10", // Official Xbox Green
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  xboxButtonText: { color: "white", fontSize: 14, fontWeight: "600" },

  // Guest Button (Transparent/Grey)
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  guestButtonText: { color: "#ccc", fontSize: 14, fontWeight: "600" },

  // Sign Out Button
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(211, 47, 47, 0.15)", // Subtle red bg
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(211, 47, 47, 0.3)", // Red border
  },
  signOutText: {
    color: "#ff8a80", // Red text
    fontSize: 14,
    fontWeight: "600",
  },

  // --- Menu List ---
  menuItems: { paddingTop: 20, paddingHorizontal: 16 },
  sectionLabel: {
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconBoxHome: {
    backgroundColor: "rgba(77, 163, 255, 0.1)",
  },
  iconBoxSettings: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  menuText: { flex: 1, color: "white", fontSize: 15, fontWeight: "500" },
  menuTextInactive: { color: "#888" },
  subText: { color: "#666", fontSize: 11, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 16,
    marginHorizontal: 4,
  },

  // --- Footer Area ---
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centered since buttons are gone
    marginBottom: 0,
  },
  versionText: { color: "#444", fontSize: 11, textAlign: "center" },
});
