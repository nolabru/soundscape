import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require('../../../assets/bg-initial-page.png')}
      style={s.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safe}>
        <View style={s.top}>
          <Text style={s.title}>SoundScapes</Text>
          <Text style={s.subtitle}>
            Regulação sensorial através de{'\n'}paisagens sonoras acolhedoras.
          </Text>
        </View>

        <View style={s.bottom}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('SobreVoce')} activeOpacity={0.85}>
            <Text style={s.btnPrimaryText}>Começar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginText}>
              Já tem uma conta? <Text style={s.loginBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#34537A' },
  safe: { flex: 1, justifyContent: 'space-between' },
  top: { marginTop: 80, paddingHorizontal: 32, alignItems: 'center' },
  title: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.branco,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.branco,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  btnPrimary: {
    backgroundColor: colors.branco,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: colors.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.azulEscuro,
  },
  loginLink: { alignItems: 'center', marginTop: 18 },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.branco,
    opacity: 0.9,
  },
  loginBold: {
    fontFamily: fonts.bold,
    color: colors.branco,
    opacity: 1,
  },
});
