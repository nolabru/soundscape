import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, Save } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';
import { HUMOR_ICONS, humorCor } from '../../humor';

const LOCAIS = ['Casa', 'Escola', 'Transporte', 'Trabalho', 'Shopping', 'Outro'];
const HORARIOS = ['Madrugada', 'Manhã', 'Tarde', 'Noite'];

function hoje() { return new Date().toISOString().split('T')[0]; }

export default function NovoRegistroScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const navigation = useNavigation<any>();
  const [humor, setHumor] = useState<number | null>(null);
  const [crises, setCrises] = useState('0');
  const [duracao, setDuracao] = useState('0');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (humor === null) { Alert.alert('Selecione seu humor'); return; }
    setSalvando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSalvando(false); Alert.alert('Sessão expirada', 'Faça login novamente.'); return; }
    const { error } = await supabase.from('diary_entries').insert({
      user_id: user.id, date: hoje(), humor: humor + 1,
      crises: parseInt(crises) || 0, duracao_minutos: parseInt(duracao) || 0,
      horario, local, observacoes: obs,
    });
    setSalvando(false);
    if (error) { Alert.alert('Erro ao salvar', error.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Novo registro</Text>
        <TouchableOpacity style={s.close} onPress={() => navigation.goBack()}>
          <X size={20} color={colors.textoPrimario} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.label}>Como você se sente?</Text>
        <View style={s.humorRow}>
          {HUMOR_ICONS.map((Icon, i) => {
            const sel = humor === i;
            return (
              <TouchableOpacity key={i} style={[s.humorBtn, sel && { backgroundColor: humorCor(i + 1), borderColor: humorCor(i + 1) }]} onPress={() => setHumor(i)} activeOpacity={0.8}>
                <Icon size={26} color={sel ? colors.branco : colors.textoSecundario} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.twoCols}>
          <View style={s.col}>
            <Text style={s.label}>Crises</Text>
            <TextInput style={s.input} value={crises} onChangeText={setCrises} keyboardType="number-pad" placeholderTextColor="#9AA8BD" />
          </View>
          <View style={s.col}>
            <Text style={s.label}>Duração (min)</Text>
            <TextInput style={s.input} value={duracao} onChangeText={setDuracao} keyboardType="number-pad" placeholderTextColor="#9AA8BD" />
          </View>
        </View>

        <Text style={s.label}>Horário principal</Text>
        <View style={s.chipRow}>
          {HORARIOS.map(h => {
            const sel = horario === h;
            return (
              <TouchableOpacity key={h} style={[s.chip, sel && s.chipAtivo]} onPress={() => setHorario(sel ? '' : h)} activeOpacity={0.8}>
                <Text style={[s.chipText, sel && s.chipTextoAtivo]}>{h}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.label}>Local</Text>
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
        <TextInput style={[s.input, s.textarea]} value={obs} onChangeText={setObs} placeholder="Como foi o seu dia?" placeholderTextColor="#9AA8BD" multiline />

        <TouchableOpacity style={s.btn} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
          <Save size={18} color={colors.branco} />
          <Text style={s.btnText}>{salvando ? 'Salvando...' : 'Salvar registro'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.textoPrimario },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borda },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginBottom: 10, marginTop: 18 },
  humorRow: { flexDirection: 'row', gap: 8 },
  humorBtn: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1, borderColor: colors.borda, backgroundColor: colors.card,
  },
  twoCols: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  input: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.textoPrimario,
    backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.borda,
  },
  textarea: { height: 88, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borda },
  chipAtivo: { backgroundColor: colors.azulEscuro, borderColor: colors.azulEscuro },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textoSecundario },
  chipTextoAtivo: { color: colors.branco },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.azulEscuro, paddingVertical: 17, borderRadius: 16, marginTop: 28,
  },
  btnText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.branco },
});
