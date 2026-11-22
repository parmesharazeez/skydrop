import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, Color } from 'three';
import { trees } from './resources.js';
function Instances({
  items,
  shape = 'box',
  roughness = 0.65,
  metalness = 0.15,
  emissive = false,
  shadow = false,
}) {
  const mesh = useRef();
  useLayoutEffect(() => {
    const transform = new Object3D();
    items.forEach((item, i) => {
      transform.position.set(...item.position);
      transform.scale.set(...item.scale);
      transform.updateMatrix();
      mesh.current.setMatrixAt(i, transform.matrix);
      mesh.current.setColorAt(i, new Color(item.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={mesh}
      args={[null, null, items.length]}
      castShadow={shadow}
      receiveShadow
    >
      {shape === 'cone' ? (
        <coneGeometry args={[1, 1, 8]} />
      ) : shape === 'trunk' ? (
        <cylinderGeometry args={[1, 1, 1, 6]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      {emissive ? (
        <meshBasicMaterial />
      ) : (
        <meshStandardMaterial roughness={roughness} metalness={metalness} />
      )}
    </instancedMesh>
  );
}
export default function Architecture({ level }) {
  const batches = useMemo(() => {
    const walls = [],
      windows = [],
      trunks = [],
      leaves = [];
    for (const [index, b] of level.buildings.entries()) {
      walls.push(
        {
          position: [b.x, b.h / 2, b.z],
          scale: [b.w, b.h, b.d],
          color: index % 2 ? '#344b5b' : '#293d4b',
        },
        {
          position: [b.x, b.h + 0.12, b.z],
          scale: [b.w + 0.3, 0.24, b.d + 0.3],
          color: '#7e8e94',
        },
        {
          position: [b.x + 0.6, b.h + 0.6, b.z],
          scale: [b.w * 0.35, 1, b.d * 0.4],
          color: '#3a4b56',
        },
      );
      for (let y = 1.4; y < b.h; y += 1.7) {
        for (let x = -b.w / 2 + 0.65; x < b.w / 2 - 0.3; x += 1.2) {
          for (const side of [-1, 1])
            windows.push({
              position: [b.x + x, y, b.z + side * (b.d / 2 + 0.015)],
              scale: [0.55, 0.7, 0.025],
              color:
                Math.sin(x * 19 + y * 7 + index) > 0 ? '#b7a78b' : '#425a68',
            });
        }
        for (let z = -b.d / 2 + 0.65; z < b.d / 2 - 0.3; z += 1.2) {
          for (const side of [-1, 1])
            windows.push({
              position: [b.x + side * (b.w / 2 + 0.015), y, b.z + z],
              scale: [0.025, 0.7, 0.55],
              color: Math.sin(z * 17 + y * 3) > 0 ? '#91a9ae' : '#405564',
            });
        }
      }
    }
    for (const [x, z] of trees) {
      trunks.push({
        position: [x, 1, z],
        scale: [0.18, 2, 0.18],
        color: '#5b5148',
      });
      for (let layer = 0; layer < 3; layer++)
        leaves.push({
          position: [x, 2 + layer * 0.65, z],
          scale: [1.25 - layer * 0.23, 2, 1.25 - layer * 0.23],
          color: layer % 2 ? '#42695e' : '#33594e',
        });
    }
    return { walls, windows, trunks, leaves };
  }, [level]);
  return (
    <>
      <Instances items={batches.walls} shadow />
      <Instances items={batches.windows} emissive />
      <Instances items={batches.trunks} shape="trunk" />
      <Instances items={batches.leaves} shape="cone" shadow />
    </>
  );
}
