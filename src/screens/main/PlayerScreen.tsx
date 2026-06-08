import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { ChevronDown, Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';
import { getSom } from '../../sons';
import { SOUND_FILES } from '../../soundFiles';
import { useAppState } from '../../AppState';
import WaveBackground from '../../components/WaveBackground';

export default function PlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { setAudioOcupado } = useAppState();
  const somId: string = route.params?.somId;
  const som = getSom(somId);

  const [tocando, setTocando] = useState(true);
  const [ehRefugio, setEhRefugio] = useState(false);
  const temAudio = !!SOUND_FILES[somId];
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let montado = true;
    setAudioOcupado(true);
    async function carregarAudio() {
      const file = SOUND_FILES[somId];
      if (!file) return;
      try { await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }); } catch (_) {}
      try {
        const { sound } = await Audio.Sound.createAsync(file, { isLooping: true, shouldPlay: true, volume: 1 });
        if (!montado) { sound.unloadAsync(); return; }
        soundRef.current = sound;
        await sound.playAsync().catch(() => {});
      } catch (e: any) {
        Alert.alert('Erro ao tocar', String(e?.message ?? e));
      }
    }
    carregarAudio();
    checarRefugio();
    return () => { montado = false; setAudioOcupado(false); soundRef.current?.unloadAsync(); };
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    if (tocando) loop.start();
    return () => loop.stop();
  }, [tocando]);

  async function checarRefugio() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('som_refugio').eq('id', user.id).single();
    setEhRefugio(data?.som_refugio === somId);
  }

  async function togglePlay() {
    const snd = soundRef.current;
    if (snd) {
      if (tocando) await snd.pauseAsync().catch(() => {});
      else await snd.playAsync().catch(() => {});
    }
    setTocando(t => !t);
  }

  async function salvarRefugio() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({ id: user.id, som_refugio: somId });
    setEhRefugio(true);
    Alert.alert('Salvo', `"${som?.label}" agora é o seu Refúgio Sonoro.`);
  }

  if (!som) return null;
  const Icon = som.Icon;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.25] });

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" />
      <WaveBackground />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ChevronDown size={24} color={colors.branco} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Tocando agora</Text>
        <View style={s.iconBtn} />
      </View>

      <View style={s.center}>
        <Animated.View style={[s.halo, { transform: [{ scale: haloScale }], opacity: haloOpacity }]} />
        <Animated.View style={[s.disc, { transform: [{ scale }] }]}>
          <Icon size={72} color={colors.branco} strokeWidth={1.5} />
        </Animated.View>
        <Text style={s.somLabel}>{som.label}</Text>
        <Text style={s.somSub}>{!temAudio ? 'Prévia visual' : tocando ? 'Reproduzindo' : 'Pausado'}</Text>
      </View>

      <View style={[s.controls, { paddingBottom: insets.bottom + 28 }]}>
        <TouchableOpacity style={s.sideBtn} onPress={salvarRefugio}>
          {ehRefugio ? <BookmarkCheck size={24} color={colors.azulClaro} /> : <Bookmark size={24} color={colors.branco} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.playBtn} onPress={togglePlay} activeOpacity={0.85}>
          {tocando ? <Pause size={30} color={colors.azulEscuro} fill={colors.azulEscuro} /> : <Play size={30} color={colors.azulEscuro} fill={colors.azulEscuro} />}
        </TouchableOpacity>

        <View style={s.sideBtn} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1426' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.azulClaro },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.azulClaro },
  disc: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(127,168,212,0.14)', borderWidth: 1.5, borderColor: colors.azulClaro,
    alignItems: 'center', justifyContent: 'center', marginBottom: 36,
  },
  somLabel: { fontFamily: fonts.bold, fontSize: 24, color: colors.branco },
  somSub: { fontFamily: fonts.regular, fontSize: 14, color: '#8AA0BE', marginTop: 6 },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 40 },
  sideBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: colors.branco,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.branco, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
});
