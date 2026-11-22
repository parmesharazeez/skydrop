# SKYDROP

SKYDROP is a browser drone game about collecting packages and landing them on the right target before time runs out.

> Screenshot placeholder: a flight over the dusk island with a package attached and the green delivery pad ahead.

## Run

Use Node.js 22.12 or newer. From this folder:

```sh
npm install && npm run dev
```

Open the local URL printed by Vite (port 3000 by default). No server account, API key, remote fonts, models, textures, or audio files are needed. The npm packages are the only installation downloads.

```sh
npm test        # flight physics and mission simulations
npm run lint    # ESLint and Prettier check
npm run format  # apply formatting
npm run build   # production output in dist/
```

## Controls

| Input                   | Action                       |
| ----------------------- | ---------------------------- |
| WASD or arrow keys      | Move along the island's axes |
| Space                   | Ascend                       |
| Shift                   | Descend                      |
| E                       | Pick up or release a package |
| Drag on the game canvas | Orbit the follow camera      |
| Escape                  | Pause or resume flight       |
| Touch joystick          | Move                         |
| Touch up/down buttons   | Change altitude              |
| Action button           | Pick up or release           |

Start near the orange pickup station. Stay within 3 m horizontally and about 2–4 m above the pad, then press E. The package attaches beneath the drone. Match its number to a green target on the radar, brake, and release. An orange or green ring below the drone marks the drop position. It does not predict sideways drift.

## Flight and delivery

Velocity approaches the requested speed with exponential acceleration and drag. Releasing movement keys brakes the drone quickly. Horizontal speed tops out at 12 m/s, climb speed at 7 m/s, and altitude stays between 2 and 28 m. Rendering and the HUD read the same simulation. Long frames are subdivided, with a 250 ms cap to avoid large jumps after a stall.

The collision system expands building and platform bounds around the drone. A hit rejects the movement and reverses some velocity. Held cargo follows a fixed clamp offset; released cargo retains 40% of horizontal velocity and falls under gravity. Landing checks compare the package's horizontal distance from its assigned pad center, at that pad's height. A miss, roof hit, or wrong target returns the package to its pickup station.

Accuracy is `100 × (1 − distance / pad radius)`, clamped to 0–100. A delivery earns 100, accuracy of at least 80% adds 50, and landing before half the mission timer has elapsed adds 25. Urban Courier adds 25 per delivery; Extreme Delivery adds 50. Collisions cost 20 points and 8% battery. A missed delivery costs 30. Scores can be negative.

Finishing earns one star. Average accuracy of at least 65% earns a second; at least 80%, no collisions, and more than 35% time remaining earns a third. The next mission unlocks on completion. Best completed-mission score, unlocks, volume, and mute state persist in localStorage. Failed storage writes show a warning on the menu.

## Layout

- `src/game/drone`: model, movement, keyboard and camera input.
- `src/game/world`: island, pads, cargo visuals, particles and shared render resources.
- `src/game/levels`: three route layouts.
- `src/state`: mission simulation and persistence.
- `src/ui`: menus, results, HUD and touch controls.
- `src/audio`: Web Audio oscillators and generated wind noise.
- `tests`: physics, delivery edge cases and input-driven flights through all missions.

## Verification and limitations

Nine automated tests cover pickup, falling release, scoring, misses, wrong targets, collisions, pause, timeout, retry, stars, elevated pads, and persisted unlocks. An input-driven test flies every route through all three levels without relocating the drone. ESLint, Prettier, and the production build pass.

The revised menu and world were checked in the running browser. A keyboard flight picked up cargo, delivered it, and unlocked mission 2. The menu reached 60 fps at 1.5× resolution with 46 draw calls; Urban Courier sampled 60 fps with 68 draw calls. These are short session samples, not guarantees across devices. Browser checks also covered pause and timer expiry. Mobile-device testing and audible output quality remain unverified. Settings displays recent rendering samples.

The drone uses arcade physics, without aerodynamics or a swinging cargo joint. Trees are scenery; buildings and elevated platforms have collision bounds. The follow camera can pass through scenery. Sky, clouds, and water are stylized geometry without volumetric effects. Rendering adjusts device pixel ratio between 0.8 and 1.5 based on sustained frame rate, uses a 1024 px shadow map, and limits delivery bursts to 24 particles. Buildings, facade windows, trunks, and foliage use four instanced draw batches. The menu does not repeatedly update React while idle. Reflections come from a locally generated environment map. The Three.js bundle triggers Vite's size warning; it is about 324 kB gzipped before hosting compression settings.

A hidden or unfocused tab pauses active flight. Browser performance stalls longer than 250 ms slow simulation time rather than causing a large jump. Progress is local to the browser origin and is not synchronized across devices.

The requested humanizer command was a placeholder. `humanizer scan . --fail-above 25` could not run because the executable is not installed. No humanizer score or pass is claimed.
