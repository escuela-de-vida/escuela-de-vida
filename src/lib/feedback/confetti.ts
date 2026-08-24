import confetti from "canvas-confetti";

/** Confetti breve y contenido — feedback inmediato (sección 5.6), no un show. */
export function fireConfetti(color?: string) {
  confetti({
    particleCount: 60,
    spread: 65,
    origin: { y: 0.65 },
    colors: color ? [color, "#ffffff"] : undefined,
    scalar: 0.9,
    ticks: 150,
  });
}
