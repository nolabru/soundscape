import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const HUMORES = ['😢', '😔', '😐', '🙂', '😊'];

export default function AnalisesScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30);
    setEntries(data ?? []);
  }

  const humorMedio = entries.length ? (entries.reduce((a, e) => a + e.humor, 0) / entries.length).toFixed(1) : '—';
  const totalCrises = entries.reduce((a, e) => a + e.crises, 0);
  const diasBons = entries.filter(e => e.humor >= 4).length;
  const ultimos7 = [...entries].slice(0, 7).reverse();

  const locaisMap: Record<string, number> = {};
  entries.forEach(e => { if (e.local && e.crises > 0) locaisMap[e.local] = (locaisMap[e.local] || 0) + e.crises; });
  const locais = Object.entries(locaisMap).sort((a, b) => b[1] - a[1]);
  const maxLocais = locais[0]?.[1] || 1;

  const horariosMap: Record<string, number> = { Madrugada: 0, Manhã: 0, Tarde: 0, Noite: 0 };
  entries.forEach(e => { if (e.horario && e.crises > 0) horariosMap[e.horario] = (horariosMap[e.horario] || 0) + 1; });
  const maxHorarios = Math.max(...Object.values(horariosMap), 1);

  return (
    <ScrollView style={s.screen}>
      <Text style={s.title}>Análises</Text>

      <TouchableOpacity style={s.exportBtn} onPress={() => Alert.alert('Em breve', 'Exportação PDF disponível em breve.')}>
        <Text style={s.exportBtnText}>📄 Exportar para Psicólogo</Text>
      </TouchableOpacity>

      <View style={s.card}>
        <Text style={s.cardTitle}>📊 Resumo</Text>
        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={[s.statNum, { color: '#4F46E5' }]}>{humorMedio}</Text><Text style={s.statLabel}>Humor Médio</Text></View>
          <View style={s.statBox}><Text style={[s.statNum, { color: '#DC2626' }]}>{totalCrises}</Text><Text style={s.statLabel}>Crises</Text></View>
          <View style={s.statBox}><Text style={[s.statNum, { color: '#16A34A' }]}>{diasBons}</Text><Text style={s.statLabel}>Dias Bons</Text></View>
        </View>
      </View>

      {ultimos7.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>📈 Humor — 7 dias</Text>
          <View style={s.barChart}>
            {ultimos7.map((e, i) => (
              <View key={i} style={s.barCol}>
                <Text style={s.barEmoji}>{HUMORES[e.humor - 1]}</Text>
                <View style={[s.bar, { height: e.humor * 14, backgroundColor: e.humor >= 4 ? '#16A34A' : e.humor === 3 ? '#F59E0B' : '#DC2626' }]} />
                <Text style={s.barDate}>{e.date?.slice(5)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {Object.values(horariosMap).some(v => v > 0) && (
        <View style={s.card}>
          <Text style={s.cardTitle}>⏰ Horários Críticos</Text>
          {Object.entries(horariosMap).map(([label, count]) => (
            <View key={label} style={s.barRow}>
              <Text style={s.barRowLabel}>{label}</Text>
              <View style={s.barRowTrack}>
                <View style={[s.barRowFill, { width: `${(count / maxHorarios) * 100}%` }]} />
              </View>
              <Text style={s.barRowCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {locais.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Locais de Risco</Text>
          {locais.map(([label, count]) => (
            <View key={label} style={s.barRow}>
              <Text style={s.barRowLabel}>{label}</Text>
              <View style={s.barRowTrack}>
                <View style={[s.barRowFill, { width: `${(count / maxLocais) * 100}%`, backgroundColor: '#DC2626' }]} />
              </View>
              <Text style={s.barRowCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {entries.length === 0 && <Text style={s.empty}>Registre seu humor no Diário para ver as análises.</Text>}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 56 },
  exportBtn: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#4F46E5', padding: 14, borderRadius: 12, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { margin: 16, marginTop: 0, marginBottom: 12, padding: 16, backgroundColor: '#F8F8FF', borderRadius: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 90 },
  barCol: { alignItems: 'center', flex: 1 },
  barEmoji: { fontSize: 14, marginBottom: 2 },
  bar: { width: 22, borderRadius: 4, minHeight: 4 },
  barDate: { fontSize: 10, color: '#888', marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barRowLabel: { width: 80, fontSize: 12, color: '#444' },
  barRowTrack: { flex: 1, height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barRowFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 7 },
  barRowCount: { width: 24, textAlign: 'right', fontSize: 13, fontWeight: '600', color: '#444', marginLeft: 6 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
