import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingScreen from '../components/LoadingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useTheme } from '../ThemeContext';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import SobreVoceScreen from '../screens/onboarding/SobreVoceScreen';
import NecessidadesScreen from '../screens/onboarding/NecessidadesScreen';
import RedeApoioScreen from '../screens/onboarding/RedeApoioScreen';
import PermissoesScreen from '../screens/onboarding/PermissoesScreen';
import TesteRefugioScreen from '../screens/onboarding/TesteRefugioScreen';
import ConclusaoScreen from '../screens/onboarding/ConclusaoScreen';
import MainTabs from './MainTabs';
import NovoRegistroScreen from '../screens/main/NovoRegistroScreen';
import PlayerScreen from '../screens/main/PlayerScreen';
import GuardiaoScreen from '../screens/main/GuardiaoScreen';
import PanicoScreen from '../screens/modals/PanicoScreen';
import EMAScreen from '../screens/modals/EMAScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { colors, dark } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: colors.fundo,
      card: colors.card,
      text: colors.textoPrimario,
      border: colors.borda,
      primary: colors.azulClaro,
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkOnboarding(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        // Ao entrar/cadastrar, segura a tela em branco até confirmar o onboarding,
        // evitando piscar entre os stacks de auth e onboarding.
        if (event === 'SIGNED_IN') setLoading(true);
        checkOnboarding(session.user.id);
      } else {
        setOnboardingDone(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkOnboarding(userId: string, tentativas = 8) {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_concluido')
      .eq('id', userId)
      .single();

    if (!data && tentativas > 0) {
      setTimeout(() => checkOnboarding(userId, tentativas - 1), 600);
      return;
    }

    setOnboardingDone(data?.onboarding_concluido ?? false);
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.fundo } }}>
        {!session ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="SobreVoce" component={SobreVoceScreen} />
            <Stack.Screen name="Necessidades" component={NecessidadesScreen} />
            <Stack.Screen name="RedeApoio" component={RedeApoioScreen} />
            <Stack.Screen name="Permissoes" component={PermissoesScreen} />
            <Stack.Screen name="Guardiao" component={GuardiaoScreen} />
            <Stack.Screen name="TesteRefugio" component={TesteRefugioScreen} />
            <Stack.Screen name="Conclusao" component={ConclusaoScreen} />
          </>
        ) : !onboardingDone ? (
          <>
            <Stack.Screen name="SobreVoce" component={SobreVoceScreen} />
            <Stack.Screen name="Necessidades" component={NecessidadesScreen} />
            <Stack.Screen name="RedeApoio" component={RedeApoioScreen} />
            <Stack.Screen name="Permissoes" component={PermissoesScreen} />
            <Stack.Screen name="Guardiao" component={GuardiaoScreen} />
            <Stack.Screen name="TesteRefugio" component={TesteRefugioScreen} />
            <Stack.Screen name="Conclusao" component={ConclusaoScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Guardiao" component={GuardiaoScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="NovoRegistro" component={NovoRegistroScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="Panico" component={PanicoScreen} options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
            <Stack.Screen name="EMA" component={EMAScreen} options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
