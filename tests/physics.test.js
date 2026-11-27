import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceDrone } from '../src/game/drone/physics.js';
test('accelerates, brakes, clamps altitude and rejects building penetration', () => {
  const drone = { position: [0, 3, 0], velocity: [0, 0, 0] };
  for (let i = 0; i < 60; i++)
    advanceDrone(drone, { x: 1, y: 0, z: 0 }, 1 / 60, []);
  assert.ok(drone.position[0] > 8);
  assert.ok(drone.velocity[0] > 11);
  for (let i = 0; i < 60; i++)
    advanceDrone(drone, { x: 0, y: 0, z: 0 }, 1 / 60, []);
  assert.ok(drone.velocity[0] < 0.02);
  drone.position = [0, 28, 0];
  advanceDrone(drone, { x: 0, y: 1, z: 0 }, 0.05, []);
  assert.equal(drone.position[1], 28);
  drone.position = [0, 3, 0];
  drone.velocity = [12, 0, 0];
  assert.equal(
    advanceDrone(drone, { x: 1, y: 0, z: 0 }, 0.05, [
      { x: 2, z: 0, w: 2, d: 2, h: 8 },
    ]),
    true,
  );
  assert.equal(drone.position[0], 0);
});

test('stops outward velocity at world bounds and responds immediately to reverse input', () => {
  for (const [axis, bound, outward] of [
    [0, 35, 1],
    [0, -35, -1],
    [1, 28, 1],
    [1, 2, -1],
    [2, 35, 1],
    [2, -35, -1],
  ]) {
    const drone = { position: [0, 10, 0], velocity: [0, 0, 0] };
    drone.position[axis] = bound;
    const input = { x: 0, y: 0, z: 0 };
    const key = ['x', 'y', 'z'][axis];
    input[key] = outward;
    advanceDrone(drone, input, 1 / 60, []);
    assert.equal(drone.position[axis], bound);
    assert.equal(drone.velocity[axis], 0);
    input[key] = -outward;
    advanceDrone(drone, input, 1 / 60, []);
    assert.ok((drone.position[axis] - bound) * outward < 0);
  }
});
