import { useState } from 'react';
export default function MobileControls({ input, game }) {
  const [stick, setStick] = useState([0, 0]);
  const release = () => {
    input.current.x = 0;
    input.current.z = 0;
    setStick([0, 0]);
  };
  const move = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - r.left - r.width / 2) / 40,
      z = (e.clientY - r.top - r.height / 2) / 40;
    const length = Math.max(1, Math.hypot(x, z));
    x /= length;
    z /= length;
    input.current.x = x;
    input.current.z = z;
    setStick([x * 32, z * 32]);
  };
  return (
    <div className="mobile-controls">
      <div
        className="joystick"
        role="slider"
        aria-label="Flight joystick"
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={stick[0] / 32}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span style={{ transform: `translate(${stick[0]}px,${stick[1]}px)` }} />
      </div>
      <div className="mobile-actions">
        {[1, -1].map((direction) => (
          <button
            key={direction}
            aria-label={direction === 1 ? 'Ascend' : 'Descend'}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              input.current.y = direction;
            }}
            onPointerUp={() => (input.current.y = 0)}
            onPointerCancel={() => (input.current.y = 0)}
            onLostPointerCapture={() => (input.current.y = 0)}
          >
            {direction === 1 ? '↑' : '↓'}
          </button>
        ))}
        <button className="action" onClick={() => game.action()}>
          ACTION
        </button>
      </div>
    </div>
  );
}
