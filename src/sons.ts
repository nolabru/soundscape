import { CloudRain, Waves, Trees, Bird, Wind, Flame, Radio, AudioLines, Music, Fan, LucideIcon } from 'lucide-react-native';

export type Som = { id: string; label: string; Icon: LucideIcon };

export const SONS_NATUREZA: Som[] = [
  { id: 'chuva', label: 'Chuva Suave', Icon: CloudRain },
  { id: 'ondas', label: 'Ondas do Mar', Icon: Waves },
  { id: 'floresta', label: 'Floresta', Icon: Trees },
  { id: 'passaros', label: 'Pássaros', Icon: Bird },
  { id: 'vento', label: 'Vento Suave', Icon: Wind },
  { id: 'lareira', label: 'Lareira', Icon: Flame },
];

export const RUIDOS: Som[] = [
  { id: 'branco', label: 'Ruído Branco', Icon: Radio },
  { id: 'rosa', label: 'Ruído Rosa', Icon: AudioLines },
  { id: 'marrom', label: 'Ruído Marrom', Icon: Music },
  { id: 'ventilador', label: 'Ventilador', Icon: Fan },
];

export const TODOS_SONS: Som[] = [...SONS_NATUREZA, ...RUIDOS];

export function getSom(id?: string | null): Som | undefined {
  if (!id) return undefined;
  return TODOS_SONS.find(s => s.id === id);
}
