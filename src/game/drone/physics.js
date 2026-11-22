import { clamp } from '../levels/levels.js';
export function advanceDrone(drone, input, dt, buildings) {
  const previous = [...drone.position];
  const magnitude = Math.max(1, Math.hypot(input.x, input.z));
  const desired = [
    (input.x / magnitude) * 12,
    input.y * 7,
    (input.z / magnitude) * 12,
  ];
  for (let axis = 0; axis < 3; axis++) {
    drone.velocity[axis] +=
      (desired[axis] - drone.velocity[axis]) * (1 - Math.exp(-7 * dt));
    drone.position[axis] += drone.velocity[axis] * dt;
  }
  drone.position[1] = clamp(drone.position[1], 2, 28);
  drone.position[0] = clamp(drone.position[0], -35, 35);
  drone.position[2] = clamp(drone.position[2], -35, 35);
  const [x, y, z] = drone.position;
  const hit = buildings.some(
    (b) =>
      Math.abs(x - b.x) < b.w / 2 + 1.2 &&
      Math.abs(z - b.z) < b.d / 2 + 1.2 &&
      y < b.h + 0.7,
  );
  if (hit) {
    drone.position = previous;
    drone.velocity = drone.velocity.map((v) => -v * 0.35);
  }
  return hit;
}
