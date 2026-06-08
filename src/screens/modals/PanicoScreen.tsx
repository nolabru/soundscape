import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SMS from 'expo-sms';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CIRCLE = width * 0.6;

export default function PanicoScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    enviarSMS();
  }, []);

  async function enviarSMS() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('contato_emergencia_tel, nome').eq('id', user.id).single();
    if (!data?.contato_emergencia_tel) return;
    const disponivel = await SMS.isAvailableAsync();
    if (disponivel) {
      await SMS.sendSMSAsync([data.contato_emergencia_tel], `${data.nome ?? 'Usuário'} está passando por uma crise sensorial e pode precisar de apoio.`);
    }
  }

  function estouBem() {
    navigation.replace('EMA');
  }

  return (
    <View style={s.screen}>
      <Text style={s.titulo}>Respira.</Text>
      <Text style={s.sub}>Siga o círculo</Text>

      <Animated.View style={[s.circle, { transform: [{ scale }] }]}>
        <Text style={s.circleText}>🫁</Text>
      </Animated.View>

      <Text style={s.instrucao}>
        Inspire quando expandir...{'\n'}Expire quando contrair.
      </Text>

      <TouchableOpacity style={s.btn} onPress={estouBem}>
        <Text style={s.btnText}>Estou bem</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center', padding: 32 },
  titulo: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 8 },
  sub: { color: '#666', fontSize: 16, marginBottom: 48 },
  circle: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    backgroundColor: '#1E1B4B', borderWidth: 2, borderColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 48,
  },
  circleText: { fontSize: 56 },
  instrucao: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 48 },
  btn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 14, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
