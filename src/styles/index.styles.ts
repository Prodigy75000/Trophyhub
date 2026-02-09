// app/index.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Root
  container: {
    flex: 1,
    backgroundColor: "#0a0b0f",
  },

  // Header (Animated)
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#0a0b0f",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

  // List
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 0,
  },

  // States
  errorText: {
    color: "#ff4444",
    marginTop: 100,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    color: "#888",
    marginTop: 100,
    textAlign: "center",
  },

  // UI Elements
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4da3ff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  toastContainer: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "rgba(30, 30, 45, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 2000,
  },
  toastText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
