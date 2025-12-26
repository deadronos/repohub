export function generateParticles(count: number) {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const positions = new Float32Array(safeCount * 3);
  const initialPositions = new Float32Array(safeCount * 3);

  for (let i = 0; i < safeCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    initialPositions[i * 3] = x;
    initialPositions[i * 3 + 1] = y;
    initialPositions[i * 3 + 2] = z;
  }

  return [positions, initialPositions] as const;
}

export function applyParticleFrame(
  particlePositions: Float32Array,
  initialPositions: Float32Array,
  pointerX: number,
  pointerY: number,
  time: number,
  particleCount: number,
) {
  const safeCount = Math.min(
    Math.max(0, Math.floor(particleCount)),
    Math.floor(particlePositions.length / 3),
    Math.floor(initialPositions.length / 3),
  );

  for (let i = 0; i < safeCount; i++) {
    const i3 = i * 3;

    let y = particlePositions[i3 + 1] ?? 0;
    y -= 0.02;

    if (y < -25) {
      y = 25;
    }

    const x =
      (initialPositions[i3] ?? 0) +
      Math.sin(time * 0.5 + (initialPositions[i3 + 1] ?? 0) * 0.5) * 0.5;

    particlePositions[i3] = x + pointerX * 0.05;
    particlePositions[i3 + 1] = y;
  }

  return {
    rotationX: -pointerY * 0.1,
    rotationY: pointerX * 0.1,
  };
}
