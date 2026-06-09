import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { supabase } from '../../lib/supabase';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';

export default function CadastroScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const onboardingData = route?.params?.onboardingData ?? {};

  async function criar() {
    if (!email || !senha) { Alert.alert('Preencha email e senha'); return; }
    if (senha.length < 6) { Alert.alert('A senha precisa ter ao menos 6 caracteres'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) { Alert.alert('Erro', error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        ...onboardingData,
        onboarding_concluido: true,
      });
    }
    setLoading(false);
  }

  return (
    <AuthLayout onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.body}>
          <Text style={s.title}>Criar conta</Text>
          <Text style={s.sub}>Para salvar seu progresso e o seu refúgio sonoro.</Text>

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
            placeholder="mínimo 6 caracteres"
            placeholderTextColor="#9AA8BD"
            secureTextEntry
          />
        </View>

        <View style={s.footer}>
          <PrimaryButton label={loading ? 'Criando...' : 'Criar conta'} onPress={criar} disabled={loading} showArrow={false} />
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.textoPrimario, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 32 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textoPrimario, marginBottom: 8, marginTop: 16 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.textoPrimario,
    backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: colors.borda,
  },
  footer: { paddingBottom: 16, paddingTop: 8 },
});
