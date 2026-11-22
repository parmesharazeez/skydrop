import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
export default function Performance({ game }) {
  const { gl, setDpr } = useThree();
  const sample = useRef({
    frames: 0,
    seconds: 0,
    slow: 0,
    fast: 0,
    dpr: Math.min(window.devicePixelRatio, 1.5),
    warmup: 3,
  });
  useFrame((_, dt) => {
    const s = sample.current;
    if (document.hidden || dt > 0.25) return;
    if (s.warmup > 0) {
      s.warmup -= dt;
      return;
    }
    s.frames++;
    s.seconds += dt;
    if (s.seconds < 2) return;
    const fps = s.frames / s.seconds;
    game.performance = {
      fps: Math.round(fps),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      resolution: s.dpr,
    };
    if (game.screen === 'playing')
      game.flightPerformance = { ...game.performance };
    s.slow = fps < 48 ? s.slow + 1 : 0;
    s.fast = fps > 58 ? s.fast + 1 : 0;
    if (s.slow >= 2 && s.dpr > 0.8) {
      s.dpr = Math.max(0.8, s.dpr - 0.2);
      setDpr(s.dpr);
      s.slow = 0;
    }
    if (s.fast >= 5 && s.dpr < Math.min(window.devicePixelRatio, 1.5)) {
      s.dpr = Math.min(window.devicePixelRatio, 1.5, s.dpr + 0.1);
      setDpr(s.dpr);
      s.fast = 0;
    }
    s.frames = 0;
    s.seconds = 0;
  });
  return null;
}
