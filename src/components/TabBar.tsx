import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Waves, NotebookPen, ChartColumn, User, Siren, LucideIcon } from 'lucide-react-native';
import { fonts, Palette } from '../theme';
import { useTheme } from '../ThemeContext';

const ICONS: Record<string, LucideIcon> = {
  Mixer: Waves,
  Diario: NotebookPen,
  Analises: ChartColumn,
  Configuracoes: User,
};

const LABELS: Record<string, string> = {
  Mixer: 'Sons',
  Diario: 'Diário',
  Analises: 'Análises',
  Configuracoes: 'Perfil',
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  function renderTab(route: BottomTabBarProps['state']['routes'][number], index: number) {
    const focused = state.index === index;
    const Icon = ICONS[route.name];

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TouchableOpacity key={route.key} style={[s.tab, focused && s.tabActive]} onPress={onPress} activeOpacity={0.8}>
        <Icon size={21} color={focused ? colors.azulEscuro : colors.textoSecundario} />
        {focused && <Text style={s.label}>{LABELS[route.name]}</Text>}
      </TouchableOpacity>
    );
  }

  const meio = Math.ceil(state.routes.length / 2);

  return (
    <View style={[s.wrap, { paddingBottom: insets.bottom ? insets.bottom : 16 }]} pointerEvents="box-none">
      <View style={s.pill}>
        {state.routes.slice(0, meio).map((route, i) => renderTab(route, i))}

        <TouchableOpacity style={s.panic} onPress={() => (navigation as any).navigate('Panico')} activeOpacity={0.85}>
          <Siren size={24} color={colors.branco} />
        </TouchableOpacity>

        {state.routes.slice(meio).map((route, i) => renderTab(route, i + meio))}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.borda,
    shadowColor: colors.azulEscuro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 22,
    gap: 7,
  },
  tabActive: {
    backgroundColor: colors.tint,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.azulEscuro,
  },
  panic: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.perigo,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: colors.perigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
