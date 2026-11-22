import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
function Rotor({ x, z }) {
  const rotor = useRef();
  useFrame((_, dt) => {
    rotor.current.rotation.y += dt * 65;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.64, 0.045, 8, 28]} />
        <meshStandardMaterial
          color="#7894a6"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.13, 0.16, 0.25, 12]} />
        <meshStandardMaterial color="#172534" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
        <circleGeometry args={[0.56, 32]} />
        <meshBasicMaterial
          color="#c1d7e1"
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
      <group ref={rotor} position={[0, 0.17, 0]}>
        <mesh>
          <boxGeometry args={[1.12, 0.035, 0.12]} />
          <meshStandardMaterial color="#a9bec8" transparent opacity={0.48} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.12, 0.035, 0.12]} />
          <meshStandardMaterial color="#a9bec8" transparent opacity={0.48} />
        </mesh>
      </group>
      <mesh position={[0, -0.17, 0]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshBasicMaterial color={z < 0 ? '#00e5ff' : '#39f59b'} />
      </mesh>
    </group>
  );
}
export default function Drone({ game, preview = false }) {
  const drone = useRef();
  useFrame(({ clock }, dt) => {
    const g = drone.current;
    if (preview) {
      g.position.set(0, 0.15 * Math.sin(clock.elapsedTime * 1.5), 0);
      g.rotation.y = 0.3 + Math.sin(clock.elapsedTime * 0.25) * 0.3;
    } else {
      g.position.set(...game.drone.position);
      g.rotation.z +=
        (-game.drone.velocity[0] * 0.025 - g.rotation.z) * Math.min(1, dt * 9);
      g.rotation.x +=
        (game.drone.velocity[2] * 0.025 - g.rotation.x) * Math.min(1, dt * 9);
    }
  });
  return (
    <group ref={drone}>
      <mesh position={[0, 0.055, -0.61]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.035, 8, 24]} />
        <meshStandardMaterial
          color="#111e29"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.4, 0.12, 0]}>
          {[-0.2, 0, 0.2].map((z) => (
            <mesh key={z} position={[0, 0, z]} rotation={[0, 0, side * 0.35]}>
              <boxGeometry args={[0.13, 0.04, 0.065]} />
              <meshStandardMaterial color="#344955" />
            </mesh>
          ))}
        </group>
      ))}

      <mesh castShadow scale={[0.78, 0.32, 1]}>
        <sphereGeometry args={[0.7, 24, 16]} />
        <meshStandardMaterial
          color="#e2e8e5"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.23, -0.12]} scale={[0.75, 0.3, 1]}>
        <sphereGeometry args={[0.42, 20, 12]} />
        <meshStandardMaterial
          color="#0d3347"
          metalness={0.75}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.1, -0.64]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}${z}`}>
            <mesh
              position={[x * 0.6, 0, z * 0.6]}
              rotation={[0, (-x * z * Math.PI) / 4, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.07, 0.11, 1.65, 8]} />
              <meshStandardMaterial color="#506674" metalness={0.8} />
            </mesh>
            <Rotor x={x * 1.15} z={z * 1.15} />
          </group>
        )),
      )}
      {[-1, 1].map((x) => (
        <group key={x}>
          <mesh position={[x * 0.32, -0.47, 0]} rotation={[0, 0, x * 0.2]}>
            <boxGeometry args={[0.07, 0.6, 0.09]} />
            <meshStandardMaterial color="#aec5cd" />
          </mesh>
          <mesh position={[x * 0.23, -0.75, 0]}>
            <boxGeometry args={[0.24, 0.07, 0.1]} />
            <meshStandardMaterial color="#ffb547" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
