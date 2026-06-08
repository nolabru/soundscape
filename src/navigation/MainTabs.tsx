import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import GuardiaoMonitor from '../components/GuardiaoMonitor';
import { colors } from '../theme';
import MixerScreen from '../screens/main/MixerScreen';
import DiarioScreen from '../screens/main/DiarioScreen';
import AnalisesScreen from '../screens/main/AnalisesScreen';
import ConfiguracoesScreen from '../screens/main/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.fundo } }}
      >
        <Tab.Screen name="Mixer" component={MixerScreen} />
        <Tab.Screen name="Diario" component={DiarioScreen} />
        <Tab.Screen name="Analises" component={AnalisesScreen} />
        <Tab.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      </Tab.Navigator>
      <GuardiaoMonitor />
    </>
  );
}
