import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/state/game.js';
const advance = (g, seconds, input) => {
  for (let i = 0; i < seconds * 60; i++) g.tick(1 / 60, input);
};
function launch(id = 1) {
  const g = createGame({ unlocked: 3 });
  g.start(id);
  advance(g, 3.1);
  return g;
}
test('pickup, falling release, precise delivery, rewards, stars and unlock persist', () => {
  const g = launch();
  assert.equal(g.screen, 'playing');
  g.action();
  assert.equal(g.packages[0].status, 'held');
  advance(g, 2.4, { x: 0, y: 0, z: -1 });
  advance(g, 0.9);
  assert.ok(Math.abs(g.drone.position[2] + 12.8) < 0.2);
  g.action();
  assert.equal(g.packages[0].status, 'falling');
  assert.equal(g.score, 0);
  advance(g, 1);
  assert.equal(g.screen, 'complete');
  assert.equal(g.completed, 1);
  assert.equal(g.score, 125);
  assert.ok(g.accuracy > 65);
  assert.equal(g.unlocked, 3);
  const fresh = createGame();
  fresh.start(1);
  advance(fresh, 3.1);
  fresh.action();
  fresh.drone.position = [0, 3, -14];
  advance(fresh, 0.05);
  fresh.action();
  advance(fresh, 1);
  assert.equal(fresh.score, 175);
  assert.equal(fresh.stars, 3);
  assert.equal(fresh.unlocked, 2);
  assert.equal(createGame(fresh.save()).unlocked, 2);
});
test('missed package resets and penalty applies only once', () => {
  const g = launch();
  g.action();
  g.action();
  advance(g, 2);
  assert.equal(g.score, -30);
  assert.equal(g.packages[0].status, 'waiting');
  advance(g, 2);
  assert.equal(g.score, -30);
});
test('wrong numbered target is rejected', () => {
  const g = launch(2);
  g.action();
  g.drone.position = [-17, 3, 18];
  advance(g, 0.05);
  g.action();
  advance(g, 1);
  assert.equal(g.completed, 0);
  assert.equal(g.score, -30);
});
test('collision penalty, cooldown, pause, timer expiry and restart', () => {
  const g = launch();
  g.drone.position = [10.6, 3, 0];
  advance(g, 0.3, { x: 1, y: 0, z: 0 });
  assert.equal(g.score, -20);
  assert.ok(g.battery < 93);
  const time = g.time;
  g.pause();
  advance(g, 10);
  assert.equal(g.time, time);
  g.pause();
  advance(g, 121);
  assert.equal(g.screen, 'failed');
  assert.match(g.reason, /Time expired/);
  g.start(1);
  assert.equal(g.score, 0);
  assert.equal(g.time, 120);
});
test('level lock and elevated target completion', () => {
  const locked = createGame();
  locked.start(2);
  assert.equal(locked.screen, 'menu');
  const g = launch(3);
  for (const cargo of g.packages) {
    const route = g.level.routes[cargo.id];
    g.drone.position = [route.pickup[0], route.pickup[1] + 3, route.pickup[2]];
    g.action();
    assert.equal(cargo.status, 'held');
    g.drone.position = [route.target[0], route.target[1] + 3, route.target[2]];
    advance(g, 0.05);
    g.action();
    advance(g, 1);
  }
  assert.equal(g.screen, 'complete');
  assert.equal(g.score, 675);
  assert.equal(g.stars, 3);
});
test('landing below an elevated target does not count as delivery', () => {
  const g = launch(3);
  const cargo = g.packages[0];
  cargo.status = 'falling';
  cargo.position = [-19, 1, -15];
  advance(g, 1);
  assert.equal(g.completed, 0);
  assert.equal(g.score, -30);
});
test('victory particles expire while the result screen is open', () => {
  const g = launch();
  g.action();
  g.drone.position = [0, 3, -14];
  advance(g, 0.05);
  g.action();
  advance(g, 0.6);
  assert.equal(g.screen, 'complete');
  assert.ok(g.burst);
  advance(g, 2);
  assert.equal(g.burst, null);
});
