import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Wind } from 'lucide-react-native';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { useAppState } from '../../AppState';

const { width } = Dimensions.get('window');
const CIRCLE = width * 0.62;

export default function PanicoScreen() {
  const scale = useRef(new Animated.Value(0.82)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const { setAudioOcupado } = useAppState();

  useEffect(() => {
    setAudioOcupado(true);
    return () => setAudioOcupado(false);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.82, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    perguntarEnvio();
  }, []);

  async function perguntarEnvio() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('contato_emergencia_tel, contato_emergencia_nome, nome, avisar_em_crise').eq('id', user.id).single();
    if (!data?.contato_emergencia_tel) return;
    if (data.avisar_em_crise === false) return;

    Alert.alert(
      'Avisar contato de emergência?',
      `Enviar uma mensagem para ${data.contato_emergencia_nome || 'seu contato'} com a sua localização.`,
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Sim, avisar', onPress: () => enviarSMS(data.contato_emergencia_tel, data.nome) },
      ]
    );
  }

  async function enviarSMS(tel: string, nome?: string) {
    if (!(await SMS.isAvailableAsync())) return;

    let local = '';
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        local = ` Localização: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      }
    } catch (_) {}

    await SMS.sendSMSAsync(
      [tel],
      `${nome ?? 'Alguém'} está passando por uma crise sensorial e pode precisar de apoio.${local}`
    );
  }

  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safe}>
        <View style={s.top}>
          <Text style={s.titulo}>Respira</Text>
          <Text style={s.sub}>Siga o ritmo do círculo</Text>
        </View>

        <View style={s.center}>
          <Animated.View style={[s.halo, { transform: [{ scale: haloScale }], opacity: haloOpacity }]} />
          <Animated.View style={[s.circle, { transform: [{ scale }] }]}>
            <Wind size={56} color={colors.branco} strokeWidth={1.5} />
          </Animated.View>
        </View>

        <View style={s.bottom}>
          <Text style={s.instrucao}>Inspire quando expandir{'\n'}Expire quando contrair</Text>
          <TouchableOpacity style={s.btn} onPress={() => navigation.replace('EMA')} activeOpacity={0.85}>
            <Text style={s.btnText}>Estou bem</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1426' },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 32 },
  top: { alignItems: 'center', marginTop: 40 },
  titulo: { fontFamily: fonts.bold, fontSize: 36, color: colors.branco, marginBottom: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.azulClaro },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, backgroundColor: colors.azulClaro },
  circle: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    backgroundColor: 'rgba(127,168,212,0.12)', borderWidth: 1.5, borderColor: colors.azulClaro,
    alignItems: 'center', justifyContent: 'center',
  },
  bottom: { alignItems: 'center', marginBottom: 24 },
  instrucao: { fontFamily: fonts.regular, fontSize: 15, color: '#8AA0BE', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  btn: { backgroundColor: colors.branco, paddingVertical: 18, borderRadius: 28, width: '100%', alignItems: 'center' },
  btnText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.azulEscuro },
});
