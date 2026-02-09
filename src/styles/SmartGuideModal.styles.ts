// components/trophies/SmartGuideModal.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151b2b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3449",
    backgroundColor: "#151b2b",
    height: 60,
  },
  closeBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#888",
    fontSize: 12,
  },
  loaderContainer: {
    width: 40,
    alignItems: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "#151b2b",
  },
  webviewContainer: {
    backgroundColor: "#151b2b",
  },
});
