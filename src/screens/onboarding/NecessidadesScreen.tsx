import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';

const LOCAIS = ['Escola', 'Transporte público', 'Shopping', 'Trabalho', 'Casa', 'Restaurante', 'Hospital', 'Outro'];

export default function NecessidadesScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const prev = route?.params?.onboardingData ?? {};

  function toggle(local: string) {
    setSelecionados(s => s.includes(local) ? s.filter(l => l !== local) : [...s, local]);
  }

  return (
    <OnboardingLayout step={2} onBack={() => navigation.goBack()}>
      <View style={s.body}>
        <Text style={s.title}>Onde você costuma{'\n'}ter crises?</Text>
        <Text style={s.sub}>Selecione todos os que se aplicam.</Text>

        <View style={s.grid}>
          {LOCAIS.map(l => {
            const ativo = selecionados.includes(l);
            return (
              <TouchableOpacity key={l} style={[s.chip, ativo && s.chipAtivo]} onPress={() => toggle(l)} activeOpacity={0.8}>
                <Text style={[s.chipText, ativo && s.chipTextoAtivo]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.footer}>
        <PrimaryButton
          label="Continuar"
          onPress={() => navigation.navigate('RedeApoio', { onboardingData: { ...prev, locais_crise: selecionados } })}
        />
      </View>
    </OnboardingLayout>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, lineHeight: 34, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 24,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borda,
  },
  chipAtivo: { backgroundColor: colors.azulEscuro, borderColor: colors.azulEscuro },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoSecundario },
  chipTextoAtivo: { color: colors.branco },
  footer: { paddingBottom: 16, paddingTop: 8 },
});
