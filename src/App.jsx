import { PCFShadowMap } from 'three';
import { Component, Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './game/Scene.jsx';
import { createGame, loadProgress, persistProgress } from './state/game.js';
import { useControls } from './game/drone/useControls.js';
import { audio } from './audio/audio.js';
import HUD from './ui/hud/HUD.jsx';
import MobileControls from './ui/hud/MobileControls.jsx';
import Screens from './ui/screens/Screens.jsx';
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="error-screen">
        <h1>Flight systems unavailable.</h1>
        <p>
          SKYDROP needs WebGL. Enable hardware acceleration or try another
          browser.
        </p>
        <button onClick={() => location.reload()}>Reload game</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [game] = useState(() => createGame(loadProgress()));
  const [, render] = useState(0);
  const [loading, setLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState(false);
  const lastSave = useRef('');
  const input = useControls(game);
  const refresh = useCallback(() => {
    audio.update(game);
    for (const event of game.events.splice(0)) audio.play(event);
    const save = JSON.stringify(game.save());
    if (lastSave.current !== save) {
      setStorageWarning(!persistProgress(game));
      lastSave.current = save;
    }
    render((n) => n + 1);
  }, [game]);
  const act = (fn) => {
    audio.start();
    audio.update(game);
    audio.play('click');
    fn();
    refresh();
  };
  const inFlight = [
    'playing',
    'paused',
    'countdown',
    'complete',
    'failed',
  ].includes(game.screen);
  return (
    <ErrorBoundary>
      <div
        className="app"
        onPointerDown={() => audio.start()}
        onPointerOver={(event) => {
          if (
            event.target.closest('button') &&
            event.target.closest('button') !==
              event.relatedTarget?.closest?.('button')
          )
            audio.play('hover');
        }}
      >
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [9, 6, 11], fov: 48, near: 0.1, far: 500 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            setLoading(false);
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              game.reason =
                'Graphics context lost. Reload the page to restore flight.';
              game.navigate('failed');
              refresh();
            });
          }}
        >
          <Suspense fallback={null}>
            <Scene game={game} input={input} refresh={refresh} />
          </Suspense>
        </Canvas>
        <div className="vignette" />
        {inFlight && (
          <HUD game={game} onPause={() => act(() => game.pause())} />
        )}
        <Screens game={game} act={act} storageWarning={storageWarning} />
        {game.screen === 'playing' && (
          <MobileControls input={input} game={game} />
        )}
        <div className="sr-only" role="status" aria-live="polite">
          {game.screen === 'playing' ? game.toast : game.screen}
        </div>
        {loading && (
          <div className="loading">
            <span className="brand-icon">✣</span> INITIALIZING FLIGHT SYSTEMS
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
