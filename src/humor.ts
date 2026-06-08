import { Frown, Angry, Meh, Smile, Laugh, LucideIcon } from 'lucide-react-native';

// índice 0..4  →  humor 1..5
export const HUMOR_ICONS: LucideIcon[] = [Angry, Frown, Meh, Smile, Laugh];
export const HUMOR_LABELS = ['Muito triste', 'Triste', 'Neutro', 'Feliz', 'Muito feliz'];
export const HUMOR_CORES = ['#E5484D', '#E8843C', '#D7B43A', '#5FAE7A', '#2FA67A'];

export function humorIcon(humor: number): LucideIcon {
  return HUMOR_ICONS[Math.min(Math.max(humor - 1, 0), 4)];
}
export function humorCor(humor: number): string {
  return HUMOR_CORES[Math.min(Math.max(humor - 1, 0), 4)];
}
