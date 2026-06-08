import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CloudRain, Waves, Trees, Radio, Music, Check } from 'lucide-react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts } from '../../theme';

const SONS = [
  { id: 'chuva', label: 'Chuva Suave', desc: 'Som contínuo e suave de chuva', Icon: CloudRain },
  { id: 'ondas', label: 'Ondas do Mar', desc: 'Ondas quebrando na praia', Icon: Waves },
  { id: 'floresta', label: 'Floresta', desc: 'Pássaros e vento entre árvores', Icon: Trees },
  { id: 'branco', label: 'Ruído Branco', desc: 'Frequências uniformes, bloqueia sons agudos', Icon: Radio },
  { id: 'marrom', label: 'Ruído Marrom', desc: 'Frequências graves, como trovoada distante', Icon: Music },
];

export default function TesteRefugioScreen({ navigation, route }: any) {
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const prev = route?.params?.onboardingData ?? {};

  function concluir() {
    if (!escolhido) return;
    navigation.navigate('Cadastro', { onboardingData: { ...prev, som_refugio: escolhido } });
  }

  return (
    <OnboardingLayout step={5} onBack={() => navigation.goBack()}>
      <View style={s.body}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Seu Refúgio Sonoro</Text>
          <Text style={s.sub}>Escolha o som que mais traz conforto. Ele será ativado em momentos de crise.</Text>

          {SONS.map(({ id, label, desc, Icon }) => {
            const ativo = escolhido === id;
            return (
              <TouchableOpacity key={id} style={[s.card, ativo && s.cardAtivo]} onPress={() => setEscolhido(id)} activeOpacity={0.85}>
                <View style={[s.cardIcon, ativo && s.cardIconAtivo]}>
                  <Icon size={22} color={ativo ? colors.branco : colors.azulClaro} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={[s.cardTitle, ativo && s.cardTitleAtivo]}>{label}</Text>
                  <Text style={s.cardDesc}>{desc}</Text>
                </View>
                {ativo && (
                  <View style={s.check}>
                    <Check size={16} color={colors.branco} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={s.footer}>
        <PrimaryButton label="Finalizar" disabled={!escolhido} showArrow={false} onPress={concluir} />
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  body: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 24, lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16,
    backgroundColor: colors.branco, borderWidth: 1, borderColor: '#E2E8F2', marginBottom: 12,
  },
  cardAtivo: { borderColor: colors.azulEscuro, backgroundColor: '#F4F8FD' },
  cardIcon: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#EAF1FA',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  cardIconAtivo: { backgroundColor: colors.azulEscuro },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textoPrimario },
  cardTitleAtivo: { color: colors.azulEscuro },
  cardDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  check: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.azulEscuro,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  footer: { paddingBottom: 16, paddingTop: 8 },
});
