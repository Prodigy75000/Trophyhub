// src/styles/ProgressCircle.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  // We rotate the SVG so progress starts at 12 o'clock, not 3 o'clock
  svg: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  text: {
    fontWeight: "700",
    textAlign: "center",
  },
});
