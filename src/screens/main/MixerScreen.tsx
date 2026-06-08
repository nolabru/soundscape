import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const SONS_NATUREZA = [
  { id: 'chuva', label: 'Chuva Suave', emoji: '🌧️' },
  { id: 'ondas', label: 'Ondas do Mar', emoji: '🌊' },
  { id: 'floresta', label: 'Floresta', emoji: '🌲' },
  { id: 'passaros', label: 'Pássaros', emoji: '🐦' },
  { id: 'vento', label: 'Vento Suave', emoji: '💨' },
  { id: 'lareira', label: 'Lareira', emoji: '🔥' },
];

const RUIDOS = [
  { id: 'branco', label: 'Ruído Branco', emoji: '📻' },
  { id: 'rosa', label: 'Ruído Rosa', emoji: '🎵' },
  { id: 'marrom', label: 'Ruído Marrom', emoji: '🎶' },
  { id: 'ventilador', label: 'Ventilador', emoji: '🌀' },
];

const TODOS = [...SONS_NATUREZA, ...RUIDOS];

export default function MixerScreen() {
  const [ativo, setAtivo] = useState<string | null>(null);
  const [somRefugio, setSomRefugio] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true }).catch(() => {});
    carregarRefugio();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  async function carregarRefugio() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('som_refugio').eq('id', user.id).single();
    setSomRefugio(data?.som_refugio ?? null);
  }

  async function tocar(id: string) {
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setAtivo(ativo === id ? null : id);
  }

  async function parar() {
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setAtivo(null);
  }

  async function salvarRefugio() {
    if (!ativo) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({ id: user.id, som_refugio: ativo });
    setSomRefugio(ativo);
    Alert.alert('Salvo!', `"${TODOS.find(s => s.id === ativo)?.label}" é agora seu Refúgio Sonoro.`);
  }

  return (
    <ScrollView style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Sons Relaxantes</Text>
        <TouchableOpacity style={s.panicBtn} onPress={() => navigation.navigate('Panico')}>
          <Text style={s.panicBtnText}>🆘</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.section}>Sons da Natureza</Text>
      <View style={s.grid}>
        {SONS_NATUREZA.map(som => (
          <TouchableOpacity key={som.id} style={[s.card, ativo === som.id && s.cardAtivo]} onPress={() => tocar(som.id)}>
            <Text style={s.emoji}>{som.emoji}</Text>
            <Text style={[s.cardLabel, ativo === som.id && s.cardLabelAtivo]}>{som.label}</Text>
            {somRefugio === som.id && <Text style={s.refugioTag}>⭐</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.section}>Ruídos Calmantes</Text>
      <View style={s.grid}>
        {RUIDOS.map(som => (
          <TouchableOpacity key={som.id} style={[s.card, ativo === som.id && s.cardAtivo]} onPress={() => tocar(som.id)}>
            <Text style={s.emoji}>{som.emoji}</Text>
            <Text style={[s.cardLabel, ativo === som.id && s.cardLabelAtivo]}>{som.label}</Text>
            {somRefugio === som.id && <Text style={s.refugioTag}>⭐</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {ativo && (
        <View style={s.player}>
          <Text style={s.playerLabel}>▶ {TODOS.find(s => s.id === ativo)?.label}</Text>
          <TouchableOpacity style={s.stopBtn} onPress={parar}>
            <Text style={s.stopBtnText}>⏹ Parar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.refugioSaveBtn} onPress={salvarRefugio}>
            <Text style={s.refugioSaveBtnText}>⭐ Salvar como Meu Refúgio</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: 'bold' },
  panicBtn: { backgroundColor: '#DC2626', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  panicBtnText: { fontSize: 20 },
  section: { fontSize: 15, fontWeight: '700', color: '#4F46E5', paddingHorizontal: 20, marginTop: 8, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  card: { width: '47%', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 14, padding: 16, alignItems: 'center' },
  cardAtivo: { borderColor: '#4F46E5', backgroundColor: '#F0F0FF' },
  emoji: { fontSize: 30, marginBottom: 8 },
  cardLabel: { fontSize: 13, textAlign: 'center', color: '#333' },
  cardLabelAtivo: { color: '#4F46E5', fontWeight: '600' },
  refugioTag: { fontSize: 12, marginTop: 4 },
  player: { margin: 16, padding: 16, backgroundColor: '#F8F8FF', borderRadius: 14, borderWidth: 1, borderColor: '#e0e0e0', gap: 10 },
  playerLabel: { fontSize: 15, fontWeight: '600' },
  stopBtn: { backgroundColor: '#DC2626', padding: 12, borderRadius: 10, alignItems: 'center' },
  stopBtnText: { color: '#fff', fontWeight: '600' },
  refugioSaveBtn: { backgroundColor: '#F59E0B', padding: 12, borderRadius: 10, alignItems: 'center' },
  refugioSaveBtnText: { color: '#fff', fontWeight: '600' },
});
