Template V3 (Phaser 3) — Modular, Multi‑Genre

Overview
- Modular scenes: BootScene, PreloadScene, UIScene, plus per‑genre scenes.
- InputAdapter merges keyboard + touch (optional on‑screen controls).
- TimerRegistry to safely track and clean up timers on transitions.
- Texture guards avoid duplicate‑key errors across restarts.

Folders
- core/: shared helpers (InputAdapter, TimerRegistry, SceneFlow)
- index.html: UI + on‑screen controls (mobile‑friendly)
- config.js: data‑driven config (game type, levels, theme)
- sprites.js: programmatic sprites (minimal set for template)
- engine_v3.js: scenes + game init

Run locally
- Serve the folder (any static server). Example: `npx http-server template_v3 -p 8999`
- Open http://localhost:8999

Extend
- Add new genres by creating a scene (e.g. StrategyScene) and wiring it in `engine_v3.js` selectScene().
- Add sprites in sprites.js and register via PreloadScene.ensureTexture().
- Put level curves and concepts in config.js.

