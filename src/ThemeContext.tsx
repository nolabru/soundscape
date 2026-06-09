import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Palette } from './theme';

type ThemeCtx = {
  dark: boolean;
  colors: Palette;
  setDark: (v: boolean) => void;
  toggle: () => void;
  pronto: boolean;
};

const Ctx = createContext<ThemeCtx>({
  dark: false,
  colors: lightColors,
  setDark: () => {},
  toggle: () => {},
  pronto: true,
});

const KEY = '@soundscape:dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v != null) setDarkState(v === '1'); })
      .finally(() => setPronto(true));
  }, []);

  function setDark(v: boolean) {
    setDarkState(v);
    AsyncStorage.setItem(KEY, v ? '1' : '0').catch(() => {});
  }

  const value: ThemeCtx = {
    dark,
    colors: dark ? darkColors : lightColors,
    setDark,
    toggle: () => setDark(!dark),
    pronto,
  };

  if (!pronto) return null;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
