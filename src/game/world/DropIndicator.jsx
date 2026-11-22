import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
export default function DropIndicator({ game }) {
  const marker = useRef();
  useFrame(() => {
    const held = game.packages.find((cargo) => cargo.status === 'held');
    marker.current.visible = !!held;
    if (!held) return;
    const target = game.level.routes[held.id].target;
    const p = game.drone.position;
    const inRange =
      Math.hypot(p[0] - target[0], p[2] - target[2]) <= game.level.radius;
    marker.current.position.set(p[0], (inRange ? target[1] : 0) + 0.12, p[2]);
    marker.current.material.color.set(inRange ? '#39f59b' : '#ffb547');
  });
  return (
    <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.7, 0.82, 32]} />
      <meshBasicMaterial
        color="#ffb547"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </mesh>
  );
}
