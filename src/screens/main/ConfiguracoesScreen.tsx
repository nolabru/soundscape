import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { User, ShieldCheck, LogOut, Pencil, X, Camera, Music4, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { getSom } from '../../sons';
import Skeleton from '../../components/Skeleton';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTel, setContatoTel] = useState('');
  const [guardiaoAtivo, setGuardiaoAtivo] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => { if (!editando) carregar(); }, [editando]));

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCarregando(false); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setCarregando(false);
    if (data) {
      setProfile(data);
      setNome(data.nome ?? '');
      setContatoNome(data.contato_emergencia_nome ?? '');
      setContatoTel(data.contato_emergencia_tel ?? '');
      setGuardiaoAtivo(data.guardiao_ativo ?? false);
      setAvatarUrl(data.avatar_url ?? null);
    }
  }

  function cancelar() {
    carregar();
    setEditando(false);
  }

  async function salvar() {
    setSalvando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSalvando(false); return; }
    await supabase.from('profiles').upsert({
      id: user.id, nome, contato_emergencia_nome: contatoNome,
      contato_emergencia_tel: contatoTel, guardiao_ativo: guardiaoAtivo,
    });
    setSalvando(false);
    setEditando(false);
  }

  async function escolherFoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão necessária', 'Permita o acesso às fotos para alterar o avatar.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;

    setEnviandoFoto(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setEnviandoFoto(false); return; }
    const path = `${user.id}/avatar.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(path, decode(res.assets[0].base64), { contentType: 'image/jpeg', upsert: true });
    if (error) {
      Alert.alert('Erro ao enviar', 'Verifique se o bucket "avatars" existe no Supabase.');
      setEnviandoFoto(false);
      return;
    }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').upsert({ id: user.id, avatar_url: url });
    setAvatarUrl(url);
    setEnviandoFoto(false);
  }

  function logout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  const refugio = getSom(profile?.som_refugio);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <Text style={s.topTitle}>Perfil</Text>
        {editando ? (
          <TouchableOpacity style={s.iconBtn} onPress={cancelar}>
            <X size={20} color={colors.textoPrimario} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.iconBtn} onPress={() => setEditando(true)}>
            <Pencil size={18} color={colors.azulEscuro} />
          </TouchableOpacity>
        )}
      </View>

      {carregando ? (
        <View style={s.scroll}>
          <View style={s.profileHeader}>
            <Skeleton width={92} height={92} radius={46} style={{ marginBottom: 14 }} />
            <Skeleton width={120} height={18} radius={8} style={{ marginBottom: 8 }} />
            <Skeleton width={80} height={12} radius={6} />
          </View>
          <Skeleton height={150} radius={20} style={{ marginBottom: 22 }} />
          <Skeleton height={120} radius={20} />
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.profileHeader}>
          <TouchableOpacity activeOpacity={editando ? 0.8 : 1} onPress={editando ? escolherFoto : undefined}>
            <View style={s.avatar}>
              {enviandoFoto ? (
                <ActivityIndicator color={colors.azulClaro} />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={s.avatarImg} />
              ) : (
                <User size={34} color={colors.azulClaro} />
              )}
            </View>
            {editando && (
              <View style={s.cameraBadge}>
                <Camera size={15} color={colors.branco} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={s.name}>{nome || 'Você'}</Text>
          <Text style={s.email}>{profile?.tem_psicologo ? 'Em acompanhamento' : 'TEA SoundScapes'}</Text>
        </View>

        <Text style={s.section}>Conta</Text>
        <View style={s.card}>
          <Text style={s.label}>Como prefere ser chamado</Text>
          <TextInput style={[s.input, !editando && s.inputLocked]} value={nome} onChangeText={setNome} editable={editando} placeholder="Seu nome" placeholderTextColor="#9AA8BD" />
          <Text style={s.label}>Contato de emergência</Text>
          <TextInput style={[s.input, !editando && s.inputLocked]} value={contatoNome} onChangeText={setContatoNome} editable={editando} placeholder="Nome" placeholderTextColor="#9AA8BD" />
          <TextInput style={[s.input, { marginTop: 10 }, !editando && s.inputLocked]} value={contatoTel} onChangeText={setContatoTel} editable={editando} placeholder="Telefone" keyboardType="phone-pad" placeholderTextColor="#9AA8BD" />
        </View>

        <Text style={s.section}>Preferências</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Guardiao')} activeOpacity={0.7}>
            <View style={s.rowIcon}><ShieldCheck size={20} color={colors.azulClaro} /></View>
            <View style={s.rowInfo}>
              <Text style={s.rowTitle}>Sistema Guardião</Text>
              <Text style={s.rowSub}>{guardiaoAtivo ? `Ativo · acima de ${profile?.guardiao_limiar ?? 75} dB` : 'Toque para configurar'}</Text>
            </View>
            <ChevronRight size={20} color={colors.textoSecundario} />
          </TouchableOpacity>

          {refugio && (
            <>
              <View style={s.divider} />
              <View style={s.row}>
                <View style={s.rowIcon}><refugio.Icon size={20} color={colors.azulClaro} /></View>
                <View style={s.rowInfo}>
                  <Text style={s.rowTitle}>Meu Refúgio Sonoro</Text>
                  <Text style={s.rowSub}>{refugio.label}</Text>
                </View>
                <Music4 size={18} color={colors.textoSecundario} />
              </View>
            </>
          )}
        </View>

        {editando ? (
          <TouchableOpacity style={s.saveBtn} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
            <Text style={s.saveText}>{salvando ? 'Salvando...' : 'Salvar alterações'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.85}>
            <LogOut size={18} color={colors.perigo} />
            <Text style={s.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  topTitle: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borda },

  scroll: { paddingHorizontal: 20, paddingBottom: 130 },
  profileHeader: { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  avatar: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: colors.tint,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute', right: 0, bottom: 14,
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.azulEscuro,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.fundo,
  },
  name: { fontFamily: fonts.bold, fontSize: 22, color: colors.textoPrimario },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.textoSecundario, marginTop: 4 },

  section: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoSecundario, marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.borda, marginBottom: 22 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.textoSecundario, marginBottom: 8, marginTop: 12 },
  input: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.textoPrimario,
    backgroundColor: colors.fundo, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.borda,
  },
  inputLocked: { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 0, color: colors.textoPrimario },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowInfo: { flex: 1 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textoPrimario },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borda, marginVertical: 16 },

  saveBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.azulEscuro, paddingVertical: 16, borderRadius: 16 },
  saveText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.branco },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.perigo,
  },
  logoutText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.perigo },
});
