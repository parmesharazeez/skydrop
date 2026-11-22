import { useEffect, useState } from 'react';
export function Score({ value }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const timer = setInterval(
      () =>
        setDisplay((old) =>
          Math.abs(value - old) < 2
            ? value
            : old +
              Math.sign(value - old) *
                Math.max(1, Math.ceil(Math.abs(value - old) * 0.25)),
        ),
      30,
    );
    return () => clearInterval(timer);
  }, [value]);
  return <>{String(display).padStart(4, '0')}</>;
}
const mapPoint = (p) => ({
  left: `${((p[0] + 36) / 72) * 100}%`,
  top: `${((p[2] + 36) / 72) * 100}%`,
});
export default function HUD({ game, onPause }) {
  const held = game.packages.find((p) => p.status === 'held');
  const seconds = Math.ceil(game.time);
  const speed = Math.hypot(...game.drone.velocity);
  return (
    <div className="hud">
      <div className="hud-top">
        <section className="glass mission">
          <span className="eyebrow">
            MISSION 0{game.level.id} <i>LIVE</i>
          </span>
          <h3>{game.level.name}</h3>
          <p>
            <b>{game.completed}</b> / {game.packages.length} deliveries{' '}
            <span className="muted">• LEVEL {game.level.id}</span>
          </p>
          <div className="progress">
            <span
              style={{
                width: `${(game.completed / game.packages.length) * 100}%`,
              }}
            />
          </div>
        </section>
        <section className={`glass timer ${seconds < 20 ? 'urgent' : ''}`}>
          <span className="eyebrow">DELIVERY WINDOW</span>
          <strong>
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </strong>
          <span className="live-dot">
            {game.screen === 'paused' ? 'FLIGHT PAUSED' : 'SYSTEMS ONLINE'}
          </span>
        </section>
        <section className="glass score">
          <span className="eyebrow">MISSION SCORE</span>
          <strong>
            <Score value={game.score} />
          </strong>
          <span className="muted">PERSONAL BEST {game.best}</span>
          <button
            className="pause-button"
            onClick={onPause}
            aria-label="Pause game"
          >
            Ⅱ
          </button>
        </section>
      </div>
      <div className="crosshair">
        <span />
        <span />
      </div>
      <div className="hud-bottom">
        <section className="glass radar-panel">
          <span className="eyebrow">
            ISLAND RADAR <span>N ↑</span>
          </span>
          <div className="radar">
            {game.level.buildings.map((b, i) => (
              <span
                key={i}
                className="map-building"
                style={{
                  ...mapPoint([b.x, 0, b.z]),
                  width: `${(b.w / 72) * 100}%`,
                  height: `${(b.d / 72) * 100}%`,
                }}
              />
            ))}
            {game.level.routes.map((r, i) => (
              <span key={i} className="map-target" style={mapPoint(r.target)}>
                {i + 1}
              </span>
            ))}
            {game.packages
              .filter((p) => p.status !== 'delivered')
              .map((p) => (
                <span
                  key={p.id}
                  className="map-cargo"
                  style={mapPoint(p.position)}
                />
              ))}
            <span className="map-drone" style={mapPoint(game.drone.position)}>
              ▲
            </span>
          </div>
          <p>
            <span className="orange">■ Pickup</span>
            <span className="green">◎ Drop</span>
            <span>▲ You</span>
          </p>
        </section>
        <section className="flight-prompt">
          <div className="glass prompt">
            {game.toastTime > 0 ? (
              <span className="green">{game.toast}</span>
            ) : (
              game.prompt()
            )}
          </div>
          <div className="cargo-pill">
            <span className={held ? 'orange' : 'cyan'}>◇</span>{' '}
            {held ? `CARGO ${held.id + 1} SECURED` : 'CARGO CLAMP EMPTY'}{' '}
            <span className="muted">· E TO INTERACT</span>
          </div>
        </section>
        <section className="glass telemetry">
          <span className="eyebrow">FLIGHT TELEMETRY</span>
          <div>
            <span>BATTERY</span>
            <b className={game.battery < 25 ? 'orange' : 'green'}>
              {Math.ceil(game.battery)}%
            </b>
          </div>
          <div className="progress">
            <span style={{ width: `${game.battery}%` }} />
          </div>
          <div>
            <span>ALTITUDE</span>
            <b>
              {game.drone.position[1].toFixed(1)} <small>m</small>
            </b>
          </div>
          <div>
            <span>SPEED</span>
            <b>
              {speed.toFixed(1)} <small>m/s</small>
            </b>
          </div>
          <span className="muted desktop-hint">
            WASD MOVE · SPACE / SHIFT ALTITUDE
          </span>
        </section>
      </div>
      {game.flash > 0 && <div className="collision-flash" />}
    </div>
  );
}
