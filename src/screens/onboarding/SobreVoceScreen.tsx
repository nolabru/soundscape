import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts } from '../../theme';

export default function SobreVoceScreen({ navigation, route }: any) {
  const [nome, setNome] = useState('');
  const prev = route?.params?.onboardingData ?? {};

  return (
    <OnboardingLayout step={1} onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.body}>
          <Text style={s.title}>Como você gostaria{'\n'}de ser chamado?</Text>
          <Text style={s.sub}>Vamos personalizar sua experiência.</Text>

          <TextInput
            style={s.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome ou apelido"
            placeholderTextColor="#9AA8BD"
          />
        </View>

        <View style={s.footer}>
          <PrimaryButton
            label="Continuar"
            disabled={!nome.trim()}
            onPress={() => navigation.navigate('Necessidades', { onboardingData: { ...prev, nome } })}
          />
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.textoPrimario, lineHeight: 34, marginBottom: 10 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, marginBottom: 32 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.textoPrimario,
    backgroundColor: colors.branco, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: '#E2E8F2',
  },
  footer: { paddingBottom: 16 },
});
