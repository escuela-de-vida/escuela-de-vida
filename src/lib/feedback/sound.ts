// Sonidos minimalistas sintetizados con Web Audio API — sin archivos de
// audio externos (evita temas de licencia y peso). Tonos cortos y suaves,
// nunca ásperos: ni siquiera el de "no llegaste todavía" suena a error,
// coherente con la sección 1 (ningún feedback debe sentirse como castigo).

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtx();
  }
  return ctx;
}

function tone(freq: number, startOffset: number, duration: number, gainPeak = 0.08) {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  const start = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

/** Puntos ganados — arpeggio ascendente corto y alegre. */
export function playSuccessSound() {
  tone(523.25, 0, 0.18); // C5
  tone(659.25, 0.07, 0.18); // E5
  tone(783.99, 0.14, 0.24); // G5
}

/** Tarea completada sin AI/puntos especiales — un solo tono suave. */
export function playSubtleSound() {
  tone(587.33, 0, 0.2, 0.06); // D5
}

/** No llegó al umbral todavía (ej. reescritura de frase) — nunca negativo. */
export function playRetrySound() {
  tone(392, 0, 0.15, 0.05); // G4
  tone(349.23, 0.1, 0.2, 0.05); // F4
}
