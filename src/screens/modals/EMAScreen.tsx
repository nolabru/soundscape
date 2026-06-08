import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const INTENSIDADES = ['😢', '😔', '😐', '😣', '😱'];
const GATILHOS = ['Barulho alto', 'Luzes intensas', 'Multidão', 'Cheiro forte', 'Toque inesperado', 'Imprevistos'];
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
      user_id: user.id,
      intensidade: intensidade + 1,
      duracao_minutos: parseInt(duracao) || 0,
      gatilhos,
      local,
      observacoes: obs,
    });
    navigation.navigate('Main');
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Como foi a crise?</Text>
        <Text style={s.sub}>Registre enquanto ainda está fresco. Isso ajuda seu psicólogo.</Text>

        <Text style={s.label}>Intensidade</Text>
        <View style={s.humorRow}>
          {INTENSIDADES.map((e, i) => (
            <TouchableOpacity key={i} style={[s.humorBtn, intensidade === i && s.humorBtnAtivo]} onPress={() => setIntensidade(i)}>
              <Text style={s.humorEmoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Duração (minutos)</Text>
        <TextInput style={s.input} value={duracao} onChangeText={setDuracao} keyboardType="number-pad" placeholder="0" />

        <Text style={s.label}>O que desencadeou?</Text>
        <View style={s.chipRow}>
          {GATILHOS.map(g => (
            <TouchableOpacity key={g} style={[s.chip, gatilhos.includes(g) && s.chipAtivo]} onPress={() => toggleGatilho(g)}>
              <Text style={[s.chipText, gatilhos.includes(g) && s.chipTextoAtivo]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Onde aconteceu?</Text>
        <View style={s.chipRow}>
          {LOCAIS.map(l => (
            <TouchableOpacity key={l} style={[s.chip, local === l && s.chipAtivo]} onPress={() => setLocal(l === local ? '' : l)}>
              <Text style={[s.chipText, local === l && s.chipTextoAtivo]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Observações</Text>
        <TextInput style={[s.input, s.textarea]} value={obs} onChangeText={setObs} placeholder="O que mais você quer registrar?" multiline />

        <TouchableOpacity style={[s.btn, intensidade === null && s.btnDisabled]} disabled={intensidade === null} onPress={salvar}>
          <Text style={s.btnText}>Salvar e continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={s.skip}>
          <Text style={s.skipText}>Pular por agora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 10, marginTop: 16 },
  humorRow: { flexDirection: 'row', gap: 8 },
  humorBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  humorBtnAtivo: { borderColor: '#4F46E5', backgroundColor: '#EDEDFF' },
  humorEmoji: { fontSize: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  chipAtivo: { borderColor: '#4F46E5', backgroundColor: '#EDEDFF' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextoAtivo: { color: '#4F46E5', fontWeight: '600' },
  btn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skip: { alignItems: 'center', marginTop: 12 },
  skipText: { color: '#999' },
});
