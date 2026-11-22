import { useEffect, useRef } from 'react';
export function useControls(game) {
  const input = useRef({ x: 0, y: 0, z: 0, cameraYaw: 0 });
  useEffect(() => {
    const keys = new Set();
    const update = () => {
      input.current.x =
        Number(keys.has('KeyD') || keys.has('ArrowRight')) -
        Number(keys.has('KeyA') || keys.has('ArrowLeft'));
      input.current.z =
        Number(keys.has('KeyS') || keys.has('ArrowDown')) -
        Number(keys.has('KeyW') || keys.has('ArrowUp'));
      input.current.y =
        Number(keys.has('Space')) -
        Number(keys.has('ShiftLeft') || keys.has('ShiftRight'));
    };
    const down = (e) => {
      if (e.target.matches('input')) return;
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code,
        )
      )
        e.preventDefault();
      keys.add(e.code);
      update();
      if (!e.repeat && e.code === 'KeyE') game.action();
      if (!e.repeat && e.code === 'Escape') game.pause();
    };
    const up = (e) => {
      keys.delete(e.code);
      update();
    };
    const blur = () => {
      keys.clear();
      update();
      if (game.screen === 'playing') game.pause();
    };
    const move = (e) => {
      if (e.buttons === 1 && e.target.tagName === 'CANVAS')
        input.current.cameraYaw += e.movementX * 0.005;
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    window.addEventListener('pointermove', move);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      window.removeEventListener('pointermove', move);
    };
  }, [game]);
  return input;
}
