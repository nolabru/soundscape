import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FileText, Clock, MapPin, TrendingUp, HeartPulse, CalendarCheck, Smile } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { humorCor } from '../../humor';
import Skeleton from '../../components/Skeleton';

export default function AnalisesScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCarregando(false); return; }
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30);
    setEntries(data ?? []);
    setCarregando(false);
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
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>Análises</Text>
          <Text style={s.subtitle}>Seus padrões ao longo do tempo.</Text>
        </View>

        {carregando ? (
          <>
            <View style={s.statsRow}>
              {[0, 1, 2].map(i => <Skeleton key={i} height={92} radius={18} style={{ flex: 1 }} />)}
            </View>
            <Skeleton height={180} radius={22} style={{ marginBottom: 14 }} />
            <Skeleton height={140} radius={22} />
          </>
        ) : entries.length === 0 ? (
          <View style={s.emptyCard}>
            <HeartPulse size={32} color={colors.azulClaro} />
            <Text style={s.emptyText}>Registre seu humor no Diário para ver as análises aqui.</Text>
          </View>
        ) : (
          <>
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Smile size={20} color={colors.azulClaro} />
                <Text style={s.statNum}>{humorMedio}</Text>
                <Text style={s.statLabel}>Humor médio</Text>
              </View>
              <View style={s.statCard}>
                <HeartPulse size={20} color={colors.perigo} />
                <Text style={s.statNum}>{totalCrises}</Text>
                <Text style={s.statLabel}>Crises</Text>
              </View>
              <View style={s.statCard}>
                <CalendarCheck size={20} color={colors.sucesso} />
                <Text style={s.statNum}>{diasBons}</Text>
                <Text style={s.statLabel}>Dias bons</Text>
              </View>
            </View>

            {ultimos7.length > 0 && (
              <View style={s.card}>
                <View style={s.cardHead}>
                  <TrendingUp size={18} color={colors.azulEscuro} />
                  <Text style={s.cardTitle}>Humor — últimos dias</Text>
                </View>
                <View style={s.barChart}>
                  {ultimos7.map((e, i) => (
                    <View key={i} style={s.barCol}>
                      <View style={s.barTrack}>
                        <View style={[s.bar, { height: `${(e.humor / 5) * 100}%`, backgroundColor: humorCor(e.humor) }]} />
                      </View>
                      <Text style={s.barDate}>{e.date?.slice(8)}/{e.date?.slice(5, 7)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {Object.values(horariosMap).some(v => v > 0) && (
              <View style={s.card}>
                <View style={s.cardHead}>
                  <Clock size={18} color={colors.azulEscuro} />
                  <Text style={s.cardTitle}>Horários críticos</Text>
                </View>
                {Object.entries(horariosMap).map(([label, count]) => (
                  <View key={label} style={s.barRow}>
                    <Text style={s.barRowLabel}>{label}</Text>
                    <View style={s.barRowTrack}>
                      <View style={[s.barRowFill, { width: `${(count / maxHorarios) * 100}%`, backgroundColor: colors.azulClaro }]} />
                    </View>
                    <Text style={s.barRowCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            {locais.length > 0 && (
              <View style={s.card}>
                <View style={s.cardHead}>
                  <MapPin size={18} color={colors.azulEscuro} />
                  <Text style={s.cardTitle}>Locais de risco</Text>
                </View>
                {locais.map(([label, count]) => (
                  <View key={label} style={s.barRow}>
                    <Text style={s.barRowLabel}>{label}</Text>
                    <View style={s.barRowTrack}>
                      <View style={[s.barRowFill, { width: `${(count / maxLocais) * 100}%`, backgroundColor: colors.perigo }]} />
                    </View>
                    <Text style={s.barRowCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={s.exportBtn} onPress={() => Alert.alert('Em breve', 'Exportação em PDF disponível em breve.')} activeOpacity={0.85}>
              <FileText size={18} color={colors.branco} />
              <Text style={s.exportText}>Exportar para psicólogo</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  scroll: { paddingHorizontal: 20, paddingBottom: 130 },
  header: { paddingTop: 12, marginBottom: 18 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, marginTop: 4 },

  emptyCard: { backgroundColor: colors.card, borderRadius: 22, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.borda, gap: 14 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, textAlign: 'center', lineHeight: 21 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.borda, gap: 8 },
  statNum: { fontFamily: fonts.bold, fontSize: 24, color: colors.textoPrimario },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textoSecundario },

  card: { backgroundColor: colors.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.borda, marginBottom: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textoPrimario },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: 14, height: 100, backgroundColor: colors.fundo, borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 7, minHeight: 6 },
  barDate: { fontFamily: fonts.regular, fontSize: 10, color: colors.textoSecundario, marginTop: 6 },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barRowLabel: { width: 84, fontFamily: fonts.medium, fontSize: 12, color: colors.textoSecundario },
  barRowTrack: { flex: 1, height: 10, backgroundColor: colors.fundo, borderRadius: 5, overflow: 'hidden' },
  barRowFill: { height: '100%', borderRadius: 5 },
  barRowCount: { width: 22, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginLeft: 8 },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.azulEscuro, paddingVertical: 16, borderRadius: 16, marginTop: 6,
  },
  exportText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.branco },
});
