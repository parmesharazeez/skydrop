import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  trees,
  unitBox,
  wallMaterial,
  roofMaterial,
  windowMaterial,
  warmWindowMaterial,
} from './resources.js';
function Building({ building: b }) {
  return (
    <group position={[b.x, 0, b.z]} dispose={null}>
      <mesh
        position={[0, b.h / 2, 0]}
        scale={[b.w, b.h, b.d]}
        geometry={unitBox}
        material={wallMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        position={[0, b.h + 0.15, 0]}
        scale={[b.w + 0.3, 0.3, b.d + 0.3]}
        geometry={unitBox}
        material={roofMaterial}
      />
      {Array.from({ length: Math.floor(b.h / 2) }, (_, i) => (
        <group key={i} position={[0, 1.5 + i * 2, 0]}>
          <mesh
            position={[0, 0, b.d / 2 + 0.02]}
            scale={[b.w * 0.8, 0.18, 0.04]}
            geometry={unitBox}
            material={i % 3 ? windowMaterial : warmWindowMaterial}
          />
          <mesh
            position={[b.w / 2 + 0.02, 0, 0]}
            scale={[0.04, 0.18, b.d * 0.8]}
            geometry={unitBox}
            material={windowMaterial}
          />
        </group>
      ))}
    </group>
  );
}
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
      <fog attach="fog" args={['#354865', 55, 150]} />
      <hemisphereLight args={['#b9ddff', '#455369', 2.3]} />
      <directionalLight
        position={[-25, 40, 15]}
        intensity={3.5}
        color="#ffd5ac"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-normalBias={0.06}
      />
      <mesh position={[0, -3, 0]} receiveShadow>
        <cylinderGeometry args={[51, 44, 6, 8]} />
        <meshStandardMaterial color="#243f4c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[49, 8]} />
        <meshStandardMaterial color="#486469" roughness={1} />
      </mesh>
      <gridHelper
        args={[90, 30, '#50747a', '#3e5c64']}
        position={[0, 0.02, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          color="#183349"
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      {level.buildings.map((b, i) => (
        <Building key={i} building={b} />
      ))}
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 2, 6]} />
            <meshStandardMaterial color="#6d6662" />
          </mesh>
          <mesh position={[0, 2.8, 0]} castShadow>
            <coneGeometry args={[1.1, 3.6, 7]} />
            <meshStandardMaterial color="#2b776f" />
          </mesh>
        </group>
      ))}
      {level.routes.map((r, i) => (
        <group key={i}>
          <Pad position={r.pickup} radius={2.5} color="#ffb547" />
          <Pad position={r.target} radius={level.radius} color="#39f59b" />
        </group>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 3) * 110,
            36 + (i % 3) * 6,
            Math.cos(i * 3) * 110,
          ]}
          scale={[15, 2, 5]}
        >
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="#b2a7b3" transparent opacity={0.25} />
        </mesh>
      ))}
      <mesh position={[-100, 35, -140]}>
        <sphereGeometry args={[14, 32, 20]} />
        <meshBasicMaterial color="#ffcb9d" />
      </mesh>
    </>
  );
}

export default memo(World);
