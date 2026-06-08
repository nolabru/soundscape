import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

const { width: W } = Dimensions.get('window');
const H = 220;

// Caminho de onda periódico (período = W), desenhado em 2 períodos para deslizar sem emenda.
function wavePath(amplitude: number, baseY: number): string {
  const seg = (o: number) =>
    `C ${o + W * 0.17},${baseY - amplitude} ${o + W * 0.33},${baseY - amplitude} ${o + W * 0.5},${baseY} ` +
    `C ${o + W * 0.67},${baseY + amplitude} ${o + W * 0.83},${baseY + amplitude} ${o + W},${baseY}`;
  return `M0,${baseY} ${seg(0)} ${seg(W)} L ${2 * W},${H} L 0,${H} Z`;
}

type LayerProps = { amplitude: number; baseY: number; color: string; opacity: number; duration: number };

function WaveLayer({ amplitude, baseY, color, opacity, duration }: LayerProps) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, -W] });

  return (
    <Animated.View style={[styles.layer, { transform: [{ translateX }] }]}>
      <Svg width={2 * W} height={H}>
        <Path d={wavePath(amplitude, baseY)} fill={color} fillOpacity={opacity} />
      </Svg>
    </Animated.View>
  );
}

export default function WaveBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <WaveLayer amplitude={22} baseY={120} color={colors.azulMedio} opacity={0.35} duration={9000} />
      <WaveLayer amplitude={28} baseY={150} color={colors.azulClaro} opacity={0.3} duration={7000} />
      <WaveLayer amplitude={18} baseY={180} color={colors.azulClaro} opacity={0.45} duration={5000} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: H },
  layer: { position: 'absolute', left: 0, bottom: 0 },
});
