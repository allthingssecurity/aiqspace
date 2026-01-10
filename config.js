/**
 * GAME CONFIGURATION
 * ==================
 * Change GAME_TYPE to switch between different game genres!
 * Customize theme, difficulty, and levels below.
 */

// ============================================
// GAME TYPE - Change this to switch game genre
// ============================================
// Options: 'maze', 'runner', 'shooter', 'strategy'
const GAME_TYPE = 'shooter';

// ============================================
// GAME INFO
// ============================================
const GAME_INFO = {
    title: 'AIQNex: Space Expedition',
    subtitle: 'Pilot the rocket AIQNex through the cosmos',
    author: 'Codex Games',
    version: '1.0'
};

// ============================================
// THEME CONFIGURATION
// ============================================
const THEME = {
    // Color Palette
    colors: {
        primary: '#00e5ff',      // Neon cyan - main accent (space)
        secondary: '#ffd700',    // Gold - stars/highlights
        success: '#22c55e',      // Green - positive
        danger: '#ef4444',       // Red - negative/enemies
        background: '#05070f',   // Deep space background
        floor: '#0b1020',        // Space floor tile base
        wall: '#0f1a2e',         // Dark wall (unused in shooter)
        text: '#ffffff'          // White text
    },

    // Player appearance
    player: {
        bodyColor: '#a0b3c6',    // Light steel (spacesuit/rocket-like)
        skinColor: '#d6d0c8',    // Neutral
        hairColor: '#1f2937',    // Dark
        shoeColor: '#6b7280'     // Gray
    },

    // Enemy appearance
    enemy: {
        bodyColor: '#2d3748',    // Dark gray
        accentColor: '#ff0000',  // Red glow
        eyeColor: '#ff0000'      // Red
    }
};

// ============================================
// DIFFICULTY SETTINGS
// ============================================
const DIFFICULTY = {
    easy: {
        playerSpeed: 220,
        playerHealth: 150,
        playerLives: 5,
        enemySpeed: 50,
        enemyDamage: 10,
        enemyCount: 4
    },
    normal: {
        playerSpeed: 200,
        playerHealth: 100,
        playerLives: 3,
        enemySpeed: 70,
        enemyDamage: 20,
        enemyCount: 6
    },
    hard: {
        playerSpeed: 180,
        playerHealth: 75,
        playerLives: 2,
        enemySpeed: 100,
        enemyDamage: 30,
        enemyCount: 10
    }
};

// Current difficulty
const CURRENT_DIFFICULTY = 'normal';

// ============================================
// GAME-SPECIFIC SETTINGS
// ============================================

// MAZE GAME SETTINGS
const MAZE_CONFIG = {
    tileSize: 32,
    collectibleScale: 0.15,
    collectibles: [
        { name: "COIN", title: "Gold Coin", desc: "Shiny gold coin worth 100 points!" },
        { name: "GEM", title: "Crystal Gem", desc: "A precious gem worth 500 points!" },
        { name: "KEY", title: "Magic Key", desc: "Opens secret passages!" },
        { name: "STAR", title: "Power Star", desc: "Grants temporary invincibility!" },
        { name: "HEART", title: "Health Heart", desc: "Restores 25 health points!" },
        { name: "CHEST", title: "Treasure Chest", desc: "Contains bonus rewards!" }
    ]
};

// RUNNER GAME SETTINGS
const RUNNER_CONFIG = {
    gravity: 800,
    jumpForce: -400,
    groundSpeed: 300,
    speedIncrease: 10,          // Speed increase per second
    maxSpeed: 600,
    obstacleFrequency: 1500,    // ms between obstacles
    coinFrequency: 800          // ms between coins
};

// SHOOTER GAME SETTINGS
const SHOOTER_CONFIG = {
    bulletSpeed: 600,
    bulletDamage: 25,
    fireRate: 150,              // ms between shots
    enemySpawnRate: 1400,       // ms between enemy spawns
    powerUpChance: 0.1          // 10% chance to drop power-up
};

// STRATEGY GAME SETTINGS
const STRATEGY_CONFIG = {
    startingGold: 100,
    towerCost: 50,
    towerDamage: 20,
    towerRange: 150,
    towerFireRate: 1000,
    waveDelay: 5000,            // ms between waves
    enemiesPerWave: 5
};

// ============================================
// AUDIO CONFIGURATION
// ============================================
// Download sounds from: kenney.nl, opengameart.org, itch.io/game-assets
// Place files in assets/audio/ folder
// Supported formats: mp3, ogg, wav
const AUDIO_CONFIG = {
    // Sound effects - map names to file paths
    sounds: {
        // Example: uncomment and add your audio files
        // 'laser': 'assets/audio/laser.ogg',
        // 'explosion': 'assets/audio/explosion.wav',
        // 'powerup': 'assets/audio/powerup.mp3',
        // 'jump': 'assets/audio/jump.ogg',
        // 'coin': 'assets/audio/coin.wav'
    },
    // Background music
    music: {
        // 'menu': 'assets/audio/menu_music.ogg',
        // 'game': 'assets/audio/game_music.mp3',
        // 'boss': 'assets/audio/boss_music.ogg'
    },
    // Volume settings (0.0 to 1.0)
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 1.0
};

