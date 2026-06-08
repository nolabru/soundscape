import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const SONS_LABELS: Record<string, string> = {
  chuva: '🌧️ Chuva Suave', ondas: '🌊 Ondas do Mar', floresta: '🌲 Floresta',
  passaros: '🐦 Pássaros', vento: '💨 Vento Suave', lareira: '🔥 Lareira',
  branco: '📻 Ruído Branco', rosa: '🎵 Ruído Rosa', marrom: '🎶 Ruído Marrom', ventilador: '🌀 Ventilador',
};

export default function ConfiguracoesScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTel, setContatoTel] = useState('');
  const [guardiaoAtivo, setGuardiaoAtivo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setNome(data.nome ?? '');
      setContatoNome(data.contato_emergencia_nome ?? '');
      setContatoTel(data.contato_emergencia_tel ?? '');
      setGuardiaoAtivo(data.guardiao_ativo ?? false);
    }
  }

  async function salvar() {
    setSalvando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id, nome, contato_emergencia_nome: contatoNome,
      contato_emergencia_tel: contatoTel, guardiao_ativo: guardiaoAtivo,
    });
    setSalvando(false);
    Alert.alert('Salvo!');
  }

  async function logout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <ScrollView style={s.screen}>
      <Text style={s.title}>Configurações</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Perfil</Text>
        <Text style={s.label}>Nome</Text>
        <TextInput style={s.input} value={nome} onChangeText={setNome} placeholder="Como prefere ser chamado" />
        <Text style={s.label}>Contato de emergência</Text>
        <TextInput style={s.input} value={contatoNome} onChangeText={setContatoNome} placeholder="Nome" />
        <TextInput style={[s.input, { marginTop: 8 }]} value={contatoTel} onChangeText={setContatoTel} placeholder="Telefone" keyboardType="phone-pad" />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Sistema Guardião</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Monitoramento ativo</Text>
            <Text style={s.sub}>Detecta ruídos de risco em segundo plano</Text>
          </View>
          <Switch value={guardiaoAtivo} onValueChange={setGuardiaoAtivo} trackColor={{ true: '#4F46E5' }} />
        </View>
      </View>

      {profile?.som_refugio && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Meu Refúgio Sonoro</Text>
          <Text style={s.refugioLabel}>{SONS_LABELS[profile.som_refugio] ?? profile.som_refugio}</Text>
          <Text style={s.sub}>Para alterar, selecione outro som no Mixer e salve como Refúgio.</Text>
        </View>
      )}

      <TouchableOpacity style={s.btn} onPress={salvar} disabled={salvando}>
        <Text style={s.btnText}>{salvando ? 'Salvando...' : 'Salvar alterações'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutBtnText}>Sair da conta</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 56 },
  card: { margin: 16, marginTop: 0, marginBottom: 12, padding: 16, backgroundColor: '#F8F8FF', borderRadius: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 8 },
  sub: { fontSize: 12, color: '#888' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  refugioLabel: { fontSize: 18, marginBottom: 6 },
  btn: { marginHorizontal: 16, backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoutBtn: { marginHorizontal: 16, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  logoutBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 16 },
});
