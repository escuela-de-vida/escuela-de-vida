export type TypingError = { index: number; expected: string; got: string };

export type TypingMetrics = {
  wpm: number;
  accuracyPct: number;
  errors: TypingError[];
};

/**
 * WPM estándar: (caracteres correctos / 5) / minutos. Precisión: % de
 * caracteres del texto dictado que coinciden en la misma posición.
 */
export function computeTypingMetrics(
  dictationText: string,
  typedText: string,
  durationSeconds: number,
): TypingMetrics {
  const len = Math.max(dictationText.length, typedText.length);
  const errors: TypingError[] = [];
  let correctChars = 0;

  for (let i = 0; i < len; i++) {
    const expected = dictationText[i] ?? "";
    const got = typedText[i] ?? "";
    if (expected === got) {
      correctChars++;
    } else if (errors.length < 50) {
      errors.push({ index: i, expected, got });
    }
  }

  const minutes = Math.max(durationSeconds / 60, 1 / 60);
  const wpm = Math.round(correctChars / 5 / minutes);
  const accuracyPct = dictationText.length
    ? Math.round((correctChars / dictationText.length) * 100)
    : 0;

  return { wpm, accuracyPct: Math.max(0, Math.min(100, accuracyPct)), errors };
}
