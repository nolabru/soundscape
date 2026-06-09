import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Palette } from '../theme';
import { useTheme } from '../ThemeContext';
import FloatingBlobs from './FloatingBlobs';

type Props = {
  onBack: () => void;
  children: React.ReactNode;
};

export default function AuthLayout({ onBack, children }: Props) {
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
        </View>
        <View style={s.content}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.fundo },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.azulEscuro, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  content: { flex: 1, paddingHorizontal: 28 },
});
