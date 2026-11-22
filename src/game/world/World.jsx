import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Architecture from './Architecture.jsx';
import Atmosphere, { Water } from '../rendering/Atmosphere.jsx';
function Pad({ position, color, radius }) {
  const ring = useRef();
  useFrame(({ clock }) => {
    ring.current.material.opacity =
      0.55 + Math.sin(clock.elapsedTime * 2) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 0.6, radius + 0.8, 0.3, 40]} />
        <meshStandardMaterial color="#203c4c" />
      </mesh>
      {position[1] > 0 && (
        <mesh position={[0, -position[1] / 2, 0]}>
          <cylinderGeometry args={[radius, radius, position[1], 12]} />
          <meshStandardMaterial color="#314658" />
        </mesh>
      )}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[radius - 0.16, radius, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[0.5, 0.6, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (radius + 0.4), 0.8, 0]}>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[radius * 0.6, radius, 6, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.035}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
export function Cargo({ cargo }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.position.set(...cargo.position);
    ref.current.visible = cargo.status !== 'delivered';
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#d99649" />
      </mesh>
      <mesh>
        <boxGeometry args={[0.83, 0.83, 0.12]} />
        <meshStandardMaterial color="#ffe2a2" />
      </mesh>
      <mesh position={[0, 0.1, 0.41]}>
        <planeGeometry args={[0.35, 0.25]} />
        <meshBasicMaterial color="#f5f8ff" />
      </mesh>
    </group>
  );
}
export function Burst({ game }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.visible = !!game.burst;
    if (!game.burst) return;
    ref.current.position.set(...game.burst.position);
    ref.current.children.forEach((p, i) => {
      const a = i * 2.4,
        t = game.burst.age;
      p.position.set(
        Math.sin(a) * t * 6,
        t * 5 - t * t * 4,
        Math.cos(a) * t * 6,
      );
      p.scale.setScalar(Math.max(0, 1 - t / 1.3));
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.12]} />
          <meshBasicMaterial color={i % 2 ? '#39f59b' : '#ffb547'} />
        </mesh>
      ))}
    </group>
  );
}
function World({ level }) {
  return (
    <>
      <color attach="background" args={['#192d49']} />
      <fog attach="fog" args={['#59646d', 65, 210]} />
      <hemisphereLight args={['#bdcddd', '#3b4d4c', 1.5]} />
      <directionalLight
        position={[-25, 40, 15]}
        intensity={2.8}
        color="#ffd5ac"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-normalBias={0.15}
        shadow-bias={-0.0003}
        shadow-camera-near={1}
        shadow-camera-far={100}
      />
      <mesh position={[0, -3.12, 0]} receiveShadow>
        <cylinderGeometry args={[51, 44, 6, 8]} />
        <meshStandardMaterial color="#243f4c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[49, 8]} />
        <meshStandardMaterial color="#52655d" roughness={1} />
      </mesh>
      <Architecture level={level} />
      <Water />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[side * 11, 0.025, 0]}
            receiveShadow
          >
            <planeGeometry args={[5, 76]} />
            <meshStandardMaterial color="#283c43" roughness={0.95} />
          </mesh>
          <mesh position={[side * 13.7, 0.12, 0]}>
            <boxGeometry args={[0.2, 0.2, 76]} />
            <meshStandardMaterial color="#89958d" />
          </mesh>
        </group>
      ))}
      {level.routes.map((r, i) => (
        <group key={i}>
          <Pad position={r.pickup} radius={2.5} color="#ffb547" />
          <Pad position={r.target} radius={level.radius} color="#39f59b" />
        </group>
      ))}
      <Atmosphere />
    </>
  );
}
export default memo(World);
