import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import { ChevronLeft, ShieldCheck, ShieldAlert, MicOff } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';
import { useMicLevel } from '../../hooks/useMicLevel';
import { useAppState } from '../../AppState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 230;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const MAX_DB = 120;

export default function GuardiaoScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onboarding: boolean = route.params?.onboarding ?? false;
  const prev = route.params?.onboardingData ?? {};

  const [monitorando, setMonitorando] = useState(true);
  const [limiar, setLimiar] = useState(75);
  const [fadeIn, setFadeIn] = useState(true);
  const [somRefugio, setSomRefugio] = useState<string | null>(null);
  const alertadoRef = useRef(false);

  const { nivel, permitido } = useMicLevel(monitorando);
  const { setAudioOcupado } = useAppState();

  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setAudioOcupado(true);
    return () => setAudioOcupado(false);
  }, []);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('guardiao_limiar, som_refugio').eq('id', user.id).single();
    if (data?.guardiao_limiar) setLimiar(data.guardiao_limiar);
    setSomRefugio(data?.som_refugio ?? prev.som_refugio ?? null);
  }

  const pct = Math.min((monitorando ? nivel : 0) / MAX_DB, 1);
  const emAlerta = monitorando && nivel >= limiar;

  // anima o anel suavemente a cada leitura
  useEffect(() => {
    Animated.timing(progresso, {
      toValue: pct,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const strokeDashoffset = progresso.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });

  // sugere o refúgio uma vez ao ultrapassar (modo perfil)
  useEffect(() => {
    if (emAlerta && !alertadoRef.current && !onboarding && somRefugio) {
      alertadoRef.current = true;
      Alert.alert('Ruído alto detectado', 'Deseja ativar o seu Refúgio Sonoro?', [
        { text: 'Agora não', style: 'cancel', onPress: () => { setTimeout(() => { alertadoRef.current = false; }, 4000); } },
        { text: 'Ativar Refúgio', onPress: () => navigation.navigate('Player', { somId: somRefugio }) },
      ]);
    }
    if (!emAlerta) alertadoRef.current = false;
  }, [emAlerta]);

  async function continuar() {
    if (onboarding) {
      navigation.navigate('TesteRefugio', { onboardingData: { ...prev, guardiao_ativo: true, guardiao_limiar: limiar } });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({ id: user.id, guardiao_ativo: monitorando, guardiao_limiar: limiar });
    if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('Main');
  }

  // marcador do limiar sobre o anel
  const thrAng = (-90 + 360 * (limiar / MAX_DB)) * (Math.PI / 180);
  const thrX = SIZE / 2 + R * Math.cos(thrAng);
  const thrY = SIZE / 2 + R * Math.sin(thrAng);

  const corNivel = emAlerta ? colors.perigo : colors.azulEscuro;

  return (
    <View style={s.screen}>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')}>
            <ChevronLeft size={24} color={colors.azulEscuro} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Sistema Guardião</Text>
          <View style={s.iconBtn} />
        </View>

        <View style={s.meterWrap}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.azulClaro} />
                <Stop offset="1" stopColor={colors.azulMedio} />
              </LinearGradient>
            </Defs>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.borda} strokeWidth={STROKE} fill="none" />
            <AnimatedCircle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              stroke={emAlerta ? colors.perigo : 'url(#grad)'}
              strokeWidth={STROKE} fill="none"
              strokeDasharray={C} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
            <Circle cx={thrX} cy={thrY} r={5} fill={colors.azulEscuro} />
          </Svg>
          <View style={s.meterCenter}>
            {permitido === false ? (
              <>
                <MicOff size={28} color={colors.textoSecundario} />
                <Text style={s.meterSub}>Sem acesso{'\n'}ao microfone</Text>
              </>
            ) : (
              <>
                <Text style={[s.meterValue, { color: corNivel }]}>{monitorando ? nivel : '--'}</Text>
                <Text style={s.meterUnit}>dB</Text>
              </>
            )}
          </View>
        </View>

        <View style={s.statusRow}>
          {emAlerta ? <ShieldAlert size={18} color={colors.perigo} /> : <ShieldCheck size={18} color={colors.azulClaro} />}
          <Text style={[s.statusText, emAlerta && { color: colors.perigo }]}>
            {!monitorando ? 'Monitoramento pausado' : emAlerta ? 'Acima do limiar' : 'Ambiente tranquilo'}
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.row}>
            <View style={s.rowInfo}>
              <Text style={s.rowTitle}>Monitoramento Ambiental</Text>
              <Text style={s.rowSub}>Processamento 100% local — sem gravar vozes</Text>
            </View>
            <Switch value={monitorando} onValueChange={setMonitorando} trackColor={{ true: colors.azulClaro, false: colors.borda }} thumbColor={colors.branco} />
          </View>

          <View style={s.divider} />

          <View style={s.row}>
            <View style={s.rowInfo}>
              <Text style={s.rowTitle}>Intervenção com Fade-in</Text>
              <Text style={s.rowSub}>O refúgio entra suave, sem susto</Text>
            </View>
            <Switch value={fadeIn} onValueChange={setFadeIn} trackColor={{ true: colors.azulClaro, false: colors.borda }} thumbColor={colors.branco} />
          </View>

          <View style={s.divider} />

          <Text style={s.rowTitle}>Sensibilidade</Text>
          <Text style={s.rowSub}>Ativar o refúgio acima de {limiar} dB</Text>
          <Slider
            style={{ width: '100%', height: 40, marginTop: 6 }}
            value={limiar}
            onValueChange={(v: number) => setLimiar(Math.round(v))}
            minimumValue={40}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={colors.azulClaro}
            maximumTrackTintColor={colors.borda}
            thumbTintColor={colors.azulEscuro}
          />
        </View>

        <TouchableOpacity style={s.btn} onPress={continuar} activeOpacity={0.85}>
          <Text style={s.btnText}>{onboarding ? 'Continuar' : 'Salvar configuração'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fundo },
  safe: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.textoPrimario },

  meterWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 8 },
  meterCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  meterValue: { fontFamily: fonts.bold, fontSize: 56 },
  meterUnit: { fontFamily: fonts.medium, fontSize: 16, color: colors.textoSecundario, marginTop: -6 },
  meterSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textoSecundario, textAlign: 'center', marginTop: 8 },

  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  statusText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.azulClaro },

  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.borda },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowInfo: { flex: 1, marginRight: 12 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textoPrimario },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textoSecundario, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.borda, marginVertical: 16 },

  btn: { backgroundColor: colors.azulEscuro, paddingVertical: 17, borderRadius: 28, alignItems: 'center', marginTop: 'auto', marginBottom: 16 },
  btnText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.branco },
});
