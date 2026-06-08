// Mapa de áudios reais por id de som.
// Para adicionar um som, coloque o arquivo em assets/sounds/ e registre aqui.
export const SOUND_FILES: Record<string, any> = {
  rosa: require('../assets/sounds/ruidorosa.mp3'),
  // branco: require('../assets/sounds/ruidobranco.mp3'),
  // marrom: require('../assets/sounds/ruidomarrom.mp3'),
  // chuva: require('../assets/sounds/chuva.mp3'),
  // ondas: require('../assets/sounds/agua.mp3'),
  // floresta: require('../assets/sounds/natureza.mp3'),
  // passaros: require('../assets/sounds/passaros.mp3'),
  // vento: require('../assets/sounds/vento.mp3'),
  // lareira: require('../assets/sounds/lareira.mp3'),
};

export function temAudio(id?: string | null): boolean {
  return !!id && !!SOUND_FILES[id];
}
