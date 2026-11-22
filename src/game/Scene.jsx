import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import Drone from './drone/Drone.jsx';
import DropIndicator from './world/DropIndicator.jsx';
import World, { Cargo, Burst } from './world/World.jsx';
const cameraGoal = new Vector3();
const lookGoal = new Vector3();
export default function Scene({ game, input, refresh }) {
  const elapsed = useRef(0);
  const preview = ['menu', 'missions', 'instructions', 'settings'].includes(
    game.screen,
  );
  useFrame(({ camera, clock }, dt) => {
    const steps = Math.max(1, Math.ceil(Math.min(dt, 0.25) / (1 / 60)));
    for (let step = 0; step < steps; step++)
      game.tick(Math.min(dt, 0.25) / steps, input.current);
    elapsed.current += dt;
    if (elapsed.current > 0.05) {
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
  return preview ? (
    <>
      <color attach="background" args={['#080e1c']} />
      <fog attach="fog" args={['#080e1c', 18, 65]} />
      <hemisphereLight args={['#e1f5ff', '#214065', 3]} />
      <directionalLight position={[5, 8, 4]} intensity={4} />
      <pointLight position={[-3, 0, 2]} color="#00e5ff" intensity={30} />
      <group position={[2, 0.5, 0]} scale={2}>
        <Drone game={game} preview />
      </group>
      <gridHelper
        args={[100, 60, '#244659', '#142735']}
        position={[0, -3, 0]}
      />
    </>
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
  );
}
