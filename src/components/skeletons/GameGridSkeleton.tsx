// src/components/skeletons/GameGridSkeleton.tsx
import React, { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  size: number;
};

const GameGridSkeleton = ({ size }: Props) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.card, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6, // Matches the padding/gap of your real items
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)", // Subtle glass effect
    borderRadius: 12,
  },
});

export default memo(GameGridSkeleton);
