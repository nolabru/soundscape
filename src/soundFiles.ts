// Mapa de áudios reais por id de som (tocados em loop no Player).
export const SOUND_FILES: Record<string, any> = {
  chuva: require('../assets/sounds/chuva.mp3'),
  ondas: require('../assets/sounds/ondas.mp3'),
  floresta: require('../assets/sounds/floresta.mp3'),
  passaros: require('../assets/sounds/passaros.mp3'),
  vento: require('../assets/sounds/vento.mp3'),
  lareira: require('../assets/sounds/lareira.mp3'),
  branco: require('../assets/sounds/ruidobranco.mp3'),
  rosa: require('../assets/sounds/ruidorosa.mp3'),
  marrom: require('../assets/sounds/ruidomarrom.mp3'),
  ventilador: require('../assets/sounds/ventilador.mp3'),
};

export function temAudio(id?: string | null): boolean {
  return !!id && !!SOUND_FILES[id];
}
