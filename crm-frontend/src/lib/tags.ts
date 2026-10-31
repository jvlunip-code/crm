import type { TagColor } from '@/types';

/** Tag colours in Finder order; `dot` is a full class name so Tailwind sees it. */
export const TAG_COLORS: { value: TagColor; label: string; dot: string }[] = [
  { value: 'red', label: 'Vermelho', dot: 'bg-tag-red' },
  { value: 'orange', label: 'Laranja', dot: 'bg-tag-orange' },
  { value: 'yellow', label: 'Amarelo', dot: 'bg-tag-yellow' },
  { value: 'green', label: 'Verde', dot: 'bg-tag-green' },
  { value: 'blue', label: 'Azul', dot: 'bg-tag-blue' },
  { value: 'purple', label: 'Roxo', dot: 'bg-tag-purple' },
  { value: 'gray', label: 'Cinzento', dot: 'bg-tag-gray' },
];

const DOT_BY_COLOR = Object.fromEntries(TAG_COLORS.map((c) => [c.value, c.dot])) as Record<
  TagColor,
  string
>;

export function tagDotClass(color: TagColor): string {
  return DOT_BY_COLOR[color] ?? 'bg-tag-gray';
}
