import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { AppStateProvider } from './src/AppState';
import { ThemeProvider } from './src/ThemeContext';
import Navigation from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    Asset.loadAsync([require('./assets/bg-initial-page.png')]).finally(() => setAssetsLoaded(true));
  }, []);

  if (!fontsLoaded || !assetsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStateProvider>
          <Navigation />
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
