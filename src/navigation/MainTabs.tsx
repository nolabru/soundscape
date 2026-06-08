import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import MixerScreen from '../screens/main/MixerScreen';
import DiarioScreen from '../screens/main/DiarioScreen';
import AnalisesScreen from '../screens/main/AnalisesScreen';
import ConfiguracoesScreen from '../screens/main/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();

function PanicButton() {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity style={s.panicBtn} onPress={() => navigation.navigate('Panico')}>
      <View style={s.panicInner} />
    </TouchableOpacity>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4F46E5' }}
    >
      <Tab.Screen name="Mixer" component={MixerScreen} options={{ title: 'Sons' }} />
      <Tab.Screen name="Diario" component={DiarioScreen} options={{ title: 'Diário' }} />
      <Tab.Screen
        name="Panico"
        component={MixerScreen}
        options={{
          title: '',
          tabBarButton: () => <PanicButton />,
        }}
      />
      <Tab.Screen name="Analises" component={AnalisesScreen} options={{ title: 'Análises' }} />
      <Tab.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Config' }} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  panicBtn: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  panicInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});
