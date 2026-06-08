import React, { useEffect, useRef } from 'react';
import { Animated, Easing, DimensionValue, ViewStyle } from 'react-native';
import { colors } from '../theme';

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: ViewStyle;
};

export default function Skeleton({ width = '100%', height, radius = 12, style }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: '#E4EAF2', opacity }, style]}
    />
  );
}
