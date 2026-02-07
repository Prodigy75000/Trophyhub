import React, { memo, useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";
import { styles } from "../../styles/TrophySkeleton.styles"; // 🟢 Import

type Props = {
  style?: ViewStyle;
};

function TrophySkeleton({ style }: Props) {
  // Pulse Animation Ref
  const opacity = useRef(new Animated.Value(0.3)).current;

  // Setup Loop
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.7, // Slightly brighter pulse
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(pulse);
    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, style]}>
      {/* Icon Placeholder */}
      <Animated.View style={[styles.icon, { opacity }]} />

      <View style={styles.info}>
        {/* Title Bar */}
        <Animated.View style={[styles.bar, styles.titleBar, { opacity }]} />

        {/* Description Bar */}
        <Animated.View style={[styles.bar, styles.descBar, { opacity }]} />

        {/* Bottom Row (Status + Rarity) */}
        <View style={styles.bottomRow}>
          <Animated.View style={[styles.bar, styles.statusBar, { opacity }]} />
          <Animated.View style={[styles.bar, styles.rarityBar, { opacity }]} />
        </View>
      </View>

      {/* Right Side Stripe */}
      <Animated.View style={[styles.stripe, { opacity }]} />
    </View>
  );
}

export default memo(TrophySkeleton);
