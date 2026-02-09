import React, { memo, useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";
import { styles } from "../../styles/TrophySkeleton.styles";

type Props = {
  style?: ViewStyle;
};

function TrophySkeleton({ style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.7,
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
      {/* Large Icon on Left */}
      <Animated.View style={[styles.icon, { opacity }]} />

      <View style={styles.info}>
        {/* 1. Title Row (Rank Icon + Title Bar) */}
        <View style={styles.titleRow}>
          <Animated.View style={[styles.miniRankIcon, { opacity }]} />
          <Animated.View style={[styles.nameBar, { opacity }]} />
        </View>

        {/* 2. Description Block (2 lines) */}
        <View style={styles.descriptionBlock}>
          <Animated.View style={[styles.descLine1, { opacity }]} />
          <Animated.View style={[styles.descLine2, { opacity }]} />
        </View>

        {/* 3. Bottom Row (Date/Status + Rarity Pill) */}
        <View style={styles.bottomRow}>
          <Animated.View style={[styles.statusBar, { opacity }]} />
          <Animated.View style={[styles.rarityBar, { opacity }]} />
        </View>
      </View>

      {/* Optional Side Stripe */}
      <Animated.View style={[styles.stripe, { opacity }]} />
    </View>
  );
}

export default memo(TrophySkeleton);
