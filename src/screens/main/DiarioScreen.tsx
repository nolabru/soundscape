import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const HUMORES = ['😢', '😔', '😐', '🙂', '😊'];
const LOCAIS = ['Casa', 'Escola', 'Transporte', 'Trabalho', 'Shopping', 'Outro'];
const HORARIOS = ['Madrugada', 'Manhã', 'Tarde', 'Noite'];

function hoje() { return new Date().toISOString().split('T')[0]; }

export default function DiarioScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [humor, setHumor] = useState<number | null>(null);
  const [crises, setCrises] = useState('0');
  const [duracao, setDuracao] = useState('0');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [obs, setObs] = useState('');

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    setEntries(data ?? []);
  }

  async function salvar() {
    if (humor === null) { Alert.alert('Selecione seu humor'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('diary_entries').insert({
      user_id: user.id, date: hoje(), humor: humor + 1,
      crises: parseInt(crises) || 0, duracao_minutos: parseInt(duracao) || 0,
      horario, local, observacoes: obs,
    });
    if (error) { Alert.alert('Erro ao salvar'); return; }
    setHumor(null); setCrises('0'); setDuracao('0'); setHorario(''); setLocal(''); setObs('');
    carregar();
  }

  async function excluir(id: string) {
    Alert.alert('Excluir', 'Remover esta entrada?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await supabase.from('diary_entries').delete().eq('id', id);
        carregar();
      }},
    ]);
  }

  return (
    <ScrollView style={s.screen}>
      <Text style={s.title}>Diário de Humor</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>Como foi hoje?</Text>
        <Text style={s.label}>Humor</Text>
        <View style={s.humorRow}>
          {HUMORES.map((e, i) => (
            <TouchableOpacity key={i} style={[s.humorBtn, humor === i && s.humorBtnAtivo]} onPress={() => setHumor(i)}>
              <Text style={s.humorEmoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.label}>Crises hoje</Text>
        <TextInput style={s.input} value={crises} onChangeText={setCrises} keyboardType="number-pad" />
        <Text style={s.label}>Duração total (min)</Text>
        <TextInput style={s.input} value={duracao} onChangeText={setDuracao} keyboardType="number-pad" />
        <Text style={s.label}>Horário principal</Text>
        <View style={s.chipRow}>
          {HORARIOS.map(h => (
            <TouchableOpacity key={h} style={[s.chip, horario === h && s.chipAtivo]} onPress={() => setHorario(h === horario ? '' : h)}>
              <Text style={[s.chipText, horario === h && s.chipTextoAtivo]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.label}>Local</Text>
        <View style={s.chipRow}>
          {LOCAIS.map(l => (
            <TouchableOpacity key={l} style={[s.chip, local === l && s.chipAtivo]} onPress={() => setLocal(l === local ? '' : l)}>
              <Text style={[s.chipText, local === l && s.chipTextoAtivo]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.label}>Observações</Text>
        <TextInput style={[s.input, s.textarea]} value={obs} onChangeText={setObs} placeholder="Como foi seu dia?" multiline />
        <TouchableOpacity style={s.btn} onPress={salvar}>
          <Text style={s.btnText}>💾 Salvar</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.section}>Histórico</Text>
      {entries.map(e => (
        <View key={e.id} style={s.entry}>
          <View style={s.entryHeader}>
            <Text style={s.entryDate}>{HUMORES[e.humor - 1]} {e.date}</Text>
            <TouchableOpacity onPress={() => excluir(e.id)}>
              <Text style={s.excluir}>🗑</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.entryInfo}>Crises: {e.crises} · {e.duracao_minutos} min{e.local ? ` · ${e.local}` : ''}</Text>
          {e.observacoes ? <Text style={s.entryObs}>{e.observacoes}</Text> : null}
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 56 },
  card: { margin: 16, padding: 16, backgroundColor: '#F8F8FF', borderRadius: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  humorRow: { flexDirection: 'row', gap: 8 },
  humorBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  humorBtnAtivo: { borderColor: '#4F46E5', backgroundColor: '#EDEDFF' },
  humorEmoji: { fontSize: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  textarea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipAtivo: { borderColor: '#4F46E5', backgroundColor: '#EDEDFF' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextoAtivo: { color: '#4F46E5', fontWeight: '600' },
  btn: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: { fontSize: 16, fontWeight: '700', paddingHorizontal: 20, marginTop: 8, marginBottom: 8 },
  entry: { marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: '#F9F9F9', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#4F46E5' },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  entryDate: { fontWeight: '600', fontSize: 15 },
  excluir: { fontSize: 16 },
  entryInfo: { fontSize: 13, color: '#666' },
  entryObs: { fontSize: 13, color: '#444', marginTop: 4, fontStyle: 'italic' },
});
