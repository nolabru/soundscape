export const lightColors = {
  azulEscuro: '#16233F',
  azulMedio: '#3D5A80',
  azulClaro: '#7FA8D4',
  branco: '#FFFFFF',
  preto: '#0D0D12',

  // semânticos
  fundo: '#F7F9FC',
  card: '#FFFFFF',
  borda: '#E8EDF4',
  tint: '#EAF1FA',
  destaque: '#16233F', // superfície escura que NÃO inverte (card "Meu Refúgio")
  textoPrimario: '#16233F',
  textoSecundario: '#6B7C95',
  textoSobreEscuro: '#FFFFFF',
  skeleton: '#E4EAF2',
  perigo: '#E5484D',
  sucesso: '#2FA67A',
  alerta: '#E89A3C',
};

export const darkColors: typeof lightColors = {
  azulEscuro: '#5E8DC4', // vira o "primário" claro sobre fundo escuro (botões, chips)
  azulMedio: '#5A78A0',
  azulClaro: '#7FA8D4',
  branco: '#FFFFFF',
  preto: '#0D0D12',

  fundo: '#0E1726',
  card: '#172339',
  borda: '#27344C',
  tint: '#1E2E48',
  destaque: '#243650',
  textoPrimario: '#EAF1FA',
  textoSecundario: '#93A4BE',
  textoSobreEscuro: '#FFFFFF',
  skeleton: '#1E2E48',
  perigo: '#E5675B',
  sucesso: '#3DBB89',
  alerta: '#E89A3C',
};

export type Palette = typeof lightColors;

// Paleta padrão (claro) — mantida para componentes decorativos e compatibilidade.
export const colors = lightColors;

export const fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};
