import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { MicOff, MapPin } from 'lucide-react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts } from '../../theme';

export default function PermissoesScreen({ navigation, route }: any) {
  const prev = route?.params?.onboardingData ?? {};

  async function ativar() {
    try { await Audio.requestPermissionsAsync(); } catch (_) {}
    try { await Notifications.requestPermissionsAsync(); } catch (_) {}
    navigation.navigate('TesteRefugio', { onboardingData: { ...prev, guardiao_ativo: true } });
  }

  function pular() {
    navigation.navigate('TesteRefugio', { onboardingData: { ...prev, guardiao_ativo: false } });
  }

  return (
    <OnboardingLayout step={4} onBack={() => navigation.goBack()}>
      <View style={s.body}>
        <Text style={s.title}>Sistema Guardião</Text>
        <Text style={s.sub}>Uma proteção que escuta o ambiente por você.</Text>

        <View style={s.card}>
          <View style={s.featureRow}>
            <View style={s.featureIcon}><MapPin size={20} color={colors.azulClaro} /></View>
            <Text style={s.featureText}>
              Monitora o volume do ambiente em segundo plano e sugere o seu Refúgio antes da crise.
            </Text>
          </View>
          <View style={s.divider} />
          <View style={s.featureRow}>
            <View style={s.featureIcon}><MicOff size={20} color={colors.azulClaro} /></View>
            <Text style={s.featureText}>
              Nenhuma voz é gravada. Apenas o volume é medido, e tudo é processado localmente.
            </Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <PrimaryButton label="Ativar Guardião" onPress={ativar} showArrow={false} />
        <TouchableOpacity onPress={pular} style={s.skip}>
          <Text style={s.skipText}>Ativar depois nas configurações</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 28 },
  card: { backgroundColor: colors.branco, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E2E8F2' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  featureIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAF1FA',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  featureText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, lineHeight: 21 },
  divider: { height: 1, backgroundColor: '#EEF2F8', marginVertical: 16 },
  footer: { paddingBottom: 16, paddingTop: 8 },
  skip: { alignItems: 'center', marginTop: 14 },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoSecundario },
});