// ============================================
// LEVEL DEFINITIONS
// ============================================
const LEVELS = {
    // MAZE LEVELS
    maze: [
        {
            name: "Training Grounds",
            mapWidth: 40,
            mapHeight: 30,
            enemyCount: 4,
            collectibleCount: 5,
            walls: [
                { x: 10, y: 2, w: 1, h: 10 },
                { x: 20, y: 8, w: 1, h: 12 },
                { x: 30, y: 2, w: 1, h: 15 },
                { x: 5, y: 12, w: 12, h: 1 },
                { x: 15, y: 20, w: 15, h: 1 }
            ],
            enemies: [
                { x: 15, y: 8 }, { x: 25, y: 15 },
                { x: 10, y: 22 }, { x: 35, y: 10 }
            ],
            collectibles: [
                { x: 5, y: 5 }, { x: 18, y: 10 },
                { x: 8, y: 20 }, { x: 28, y: 8 }, { x: 35, y: 25 }
            ]
        },
        {
            name: "The Labyrinth",
            mapWidth: 50,
            mapHeight: 40,
            enemyCount: 8,
            collectibleCount: 8,
            walls: [
                { x: 12, y: 2, w: 1, h: 12 },
                { x: 12, y: 18, w: 1, h: 10 },
                { x: 25, y: 8, w: 1, h: 15 },
                { x: 38, y: 2, w: 1, h: 18 },
                { x: 2, y: 10, w: 8, h: 1 },
                { x: 15, y: 12, w: 8, h: 1 },
                { x: 2, y: 22, w: 10, h: 1 },
                { x: 28, y: 18, w: 8, h: 1 }
            ],
            enemies: [
                { x: 8, y: 5 }, { x: 20, y: 10 },
                { x: 15, y: 25 }, { x: 35, y: 12 },
                { x: 42, y: 25 }, { x: 30, y: 30 },
                { x: 8, y: 30 }, { x: 45, y: 8 }
            ],
            collectibles: [
                { x: 5, y: 5 }, { x: 18, y: 5 },
                { x: 8, y: 15 }, { x: 30, y: 10 },
                { x: 42, y: 5 }, { x: 20, y: 28 },
                { x: 35, y: 35 }, { x: 45, y: 35 }
            ]
        }
    ],

    // RUNNER LEVELS (endless - these define backgrounds/themes)
    runner: [
        { name: "Forest Run", theme: 'forest', groundColor: '#2d5a27' },
        { name: "Desert Dash", theme: 'desert', groundColor: '#c2a366' },
        { name: "Space Sprint", theme: 'space', groundColor: '#1a1a3e' }
    ],

    // SHOOTER LEVELS
    shooter: [
        {
            name: "Level 1: Quantum Basics",
            enemyCount: 10,
            enemySpeed: 60,
            bossHealth: 0,
            concepts: ['Superposition', 'Wavefunction', 'Interference', 'Qubits']
        },
        {
            name: "Level 2: Agentic AI",
            enemyCount: 15,
            enemySpeed: 75,
            bossHealth: 0,
            concepts: ['MCP', 'A2A', 'LLM Reasoning', 'Context Engineering', 'Multi-Agent']
        },
        {
            name: "Level 3: Quantum Nexus (Boss)",
            enemyCount: 12,
            enemySpeed: 85,
            bossHealth: 800,
            concepts: ['Entanglement', 'Quantum Tunneling', 'Decoherence', 'Agent Orchestration', 'Planning']
        }
    ],

    // STRATEGY LEVELS
    strategy: [
        {
            name: "First Defense",
            waves: 5,
            enemiesPerWave: 5,
            enemyHealth: 50,
            pathPoints: [
                { x: 0, y: 200 },
                { x: 300, y: 200 },
                { x: 300, y: 400 },
                { x: 600, y: 400 }
            ]
        }
    ]
};

// ============================================
// HELPER FUNCTION - Get current settings
// ============================================
function getGameConfig() {
    const diff = DIFFICULTY[CURRENT_DIFFICULTY];
    return {
        type: GAME_TYPE,
        info: GAME_INFO,
        theme: THEME,
        difficulty: diff,
        levels: LEVELS[GAME_TYPE],

        // Type-specific config
        maze: MAZE_CONFIG,
        runner: RUNNER_CONFIG,
        shooter: SHOOTER_CONFIG,
        strategy: STRATEGY_CONFIG
    };
}
