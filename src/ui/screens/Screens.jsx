import MainMenu from './MainMenu.jsx';
import { levels } from '../../game/levels/levels.js';
export default function Screens({ game, act, storageWarning }) {
  const go = (screen) => act(() => game.navigate(screen));
  const start = (id) => act(() => game.start(id));
  if (game.screen === 'playing') return null;
  if (game.screen === 'countdown')
    return (
      <div className="countdown">
        <span className="eyebrow">PREPARE FOR TAKEOFF</span>
        <strong>{Math.max(1, Math.ceil(game.countdown))}</strong>
        <p>{game.level.name}</p>
      </div>
    );
  if (game.screen === 'menu')
    return <MainMenu game={game} act={act} storageWarning={storageWarning} />;
  return (
    <div className="overlay">
      <section
        className={`glass dialog ${game.screen === 'missions' ? 'wide' : ''}`}
      >
        <span className="eyebrow">SKYDROP / FLIGHT CONTROL</span>
        {game.screen === 'missions' ? (
          <>
            <h2>Choose your mission.</h2>
            <p className="muted">
              Earn your clearance. Complete each route to unlock the next.
            </p>
            <div className="level-cards">
              {levels.map((level) => (
                <button
                  key={level.id}
                  disabled={level.id > game.unlocked}
                  className="level-card"
                  onClick={() => start(level.id)}
                >
                  <span className="level-number">0{level.id}</span>
                  <span className="eyebrow">{level.district}</span>
                  <h3>{level.name}</h3>
                  <p>{level.description}</p>
                  <div className="level-meta">
                    {level.routes.length} DROP{level.id > 1 ? 'S' : ''}{' '}
                    <span>{level.time} SEC</span>
                  </div>
                  <strong>
                    {level.id > game.unlocked
                      ? 'LOCKED · COMPLETE PREVIOUS'
                      : 'LAUNCH MISSION ↗'}
                  </strong>
                </button>
              ))}
            </div>
          </>
        ) : game.screen === 'instructions' ? (
          <>
            <h2>Your flight briefing.</h2>
            <p>
              Collect orange cargo. Deliver it to the matching numbered green
              target. Brake before releasing: cargo keeps some of your momentum.
            </p>
            <div className="control-grid">
              {[
                ['W A S D / ARROWS', 'Move across the island'],
                ['SPACE / SHIFT', 'Ascend / descend (2–28 m)'],
                ['E', 'Pick up or release cargo'],
                ['DRAG MOUSE', 'Orbit the follow camera'],
                ['ESC', 'Pause / resume'],
              ].map(([key, label]) => (
                <div key={key}>
                  <kbd>{key}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p>
              Hover within 3 m of a package and 2–4 m above its pad to collect
              it. A landing inside the target earns 100 points; accuracy ≥80%
              adds 50. Finish a drop in the first half of the timer for 25 more.
              Levels 2 and 3 add 25 and 50 per delivery.
            </p>
            <p className="muted">
              Collision −20 and 8% battery. Miss or wrong target −30; cargo
              returns to pickup. Mobile: joystick, altitude arrows, and Action.
              The radar numbers match your cargo.
            </p>
          </>
        ) : game.screen === 'settings' ? (
          <>
            <h2>Make it your airspace.</h2>
            {game.flightPerformance && (
              <p>
                Last flight sample: {game.flightPerformance.fps} fps ·{' '}
                {game.flightPerformance.drawCalls} draw calls
              </p>
            )}
            {game.performance && (
              <p className="performance-readout">
                Last render sample: {game.performance.fps} fps ·{' '}
                {game.performance.drawCalls} draw calls ·{' '}
                {game.performance.resolution.toFixed(1)}× resolution
                <br />
                <span className="muted">
                  Resolution adjusts automatically to keep flight smooth.
                </span>
              </p>
            )}
            <label className="volume-label">
              MASTER VOLUME <b>{Math.round(game.volume * 100)}%</b>
              <input
                aria-label="Master volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={game.volume}
                onChange={(e) =>
                  act(() => (game.volume = Number(e.target.value)))
                }
              />
            </label>
            <button
              className="secondary"
              onClick={() => act(() => (game.muted = !game.muted))}
            >
              {game.muted ? 'Unmute audio' : 'Mute audio'}
            </button>
            <p className="muted">
              All sounds are synthesized in your browser. Progress and settings
              are saved on this device.
            </p>
          </>
        ) : game.screen === 'paused' ? (
          <>
            <h2>Holding position.</h2>
            <p className="muted">
              Take a breath. Your delivery window is paused.
            </p>
            <button className="primary" onClick={() => go('playing')}>
              Resume flight →
            </button>
            <button className="secondary" onClick={() => start(game.level.id)}>
              Restart mission
            </button>
          </>
        ) : game.screen === 'complete' ? (
          <>
            <div className="stars">
              {'★'.repeat(game.stars)}
              <span>{'☆'.repeat(3 - game.stars)}</span>
            </div>
            <h2>Delivery complete.</h2>
            <p className="muted">
              {game.level.id < 3
                ? `Clearance granted. Mission 0${game.level.id + 1} unlocked.`
                : 'All routes cleared. The sky is yours.'}
            </p>
            <div className="results">
              <div>
                <span>SCORE</span>
                <strong>{game.score}</strong>
              </div>
              <div>
                <span>ACCURACY</span>
                <strong>{Math.round(game.accuracy)}%</strong>
              </div>
              <div>
                <span>TIME LEFT</span>
                <strong>{Math.ceil(game.time)}s</strong>
              </div>
            </div>
            {game.level.id < 3 && (
              <button
                className="primary"
                onClick={() => start(game.level.id + 1)}
              >
                Next mission ↗
              </button>
            )}
            <button className="secondary" onClick={() => start(game.level.id)}>
              Replay mission
            </button>
          </>
        ) : (
          <>
            <span className="failure-mark">!</span>
            <h2>Mission interrupted.</h2>
            <p>{game.reason}</p>
            <p className="muted">
              {game.completed} deliveries · {game.score} points
            </p>
            <button className="primary" onClick={() => start(game.level.id)}>
              Retry mission ↗
            </button>
          </>
        )}
        <button className="text-button" onClick={() => go('menu')}>
          ← Back to menu
        </button>
      </section>
    </div>
  );
}
