import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/state/game.js';
import { clamp } from '../src/game/levels/levels.js';
const tick = (game, seconds) => {
  for (let n = 0; n < seconds * 60; n++) game.tick(1 / 60);
};
function flyTo(game, destination) {
  for (let frame = 0; frame < 1800; frame++) {
    const error = destination.map((v, i) => v - game.drone.position[i]);
    if (Math.hypot(...error) < 0.15 && Math.hypot(...game.drone.velocity) < 0.2)
      return;
    assert.equal(
      game.screen,
      'playing',
      `Flight ended while approaching ${destination}`,
    );
    game.tick(1 / 60, {
      x: clamp(error[0] / 4, -1, 1),
      y: clamp(error[1] / 3, -1, 1),
      z: clamp(error[2] / 4, -1, 1),
    });
  }
  assert.fail(`Did not reach ${destination}`);
}
test('fly all three missions using movement input, without relocating the drone', () => {
  const game = createGame();
  for (let level = 1; level <= 3; level++) {
    game.start(level);
    tick(game, 3.1);
    for (const [id, route] of game.level.routes.entries()) {
      if (id > 0) {
        flyTo(game, [
          ...game.drone.position.slice(0, 1),
          26,
          game.drone.position[2],
        ]);
        flyTo(game, [route.pickup[0], 26, route.pickup[2]]);
      }
      flyTo(game, [route.pickup[0], route.pickup[1] + 3, route.pickup[2]]);
      game.action();
      assert.equal(game.packages[id].status, 'held');
      flyTo(game, [route.pickup[0], 26, route.pickup[2]]);
      flyTo(game, [route.target[0], 26, route.target[2]]);
      flyTo(game, [route.target[0], route.target[1] + 3, route.target[2]]);
      game.action();
      tick(game, 0.8);
      assert.equal(game.packages[id].status, 'delivered');
    }
    assert.equal(game.screen, 'complete');
    assert.equal(game.collisions, 0);
    assert.ok(game.stars >= 2);
    assert.ok(game.time > 0);
  }
  assert.equal(game.unlocked, 3);
});
