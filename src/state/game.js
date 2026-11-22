import { levels, clamp } from '../game/levels/levels.js';
import { advanceDrone } from '../game/drone/physics.js';
const distance = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
export function createGame(saved = {}) {
  const game = {
    screen: 'menu',
    level: levels[0],
    unlocked: clamp(Number(saved.unlocked) || 1, 1, 3),
    best: Number(saved.best) || 0,
    volume: clamp(Number(saved.volume ?? 0.45), 0, 1),
    muted: !!saved.muted,
    events: [],
    revision: 0,
    drone: { position: [0, 3, 16], velocity: [0, 0, 0] },
    packages: [],
    score: 0,
    time: 120,
    completed: 0,
    accuracy: 0,
    battery: 100,
    countdown: 3,
    collisionCooldown: 0,
    flash: 0,
    burst: null,
    toast: '',
    toastTime: 0,
    start(id) {
      if (id > this.unlocked || !levels[id - 1]) return;
      this.level = levels[id - 1];
      this.screen = 'countdown';
      this.countdown = 3;
      this.drone = { position: [...this.level.spawn], velocity: [0, 0, 0] };
      this.packages = this.level.routes.map((r, id) => ({
        id,
        position: [r.pickup[0], r.pickup[1] + 0.75, r.pickup[2]],
        velocity: [0, 0, 0],
        status: 'waiting',
      }));
      this.score = 0;
      this.time = this.level.time;
      this.completed = 0;
      this.accuracy = 0;
      this.battery = 100;
      this.collisions = 0;
      this.collisionCooldown = 0;
      this.flash = 0;
      this.burst = null;
      this.toast = '';
      this.toastTime = 0;
      this.events = ['countdown'];
      this.revision++;
    },
    navigate(screen) {
      this.screen = screen;
      this.revision++;
    },
    pause() {
      if (this.screen === 'playing') this.navigate('paused');
      else if (this.screen === 'paused') this.navigate('playing');
    },
    notify(message, event) {
      this.toast = message;
      this.toastTime = 2.5;
      if (event) this.events.push(event);
    },
    prompt() {
      const held = this.packages.find((p) => p.status === 'held');
      if (held) {
        const target = this.level.routes[held.id].target;
        return distance(this.drone.position, target) <= this.level.radius
          ? `E / ACTION · Release at target ${held.id + 1}`
          : `Carry package ${held.id + 1} to target ${held.id + 1}`;
      }
      const near = this.packages.find(
        (p) =>
          p.status === 'waiting' &&
          distance(p.position, this.drone.position) < 3 &&
          Math.abs(this.drone.position[1] - p.position[1] - 1.1) < 2,
      );
      return near
        ? 'E / ACTION · Pick up package'
        : this.packages.some((p) => p.status === 'falling')
          ? 'Package descending…'
          : 'Approach an orange pickup · descend to 2–4 m';
    },
    action() {
      if (this.screen !== 'playing') return;
      const held = this.packages.find((p) => p.status === 'held');
      if (held) {
        held.status = 'falling';
        held.velocity = [
          this.drone.velocity[0] * 0.4,
          0,
          this.drone.velocity[2] * 0.4,
        ];
        this.events.push('release');
        return;
      }
      const near = this.packages.find(
        (p) =>
          p.status === 'waiting' &&
          distance(p.position, this.drone.position) < 3 &&
          Math.abs(this.drone.position[1] - p.position[1] - 1.1) < 2,
      );
      if (near) {
        near.status = 'held';
        near.position = [
          this.drone.position[0],
          this.drone.position[1] - 1.1,
          this.drone.position[2],
        ];
        this.notify('Cargo secured. Follow the green beacon.', 'pickup');
      }
    },
    fail(reason) {
      this.reason = reason;
      this.screen = 'failed';
      this.events.push('failure');
      this.revision++;
    },
    tick(dt, input = { x: 0, y: 0, z: 0 }) {
      dt = Math.min(dt, 0.05);
      if (this.screen === 'countdown') {
        const before = Math.ceil(this.countdown);
        this.countdown -= dt;
        if (Math.ceil(this.countdown) !== before) this.events.push('countdown');
        if (this.countdown <= 0) this.navigate('playing');
        return;
      }
      if (this.burst && this.screen !== 'paused') {
        this.burst.age += dt;
        if (this.burst.age > 1.3) this.burst = null;
      }
      if (this.screen !== 'playing') return;
      this.time = Math.max(0, this.time - dt);
      this.toastTime = Math.max(0, this.toastTime - dt);
      this.flash = Math.max(0, this.flash - dt);
      this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
      if (this.time <= 0) {
        this.fail('Time expired. The delivery window has closed.');
        return;
      }
      this.battery = Math.max(
        0,
        this.battery - dt * (0.15 + Math.hypot(...this.drone.velocity) * 0.013),
      );
      if (this.battery <= 0) {
        this.fail('Battery depleted. Your drone needs a recharge.');
        return;
      }
      const platforms = this.level.routes
        .flatMap((r) => [r.pickup, r.target])
        .filter((p) => p[1] > 0)
        .map((p) => ({
          x: p[0],
          z: p[2],
          w: this.level.radius * 2,
          h: p[1] - 0.15,
          d: this.level.radius * 2,
        }));
      if (
        advanceDrone(this.drone, input, dt, [
          ...this.level.buildings,
          ...platforms,
        ]) &&
        this.collisionCooldown === 0
      ) {
        this.score -= 20;
        this.collisions++;
        this.collisionCooldown = 1.5;
        this.flash = 0.35;
        this.battery = Math.max(0, this.battery - 8);
        this.notify('Collision −20 · Watch your clearance', 'collision');
      }
      for (const cargo of this.packages) {
        if (cargo.status === 'held') {
          cargo.position = [
            this.drone.position[0],
            this.drone.position[1] - 1.1,
            this.drone.position[2],
          ];
          continue;
        }
        if (cargo.status !== 'falling') continue;
        const oldY = cargo.position[1];
        cargo.velocity[1] -= 14 * dt;
        cargo.position = cargo.position.map(
          (v, i) => v + cargo.velocity[i] * dt,
        );
        const route = this.level.routes[cargo.id];
        const surfaces = this.level.routes
          .flatMap((r) => [r.target, r.pickup])
          .filter(
            (p) =>
              distance(cargo.position, p) <= this.level.radius &&
              oldY >= p[1] + 0.45 &&
              cargo.position[1] <= p[1] + 0.45,
          );
        const roof = this.level.buildings.find(
          (b) =>
            Math.abs(cargo.position[0] - b.x) < b.w / 2 + 0.4 &&
            Math.abs(cargo.position[2] - b.z) < b.d / 2 + 0.4 &&
            oldY >= b.h &&
            cargo.position[1] <= b.h + 0.45,
        );
        if (!surfaces.length && cargo.position[1] > 0.45 && !roof) continue;
        const surface = surfaces.sort((a, b) => b[1] - a[1])[0];
        const error = distance(cargo.position, route.target);
        if (
          !roof &&
          error <= this.level.radius &&
          (surface ? surface[1] === route.target[1] : route.target[1] === 0)
        ) {
          cargo.status = 'delivered';
          cargo.position[1] = route.target[1] + 0.45;
          this.completed++;
          const accuracy = clamp(100 * (1 - error / this.level.radius), 0, 100);
          this.accuracy += accuracy;
          const points =
            100 +
            (accuracy >= 80 ? 50 : 0) +
            (this.time > this.level.time * 0.5 ? 25 : 0) +
            this.level.bonus;
          this.score += points;
          this.burst = { position: [...cargo.position], age: 0 };
          this.notify(
            `Delivered +${points} · ${Math.round(accuracy)}% accuracy`,
            'success',
          );
          if (this.completed === this.packages.length) {
            this.accuracy /= this.completed;
            this.stars =
              1 +
              Number(this.accuracy >= 65) +
              Number(
                this.accuracy >= 80 &&
                  this.time > this.level.time * 0.35 &&
                  this.collisions === 0,
              );
            this.best = Math.max(this.best, this.score);
            this.unlocked = Math.max(
              this.unlocked,
              Math.min(3, this.level.id + 1),
            );
            this.navigate('complete');
            this.events.push('victory');
          }
        } else {
          this.score -= 30;
          cargo.status = 'waiting';
          cargo.position = [
            route.pickup[0],
            route.pickup[1] + 0.75,
            route.pickup[2],
          ];
          cargo.velocity = [0, 0, 0];
          this.notify(
            'Missed / wrong target −30 · Cargo returned to pickup',
            'collision',
          );
        }
      }
    },
    save() {
      return {
        unlocked: this.unlocked,
        best: this.best,
        volume: this.volume,
        muted: this.muted,
      };
    },
  };
  return game;
}
export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem('skydrop-v1')) || {};
  } catch {
    return {};
  }
}
export function persistProgress(game) {
  try {
    localStorage.setItem('skydrop-v1', JSON.stringify(game.save()));
    return true;
  } catch {
    return false;
  }
}
