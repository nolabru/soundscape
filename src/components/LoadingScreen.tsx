import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { fonts, Palette } from '../theme';
import { useTheme } from '../ThemeContext';
import FloatingBlobs from './FloatingBlobs';

export default function LoadingScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] });

  return (
    <View style={s.root}>
      <FloatingBlobs />
      <View style={s.center}>
        <View style={s.dotWrap}>
          <Animated.View style={[s.halo, { transform: [{ scale: haloScale }], opacity: haloOpacity }]} />
          <Animated.View style={[s.dot, { transform: [{ scale }], opacity }]} />
        </View>
        <Text style={s.label}>SoundScapes</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.fundo },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dotWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.azulClaro },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.azulEscuro },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textoSecundario, marginTop: 20, letterSpacing: 0.5 },
});
