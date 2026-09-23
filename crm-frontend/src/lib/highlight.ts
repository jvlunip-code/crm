export type HighlightPart = { text: string; match: boolean };

/** Lower-case, accent-free form of one character ("Ç" → "c"). */
function fold(char: string): string {
  const folded = char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  // Keep a 1:1 index mapping with the original string.
  return folded.length === 1 ? folded : char.toLowerCase();
}

/**
 * Splits `text` into matched / unmatched runs for every whitespace-separated
 * token of `query`, ignoring case and accents — the same way the backend
 * search matches ("goncalves" highlights "Gonçalves").
 */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const chars = Array.from(text);
  const haystack = chars.map(fold).join('');
  const tokens = query
    .split(/\s+/)
    .map((t) => Array.from(t).map(fold).join(''))
    .filter((t) => t.length > 0);
  if (!text || tokens.length === 0) return [{ text, match: false }];

  const marked = new Array<boolean>(chars.length).fill(false);
  for (const token of tokens) {
    let from = haystack.indexOf(token);
    while (from !== -1) {
      for (let i = from; i < from + token.length; i++) marked[i] = true;
      from = haystack.indexOf(token, from + token.length);
    }
  }

  const parts: HighlightPart[] = [];
  chars.forEach((char, i) => {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += char;
    else parts.push({ text: char, match: marked[i] });
  });
  return parts;
}
