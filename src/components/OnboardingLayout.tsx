import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Palette } from '../theme';
import { useTheme } from '../ThemeContext';
import FloatingBlobs from './FloatingBlobs';

const TOTAL_STEPS = 5;

type Props = {
  step: number;
  onBack: () => void;
  children: React.ReactNode;
};

export default function OnboardingLayout({ step, onBack, children }: Props) {
  const { colors, dark } = useTheme();
  const s = makeStyles(colors);
  return (
    <View style={s.root}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <FloatingBlobs />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronLeft size={24} color={colors.textoPrimario} />
          </TouchableOpacity>

          <View style={s.progress}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[s.dot, i < step ? s.dotAtivo : s.dotInativo]} />
            ))}
          </View>

          <View style={s.spacer} />
        </View>

        <View style={s.content}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.fundo },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.azulEscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  spacer: { width: 40, height: 40 },
  progress: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  dotAtivo: { width: 22, backgroundColor: colors.azulClaro },
  dotInativo: { width: 6, backgroundColor: colors.borda },
  content: { flex: 1, paddingHorizontal: 28 },
});
