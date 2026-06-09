import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';

export default function RedeApoioScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [avisarEmCrise, setAvisarEmCrise] = useState(true);
  const [temPsicologo, setTemPsicologo] = useState(false);
  const prev = route?.params?.onboardingData ?? {};

  function next() {
    navigation.navigate('Permissoes', {
      onboardingData: {
        ...prev,
        contato_emergencia_nome: nome,
        contato_emergencia_tel: tel,
        avisar_em_crise: avisarEmCrise,
        tem_psicologo: temPsicologo,
      },
    });
  }

  return (
    <OnboardingLayout step={3} onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.flex} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <Text style={s.title}>Rede de apoio</Text>
          <Text style={s.sub}>Quem podemos avisar em um momento de crise.</Text>

          <Text style={s.label}>Nome do contato</Text>
          <TextInput style={s.input} value={nome} onChangeText={setNome} placeholder="Ex: Mãe, pai, amigo(a)" placeholderTextColor="#9AA8BD" />

          <Text style={s.label}>Telefone</Text>
          <TextInput style={s.input} value={tel} onChangeText={setTel} placeholder="+55 11 99999-9999" keyboardType="phone-pad" placeholderTextColor="#9AA8BD" />

          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Avisar esta pessoa quando eu estiver em crise</Text>
            <Switch value={avisarEmCrise} onValueChange={setAvisarEmCrise} trackColor={{ true: colors.azulClaro, false: colors.borda }} thumbColor={colors.branco} />
          </View>

          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Já tenho acompanhamento psicológico</Text>
            <Switch value={temPsicologo} onValueChange={setTemPsicologo} trackColor={{ true: colors.azulClaro, false: colors.borda }} thumbColor={colors.branco} />
          </View>
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton label="Continuar" onPress={next} />
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 16 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 28 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginBottom: 8, marginTop: 16 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.textoPrimario,
    backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: colors.borda,
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, backgroundColor: colors.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.borda,
  },
  switchLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoPrimario, flex: 1, marginRight: 12 },
  footer: { paddingBottom: 16, paddingTop: 8 },
  skip: { alignItems: 'center', marginTop: 14 },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoSecundario },
});
