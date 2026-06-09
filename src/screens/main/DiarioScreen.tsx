import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Trash2, Plus, NotebookPen } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';
import { humorIcon, humorCor } from '../../humor';
import Skeleton from '../../components/Skeleton';

export default function DiarioScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCarregando(false); return; }
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    setEntries(data ?? []);
    setCarregando(false);
  }

  function excluir(id: string) {
    Alert.alert('Excluir', 'Remover esta entrada?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await supabase.from('diary_entries').delete().eq('id', id);
        carregar();
      }},
    ]);
  }

  const vazio = entries.length === 0;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Diário</Text>
        <Text style={s.subtitle}>Seu histórico de bem-estar.</Text>
      </View>

      {carregando ? (
        <View style={s.scroll}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={s.skelRow}>
              <Skeleton width={44} height={44} radius={14} />
              <View style={s.skelInfo}>
                <Skeleton width={90} height={13} radius={6} style={{ marginBottom: 8 }} />
                <Skeleton width={160} height={11} radius={6} />
              </View>
            </View>
          ))}
        </View>
      ) : vazio ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <NotebookPen size={32} color={colors.azulClaro} />
          </View>
          <Text style={s.emptyTitle}>Nenhum registro ainda</Text>
          <Text style={s.emptyText}>Comece registrando como você se sente hoje.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('NovoRegistro')} activeOpacity={0.85}>
            <Plus size={18} color={colors.branco} />
            <Text style={s.emptyBtnText}>Adicionar registro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            {entries.map(e => {
              const Icon = humorIcon(e.humor);
              return (
                <View key={e.id} style={s.entry}>
                  <View style={[s.entryIcon, { backgroundColor: humorCor(e.humor) + '22' }]}>
                    <Icon size={22} color={humorCor(e.humor)} />
                  </View>
                  <View style={s.entryInfo}>
                    <Text style={s.entryDate}>{e.date}</Text>
                    <Text style={s.entryMeta}>
                      {e.crises} crise{e.crises === 1 ? '' : 's'} · {e.duracao_minutos} min{e.local ? ` · ${e.local}` : ''}
                    </Text>
                    {e.observacoes ? <Text style={s.entryObs} numberOfLines={2}>{e.observacoes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => excluir(e.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash2 size={18} color={colors.textoSecundario} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('NovoRegistro')} activeOpacity={0.85}>
            <Plus size={26} color={colors.branco} />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  header: { paddingHorizontal: 20, paddingTop: 12, marginBottom: 14 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, marginTop: 4 },

  scroll: { paddingHorizontal: 20, paddingBottom: 130 },
  skelRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borda },
  skelInfo: { flex: 1, marginLeft: 14 },
  entry: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borda,
  },
  entryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  entryInfo: { flex: 1 },
  entryDate: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textoPrimario },
  entryMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  entryObs: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 5, fontStyle: 'italic' },

  fab: {
    position: 'absolute', right: 24, bottom: 110,
    width: 58, height: 58, borderRadius: 29, backgroundColor: colors.azulEscuro,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.azulEscuro, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.textoPrimario, marginBottom: 8 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.azulEscuro, paddingVertical: 15, paddingHorizontal: 28, borderRadius: 28,
  },
  emptyBtnText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.branco },
});
