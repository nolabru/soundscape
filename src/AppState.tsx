import React, { createContext, useContext, useState } from 'react';

type AppStateCtx = {
  // true enquanto alguma tela está usando a sessão de áudio (player, guardião, pânico).
  // O monitor global do Guardião pausa o microfone enquanto isso for true.
  audioOcupado: boolean;
  setAudioOcupado: (v: boolean) => void;
};

const Ctx = createContext<AppStateCtx>({ audioOcupado: false, setAudioOcupado: () => {} });

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [audioOcupado, setAudioOcupado] = useState(false);
  return <Ctx.Provider value={{ audioOcupado, setAudioOcupado }}>{children}</Ctx.Provider>;
}

export const useAppState = () => useContext(Ctx);
