// Template V3 Config
const GAME_INFO = {
  title: 'Template V3 — Multi‑Genre',
  subtitle: 'Boot/Preload/UI + InputAdapter',
};

const GAME_TYPE = 'shooter';

const DIFFICULTY = { playerSpeed: 200, playerLives: 3 };

const LEVELS = {
  shooter: [
    { name: 'Level 1', enemyCount: 8, enemySpeed: 60 },
    { name: 'Level 2', enemyCount: 10, enemySpeed: 80 },
  ]
};

function getGameConfigV3(){
  return { info: GAME_INFO, type: GAME_TYPE, difficulty: DIFFICULTY, levels: LEVELS[GAME_TYPE] };
}

