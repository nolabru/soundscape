import React from 'react';
import { View, Text, StyleSheet, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Moon, ShieldCheck } from 'lucide-react-native';
import PrimaryButton from '../../components/PrimaryButton';
import FloatingBlobs from '../../components/FloatingBlobs';
import { fonts, Palette } from '../../theme';
import { useTheme } from '../../ThemeContext';

export default function ConclusaoScreen({ navigation, route }: any) {
  const { colors, dark, setDark } = useTheme();
  const s = makeStyles(colors);
  const prev = route?.params?.onboardingData ?? {};
  const nome = prev.nome || 'tudo';

  return (
    <View style={s.root}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <FloatingBlobs />
      <SafeAreaView style={s.safe}>
        <View style={s.body}>
          <View style={s.badge}>
            <Sparkles size={34} color={colors.azulClaro} />
          </View>
          <Text style={s.title}>Tudo pronto, {nome}!</Text>
          <Text style={s.sub}>
            Seu espaço seguro está configurado. Lembre-se: o seu Botão de Pânico está sempre pronto na tela inicial.
          </Text>

          <View style={s.card}>
            <View style={s.rowIcon}><ShieldCheck size={18} color={colors.azulClaro} /></View>
            <Text style={s.cardText}>Guardião e Refúgio Sonoro configurados.</Text>
          </View>

          <View style={s.card}>
            <View style={s.rowIcon}><Moon size={18} color={colors.azulClaro} /></View>
            <Text style={s.cardText}>Modo escuro</Text>
            <Switch value={dark} onValueChange={setDark} trackColor={{ true: colors.azulClaro, false: colors.borda }} thumbColor={colors.branco} />
          </View>
        </View>

        <View style={s.footer}>
          <PrimaryButton
            label="Ir para a Mesa de Som"
            showArrow
            onPress={() => navigation.navigate('Cadastro', { onboardingData: prev })}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.fundo },
  safe: { flex: 1, paddingHorizontal: 28 },
  body: { flex: 1, justifyContent: 'center' },
  badge: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.tint,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.textoPrimario, marginBottom: 12 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textoSecundario, lineHeight: 23, marginBottom: 28 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borda, marginBottom: 12,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.textoPrimario },
  footer: { paddingBottom: 16 },
});
