import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import Drone from './drone/Drone.jsx';
import Studio, { Reflections } from './rendering/Studio.jsx';
import Performance from './rendering/Performance.jsx';
import DropIndicator from './world/DropIndicator.jsx';
import World, { Cargo, Burst } from './world/World.jsx';
const cameraGoal = new Vector3();
const lookGoal = new Vector3();
export default function Scene({ game, input, refresh }) {
  const elapsed = useRef(0);
  const previousScreen = useRef(game.screen);
  const preview = ['menu', 'missions', 'instructions', 'settings'].includes(
    game.screen,
  );
  useFrame(({ camera, clock }, dt) => {
    const steps = Math.max(1, Math.ceil(Math.min(dt, 0.25) / (1 / 60)));
    for (let step = 0; step < steps; step++)
      game.tick(Math.min(dt, 0.25) / steps, input.current);
    elapsed.current += dt;
    if (
      game.screen !== previousScreen.current ||
      game.events.length ||
      (elapsed.current > 0.08 && ['playing', 'countdown'].includes(game.screen))
    ) {
      previousScreen.current = game.screen;
      refresh();
      elapsed.current = 0;
    }
    if (preview) {
      cameraGoal.set(9, 6, 11);
      lookGoal.set(-1, 0, 0);
    } else {
      const p = game.drone.position;
      const yaw = input.current.cameraYaw || 0;
      cameraGoal.set(
        p[0] + Math.sin(yaw) * 13,
        p[1] + 8,
        p[2] + Math.cos(yaw) * 13,
      );
      lookGoal.set(p[0], p[1], p[2] - 1);
    }
    camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 4));
    camera.lookAt(lookGoal);
    if (preview) camera.position.y += Math.sin(clock.elapsedTime * 0.4) * 0.003;
  });
  return (
    <>
      <Reflections />
      <Performance game={game} />
      {preview ? (
        <Studio game={game} />
      ) : (
        <>
          <World level={game.level} />
          <Drone game={game} />
          {game.packages.map((cargo) => (
            <Cargo key={`${game.level.id}-${cargo.id}`} cargo={cargo} />
          ))}
          <Burst game={game} />
          <DropIndicator game={game} />
        </>
      )}
    </>
  );
}
