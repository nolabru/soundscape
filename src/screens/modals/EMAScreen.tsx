import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, Volume2, Sun, Users, Flower2, Hand, Zap, LucideIcon } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { HUMOR_ICONS, humorCor } from '../../humor';

const GATILHOS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Barulho alto', Icon: Volume2 },
  { label: 'Luzes intensas', Icon: Sun },
  { label: 'Multidão', Icon: Users },
  { label: 'Cheiro forte', Icon: Flower2 },
  { label: 'Toque inesperado', Icon: Hand },
  { label: 'Imprevistos', Icon: Zap },
];
const LOCAIS = ['Casa', 'Escola', 'Transporte', 'Trabalho', 'Shopping', 'Outro'];

export default function EMAScreen() {
  const [intensidade, setIntensidade] = useState<number | null>(null);
  const [duracao, setDuracao] = useState('');
  const [gatilhos, setGatilhos] = useState<string[]>([]);
  const [local, setLocal] = useState('');
  const [obs, setObs] = useState('');
  const navigation = useNavigation<any>();

  function toggleGatilho(g: string) {
    setGatilhos(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  async function salvar() {
    if (intensidade === null) { Alert.alert('Selecione a intensidade'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('crisis_events').insert({
      user_id: user.id, intensidade: intensidade + 1,
      duracao_minutos: parseInt(duracao) || 0, gatilhos, local, observacoes: obs,
    });
    navigation.popToTop();
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Como foi a crise?</Text>
          <Text style={s.sub}>Registre enquanto está fresco.</Text>
        </View>
        <TouchableOpacity style={s.close} onPress={() => navigation.popToTop()}>
          <X size={20} color={colors.textoPrimario} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.label}>Intensidade</Text>
        <View style={s.humorRow}>
          {HUMOR_ICONS.map((Icon, i) => {
            const sel = intensidade === i;
            return (
              <TouchableOpacity key={i} style={[s.humorBtn, sel && { backgroundColor: humorCor(i + 1), borderColor: humorCor(i + 1) }]} onPress={() => setIntensidade(i)} activeOpacity={0.8}>
                <Icon size={26} color={sel ? colors.branco : colors.textoSecundario} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.label}>Duração (minutos)</Text>
        <TextInput style={s.input} value={duracao} onChangeText={setDuracao} keyboardType="number-pad" placeholder="0" placeholderTextColor="#9AA8BD" />

        <Text style={s.label}>O que desencadeou?</Text>
        <View style={s.chipRow}>
          {GATILHOS.map(({ label, Icon }) => {
            const sel = gatilhos.includes(label);
            return (
              <TouchableOpacity key={label} style={[s.gatilho, sel && s.gatilhoAtivo]} onPress={() => toggleGatilho(label)} activeOpacity={0.8}>
                <Icon size={16} color={sel ? colors.branco : colors.azulClaro} />
                <Text style={[s.gatilhoText, sel && s.gatilhoTextoAtivo]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.label}>Onde aconteceu?</Text>
        <View style={s.chipRow}>
          {LOCAIS.map(l => {
            const sel = local === l;
            return (
              <TouchableOpacity key={l} style={[s.chip, sel && s.chipAtivo]} onPress={() => setLocal(sel ? '' : l)} activeOpacity={0.8}>
                <Text style={[s.chipText, sel && s.chipTextoAtivo]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.label}>Observações</Text>
        <TextInput style={[s.input, s.textarea]} value={obs} onChangeText={setObs} placeholder="O que mais quer registrar?" placeholderTextColor="#9AA8BD" multiline />

        <TouchableOpacity style={[s.btn, intensidade === null && s.btnDisabled]} disabled={intensidade === null} onPress={salvar} activeOpacity={0.85}>
          <Text style={s.btnText}>Salvar e continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={s.skip}>
          <Text style={s.skipText}>Pular por agora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.textoPrimario },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, marginTop: 4 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borda },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginBottom: 12, marginTop: 20 },
  humorRow: { flexDirection: 'row', gap: 8 },
  humorBtn: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1, borderColor: colors.borda, backgroundColor: colors.card,
  },
  input: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.textoPrimario,
    backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.borda,
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gatilho: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borda,
  },
  gatilhoAtivo: { backgroundColor: colors.azulEscuro, borderColor: colors.azulEscuro },
  gatilhoText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textoSecundario },
  gatilhoTextoAtivo: { color: colors.branco },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borda },
  chipAtivo: { backgroundColor: colors.azulEscuro, borderColor: colors.azulEscuro },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textoSecundario },
  chipTextoAtivo: { color: colors.branco },
  btn: { backgroundColor: colors.azulEscuro, paddingVertical: 17, borderRadius: 16, alignItems: 'center', marginTop: 28 },
  btnDisabled: { backgroundColor: '#B8C4D6' },
  btnText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.branco },
  skip: { alignItems: 'center', marginTop: 14 },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoSecundario },
});
