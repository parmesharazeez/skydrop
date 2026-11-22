import { BoxGeometry, MeshBasicMaterial, MeshStandardMaterial } from 'three';
export const unitBox = new BoxGeometry(1, 1, 1);
export const wallMaterial = new MeshStandardMaterial({
  color: '#243c51',
  metalness: 0.35,
  roughness: 0.55,
});
export const roofMaterial = new MeshStandardMaterial({ color: '#7d9caa' });
export const windowMaterial = new MeshBasicMaterial({ color: '#74aec2' });
export const warmWindowMaterial = new MeshBasicMaterial({ color: '#ffb547' });
export const trees = Array.from({ length: 18 }, (_, i) => [
  Math.sin(i * 2.4) * 29,
  Math.cos(i * 2.4) * 29,
]);
