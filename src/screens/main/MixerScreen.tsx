import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Play, BookmarkCheck } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { SONS_NATUREZA, RUIDOS, TODOS_SONS, getSom } from '../../sons';
import Skeleton from '../../components/Skeleton';

const CATEGORIAS = [
  { id: 'todos', label: 'Todos' },
  { id: 'natureza', label: 'Natureza' },
  { id: 'ruidos', label: 'Ruídos' },
];

export default function MixerScreen() {
  const navigation = useNavigation<any>();
  const [somRefugio, setSomRefugio] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('todos');
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCarregando(false); return; }
    const { data } = await supabase.from('profiles').select('som_refugio, nome').eq('id', user.id).single();
    setSomRefugio(data?.som_refugio ?? null);
    setNome(data?.nome ?? '');
    setCarregando(false);
  }

  function abrirPlayer(somId: string) {
    navigation.navigate('Player', { somId });
  }

  const lista = categoria === 'natureza' ? SONS_NATUREZA : categoria === 'ruidos' ? RUIDOS : TODOS_SONS;
  const refugio = getSom(somRefugio);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          {carregando ? (
            <Skeleton width={120} height={14} radius={7} style={{ marginBottom: 10 }} />
          ) : (
            !!nome && <Text style={s.greeting}>Olá, {nome}</Text>
          )}
          <Text style={s.title}>O que você quer{'\n'}ouvir agora?</Text>
        </View>

        {carregando ? (
          <Skeleton height={82} radius={20} style={{ marginBottom: 22 }} />
        ) : refugio ? (
          <TouchableOpacity style={s.featured} onPress={() => abrirPlayer(refugio.id)} activeOpacity={0.9}>
            <View style={s.featuredIcon}>
              <refugio.Icon size={26} color={colors.branco} />
            </View>
            <View style={s.featuredInfo}>
              <Text style={s.featuredTag}>MEU REFÚGIO</Text>
              <Text style={s.featuredLabel}>{refugio.label}</Text>
            </View>
            <View style={s.featuredPlay}>
              <Play size={20} color={colors.azulEscuro} fill={colors.azulEscuro} />
            </View>
          </TouchableOpacity>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} contentContainerStyle={s.chipsContent}>
          {CATEGORIAS.map(c => {
            const sel = categoria === c.id;
            return (
              <TouchableOpacity key={c.id} style={[s.chip, sel && s.chipAtivo]} onPress={() => setCategoria(c.id)} activeOpacity={0.8}>
                <Text style={[s.chipText, sel && s.chipTextoAtivo]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.grid}>
          {lista.map(som => {
            const ehRefugio = somRefugio === som.id;
            return (
              <TouchableOpacity key={som.id} style={s.card} onPress={() => abrirPlayer(som.id)} activeOpacity={0.85}>
                <View style={s.cardIcon}>
                  <som.Icon size={24} color={colors.azulClaro} />
                </View>
                {ehRefugio ? <BookmarkCheck size={16} color={colors.azulClaro} style={s.cardMark} /> : null}
                <Text style={s.cardLabel}>{som.label}</Text>
                <Text style={s.cardState}>Tocar</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  scroll: { paddingHorizontal: 20, paddingBottom: 130 },
  header: { paddingTop: 12, marginBottom: 20 },
  greeting: { fontFamily: fonts.medium, fontSize: 14, color: colors.textoSecundario, marginBottom: 6 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, lineHeight: 33 },

  featured: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.azulEscuro,
    borderRadius: 20, padding: 16, marginBottom: 22,
  },
  featuredIcon: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  featuredInfo: { flex: 1 },
  featuredTag: { fontFamily: fonts.semibold, fontSize: 10, color: colors.azulClaro, letterSpacing: 1, marginBottom: 4 },
  featuredLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.branco },
  featuredPlay: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.branco,
    alignItems: 'center', justifyContent: 'center',
  },

  chipsRow: { marginBottom: 18, marginHorizontal: -20 },
  chipsContent: { paddingHorizontal: 20, gap: 10 },
  chip: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borda },
  chipAtivo: { backgroundColor: colors.azulEscuro, borderColor: colors.azulEscuro },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textoSecundario },
  chipTextoAtivo: { color: colors.branco },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: colors.borda,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: colors.tint,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  cardMark: { position: 'absolute', top: 18, right: 16 },
  cardLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textoPrimario },
  cardState: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
});
