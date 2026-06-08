import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email || !senha) { Alert.alert('Preencha email e senha'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) Alert.alert('Erro', error.message);
  }

  return (
    <AuthLayout onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.body}>
          <Text style={s.title}>Bem-vindo{'\n'}de volta</Text>
          <Text style={s.sub}>Entre para continuar sua jornada.</Text>

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="#9AA8BD"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            placeholderTextColor="#9AA8BD"
            secureTextEntry
          />
        </View>

        <View style={s.footer}>
          <PrimaryButton label={loading ? 'Entrando...' : 'Entrar'} onPress={entrar} disabled={loading} showArrow={false} />
          <TouchableOpacity onPress={() => navigation.navigate('SobreVoce')} style={s.signupLink}>
            <Text style={s.signupText}>
              Não tem conta? <Text style={s.signupBold}>Criar agora</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.textoPrimario, lineHeight: 36, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 32 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginBottom: 8, marginTop: 16 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.textoPrimario,
    backgroundColor: colors.branco, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: '#E2E8F2',
  },
  footer: { paddingBottom: 16, paddingTop: 8 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textoSecundario },
  signupBold: { fontFamily: fonts.bold, color: colors.azulEscuro },
});
