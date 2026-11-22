import './main-menu.css';
export default function MainMenu({ game, act, storageWarning }) {
  return (
    <div className="launch-screen">
      <header className="launch-header">
        <span className="launch-wordmark">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 8h8l3 6 3-6h8M5 24h8l3-6 3 6h8M8 5v6M24 5v6M8 21v6M24 21v6" />
          </svg>
          skydrop
        </span>
        <button onClick={() => act(() => game.navigate('settings'))}>
          Settings
        </button>
      </header>
      <main className="launch-copy">
        <span className="launch-kicker">A little flight. A little focus.</span>
        <h1>
          The city
          <br />
          is yours.
        </h1>
        <p>Every Delivery Is A Mission.</p>
        <button
          className="launch-play"
          onClick={() => act(() => game.start(Math.min(game.unlocked, 3)))}
        >
          Take flight <span aria-hidden="true">↗</span>
        </button>
        <nav aria-label="Game navigation">
          <button onClick={() => act(() => game.navigate('missions'))}>
            Missions
          </button>
          <button onClick={() => act(() => game.navigate('instructions'))}>
            How to fly
          </button>
        </nav>
      </main>
      <footer className="launch-footer">
        <span>
          {game.best > 0
            ? `Personal best · ${game.best} pts`
            : 'Three routes. Find your rhythm.'}
        </span>
        <button
          aria-label={game.muted ? 'Enable sound' : 'Mute sound'}
          onClick={() => act(() => (game.muted = !game.muted))}
        >
          <span
            className={`sound-bars ${game.muted ? 'silent' : ''}`}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
          </span>
          {game.muted ? 'Sound off' : 'Sound on'}
        </button>
      </footer>
      {storageWarning && (
        <p className="storage-warning">
          Progress cannot be saved in this browser.
        </p>
      )}
    </div>
  );
}
