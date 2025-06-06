import confetti from "canvas-confetti";

export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 120,
    origin: { x: 0, y: 0.6 },
    scalar: 1.5,
    ticks: 200,
    zIndex: 9999,
  });
  confetti({
    particleCount: 100,
    spread: 120,
    origin: { x: 1, y: 0.6 },
    scalar: 1.5,
    ticks: 200,
    zIndex: 9999,
  });
}
