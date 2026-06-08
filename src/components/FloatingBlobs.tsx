import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type Blob = {
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  color: string;
  opacity: number;
  delay: number;
  range: number;
};

const BLOBS: Blob[] = [
  { size: 180, top: -30, right: -50, color: colors.azulClaro, opacity: 0.16, delay: 0, range: 18 },
  { size: 120, top: 140, left: -45, color: colors.azulMedio, opacity: 0.12, delay: 400, range: 14 },
  { size: 100, top: 280, right: 20, color: colors.azulClaro, opacity: 0.1, delay: 600, range: 16 },
  { size: 90, bottom: 180, right: -25, color: colors.azulClaro, opacity: 0.13, delay: 800, range: 20 },
  { size: 64, bottom: 110, left: 24, color: colors.azulMedio, opacity: 0.1, delay: 1200, range: 12 },
];

function FloatingBlob({ blob }: { blob: Blob }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, delay: blob.delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -blob.range] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: blob.size,
        height: blob.size,
        borderRadius: blob.size / 2,
        backgroundColor: blob.color,
        opacity: blob.opacity,
        top: blob.top,
        bottom: blob.bottom,
        left: blob.left,
        right: blob.right,
        transform: [{ translateY }],
      }}
    />
  );
}

export default function FloatingBlobs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BLOBS.map((blob, i) => (
        <FloatingBlob key={i} blob={blob} />
      ))}
    </View>
  );
}
