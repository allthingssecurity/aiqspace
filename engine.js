/**
 * GAME ENGINE
 * ===========
 * Core Phaser 3 engine supporting multiple game genres.
 * Games: Maze, Runner, Shooter, Strategy
 */

// ============================================
// SOUND MANAGER
// ============================================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
        this.audioBuffers = {};  // Cached audio buffers
        this.musicSource = null; // Current music source
        this.musicGain = null;   // Music volume control
        this.unlocked = false;   // Track if audio is unlocked
    }

    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.8;
                this.masterGain.connect(this.ctx.destination);
                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.value = 0.5;
                this.musicGain.connect(this.masterGain);
            } catch (e) {
                console.warn('AudioContext creation failed:', e);
            }
        }
    }

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
                this.unlocked = true;
            } catch (e) {
                console.warn('AudioContext resume failed:', e);
            }
        } else if (this.ctx && this.ctx.state === 'running') {
            this.unlocked = true;
        }
    }

    // Ensure audio is ready (call on user interaction)
    async unlock() {
        this.init();
        await this.resume();
        return this.unlocked;
    }

    // Load audio file from URL (mp3, ogg, wav)
    async loadAudio(name, url) {
        if (this.audioBuffers[name]) return this.audioBuffers[name];
        this.init();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.audioBuffers[name] = audioBuffer;
            return audioBuffer;
        } catch (e) {
            console.warn('Failed to load audio:', name, e);
            return null;
        }
    }

    // Play loaded audio file
    playAudio(name, options = {}) {
        if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return null;
        const buffer = this.audioBuffers[name];
        if (!buffer) return null;

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        source.loop = options.loop || false;
        gain.gain.value = options.volume !== undefined ? options.volume : 1;
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(0);
        return { source, gain };
    }

    // Play background music (loops, only one at a time)
    playMusic(name) {
        this.stopMusic();
        if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
        const buffer = this.audioBuffers[name];
        if (!buffer) return;

        this.musicSource = this.ctx.createBufferSource();
        this.musicSource.buffer = buffer;
        this.musicSource.loop = true;
        this.musicSource.connect(this.musicGain);
        this.musicSource.start(0);
    }

    stopMusic() {
        if (this.musicSource) {
            try { this.musicSource.stop(); } catch (e) {}
            this.musicSource = null;
        }
    }

    setMusicVolume(vol) {
        if (this.musicGain) this.musicGain.gain.value = Math.max(0, Math.min(1, vol));
    }

    play(type) {
        if (!this.enabled) return;

        // Auto-init on first play attempt
        if (!this.ctx) {
            this.init();
        }

        // Try to resume if suspended (user gesture should have unlocked it)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

        // Only play if context is running
        if (!this.ctx || this.ctx.state !== 'running') return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        const now = this.ctx.currentTime;

        switch (type) {
            case 'collect':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.1);
                osc.frequency.setValueAtTime(784, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'hit':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'shoot':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'enemy':
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(550, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'levelup':
                osc.type = 'sine';
                [523, 659, 784, 1047].forEach((f, i) => {
                    osc.frequency.setValueAtTime(f, now + i * 0.15);
                });
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.8);
                osc.start(now);
                osc.stop(now + 0.8);
                break;

            case 'gameover':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'thrust':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(60, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
        }
    }

    async toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            await this.unlock();
        } else {
            this.stopMusic();
        }
        return this.enabled;
    }
}

const soundManager = new SoundManager();

// ============================================
// BASE GAME SCENE
// ============================================
class BaseGameScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
        this.config = null;
        this.currentLevel = 0;
        this.score = 0;
        this.health = 100;
        this.lives = 3;
        this.gameOver = false;
        this.isPaused = false;
    }

    init() {
        const cfg = getGameConfig();
        this.config = cfg;
        this.health = cfg.difficulty.playerHealth;
        this.lives = cfg.difficulty.playerLives;
    }

    preload() {
        // Generate textures based on theme
        const theme = this.config.theme;

        // Space backgrounds
        const starsNear = SpriteGenerator.createStarfield(256, 70, '#e5f6ff');
        const starsFar = SpriteGenerator.createStarfield(256, 40, '#98c8ff');
        if (!this.textures.exists('stars_near')) this.textures.addBase64('stars_near', starsNear);
        if (!this.textures.exists('stars_far')) this.textures.addBase64('stars_far', starsFar);

        // Player (rocket for space expedition)
        const playerTop = SpriteGenerator.createRocketTopDown(64, theme.player);
        const playerSide = SpriteGenerator.createPlayerSide(48, 64, theme.player);
        if (!this.textures.exists('player_top')) this.textures.addBase64('player_top', playerTop);
        if (!this.textures.exists('player_side')) this.textures.addBase64('player_side', playerSide);

        // Enemies
        const enemyTop = SpriteGenerator.createEnemyTopDown(64, theme.enemy);
        const enemySide = SpriteGenerator.createEnemySide(48, 48, theme.enemy);
        if (!this.textures.exists('enemy_top')) this.textures.addBase64('enemy_top', enemyTop);
        if (!this.textures.exists('enemy_side')) this.textures.addBase64('enemy_side', enemySide);

        // Items
        const coin = SpriteGenerator.createCoin(32, theme.colors.secondary);
        const bullet = SpriteGenerator.createBullet(16, 8, theme.colors.secondary);
        const obstacle = SpriteGenerator.createObstacle(32, 48);
        const tower = SpriteGenerator.createTower(48, theme.colors.primary);
        const ground = SpriteGenerator.createGround(64, 32, theme.colors.floor);
        const asteroid = SpriteGenerator.createAsteroid(64);
        const debris = SpriteGenerator.createDebris(16);

        if (!this.textures.exists('coin')) this.textures.addBase64('coin', coin);
        if (!this.textures.exists('bullet')) this.textures.addBase64('bullet', bullet);
        if (!this.textures.exists('obstacle')) this.textures.addBase64('obstacle', obstacle);
        if (!this.textures.exists('tower')) this.textures.addBase64('tower', tower);
        if (!this.textures.exists('ground')) this.textures.addBase64('ground', ground);
        if (!this.textures.exists('asteroid')) this.textures.addBase64('asteroid', asteroid);
        if (!this.textures.exists('debris')) this.textures.addBase64('debris', debris);

        // Space props & objects
        const planet1 = SpriteGenerator.createPlanet(80, '#4a7c59', '#7ec8e3');
        const planet2 = SpriteGenerator.createPlanet(60, '#8b4a6b', '#ff9999');
        const planet3 = SpriteGenerator.createPlanet(100, '#5a6a8a', '#aaccff');
        const ringedPlanet = SpriteGenerator.createRingedPlanet(90, '#d4a574', '#c9b896');
        const spaceStation = SpriteGenerator.createSpaceStation(64);
        const nebula1 = SpriteGenerator.createNebula(128, '#8b5cf6');
        const nebula2 = SpriteGenerator.createNebula(128, '#ff6b9d');
        const ufo = SpriteGenerator.createUFO(48, '#7a5caa');
        const satellite = SpriteGenerator.createSatellite(40);
        const wormhole = SpriteGenerator.createWormhole(64, '#9933ff');
        const comet = SpriteGenerator.createComet(48);
        const mine = SpriteGenerator.createMine(32);
        const shieldPowerup = SpriteGenerator.createShieldPowerup(32);
        const weaponPowerup = SpriteGenerator.createWeaponPowerup(32);
        const speedPowerup = SpriteGenerator.createSpeedPowerup(32);
        const healthPowerup = SpriteGenerator.createHealthPowerup(32);

        if (!this.textures.exists('planet1')) this.textures.addBase64('planet1', planet1);
        if (!this.textures.exists('planet2')) this.textures.addBase64('planet2', planet2);
        if (!this.textures.exists('planet3')) this.textures.addBase64('planet3', planet3);
        if (!this.textures.exists('ringed_planet')) this.textures.addBase64('ringed_planet', ringedPlanet);
        if (!this.textures.exists('space_station')) this.textures.addBase64('space_station', spaceStation);
        if (!this.textures.exists('nebula1')) this.textures.addBase64('nebula1', nebula1);
        if (!this.textures.exists('nebula2')) this.textures.addBase64('nebula2', nebula2);
        if (!this.textures.exists('ufo')) this.textures.addBase64('ufo', ufo);
        if (!this.textures.exists('satellite')) this.textures.addBase64('satellite', satellite);
        if (!this.textures.exists('wormhole')) this.textures.addBase64('wormhole', wormhole);
        if (!this.textures.exists('comet')) this.textures.addBase64('comet', comet);
        if (!this.textures.exists('mine')) this.textures.addBase64('mine', mine);
        if (!this.textures.exists('powerup_shield')) this.textures.addBase64('powerup_shield', shieldPowerup);
        if (!this.textures.exists('powerup_weapon')) this.textures.addBase64('powerup_weapon', weaponPowerup);
        if (!this.textures.exists('powerup_speed')) this.textures.addBase64('powerup_speed', speedPowerup);
        if (!this.textures.exists('powerup_health')) this.textures.addBase64('powerup_health', healthPowerup);
        // External logo asset for ad ships (loaded via Phaser loader)
        if (!this.textures.exists('aiqnex_logo')) {
            this.load.image('aiqnex_logo', 'aiqnex_logo.jpg');
        }
    }

    updateUI() {
        if (typeof updateGameUI === 'function') {
            const data = {
                score: this.score,
                health: this.health,
                maxHealth: this.config.difficulty.playerHealth,
                lives: this.lives,
                level: this.currentLevel + 1
            };
            if (this.thrust !== undefined) data.thrust = this.thrust;
            if (this.boss && this.boss.health !== undefined) {
                data.bossHealth = this.boss.health;
                data.maxBossHealth = this.boss.maxHealth || this.boss.health;
            } else {
                data.bossHealth = 0;
                data.maxBossHealth = 0;
            }
            updateGameUI(data);
        }
    }

    showMessage(text, duration = 2000) {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        const msg = this.add.text(cx, cy, text, {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: cy - 50,
            duration: duration,
            onComplete: () => msg.destroy()
        });
    }

    // Small floating text helper used by multiple scenes
    showFloatingText(x, y, text, color = '#ffd700') {
        try {
            const t = this.add.text(x, y, text, {
                fontSize: '16px',
                color: color,
                stroke: '#000',
                strokeThickness: 3
            }).setDepth(1000).setScrollFactor(1);
            this.tweens.add({
                targets: t,
                y: y - 40,
                alpha: 0,
                duration: 1200,
                onComplete: () => t.destroy()
            });
        } catch (_) {
            // noop
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        soundManager.play('hit');
        this.cameras.main.shake(100, 0.01);
        this.updateUI();

        if (this.health <= 0) {
            this.loseLife();
        }
    }

    loseLife() {
        this.lives--;
        this.updateUI();

        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            this.health = this.config.difficulty.playerHealth;
            this.cameras.main.flash(500, 255, 0, 0);
            this.resetPlayer();
        }
    }

    resetPlayer() {
        // Override in child classes
    }

    endGame(won) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.physics.pause();

        soundManager.play(won ? 'levelup' : 'gameover');

        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        this.add.rectangle(cx, cy, 400, 200, 0x000000, 0.9)
            .setScrollFactor(0).setDepth(999);

        const title = won ? 'YOU WIN!' : 'GAME OVER';
        const color = won ? '#22c55e' : '#ef4444';

        this.add.text(cx, cy - 40, title, {
            fontSize: '36px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.add.text(cx, cy, `Score: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        const btn = this.add.text(cx, cy + 50, '[ PLAY AGAIN ]', {
            fontSize: '20px',
            fill: '#ffd700',
            backgroundColor: '#1a1a3e',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000)
            .setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.currentLevel = 0;
            this.score = 0;
            this.lives = this.config.difficulty.playerLives;
            this.scene.restart();
        });
    }

    nextLevel() {
        const levels = this.config.levels;
        if (this.currentLevel < levels.length - 1) {
            this.currentLevel++;
            soundManager.play('levelup');
            this.showMessage(`Level ${this.currentLevel + 1}!`);
            this.scene.restart();
        } else {
            this.endGame(true);
        }
    }
}

// ============================================
// MAZE GAME SCENE
// ============================================
class MazeScene extends BaseGameScene {
    constructor() {
        super('MazeScene');
        this.collected = 0;
        this.lastDamageTime = 0;
    }

    create() {
        soundManager.unlock();

        // Wait for textures
        this.waitForTextures(() => {
            this.setupMaze();
        });
    }

    waitForTextures(callback) {
        const required = ['floor', 'walls', 'player_top', 'enemy_top', 'coin'];
        const check = () => {
            if (required.every(k => this.textures.exists(k))) {
                // Create player spritesheet
                if (!this.textures.exists('player')) {
                    const src = this.textures.get('player_top').getSourceImage();
                    this.textures.addSpriteSheet('player', src, { frameWidth: 64, frameHeight: 64 });
                }
                callback();
            } else {
                this.time.delayedCall(50, check);
            }
        };
        check();
    }

    setupMaze() {
        const level = this.config.levels[this.currentLevel];
        const T = this.config.maze.tileSize;
        const mapW = level.mapWidth * T;
        const mapH = level.mapHeight * T;

        // Floor
        this.add.tileSprite(0, 0, mapW, mapH, 'floor').setOrigin(0);

        // Walls
        this.walls = this.physics.add.staticGroup();

        // Border walls
        this.addWall(0, 0, mapW, T * 1.5);
        this.addWall(0, mapH - T * 1.5, mapW, T * 1.5);
        this.addWall(0, 0, T * 1.5, mapH);
        this.addWall(mapW - T * 1.5, 0, T * 1.5, mapH);

        // Level walls
        level.walls.forEach(w => {
            this.addWall(w.x * T, w.y * T, w.w * T, w.h * T);
        });

        // Player
        this.player = this.physics.add.sprite(80, 80, 'player', 0);
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.body.setSize(32, 32);

        // Animations
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 1
            });
        }

        // Collectibles
        this.collectibles = this.add.group();
        this.collected = 0;
        level.collectibles.forEach((pos, i) => {
            const c = this.physics.add.sprite(pos.x * T, pos.y * T, 'coin');
            c.setScale(1);
            c.itemIndex = i;
            this.collectibles.add(c);

            this.tweens.add({
                targets: c,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        });

        // Enemies
        this.enemies = this.add.group();
        level.enemies.forEach(pos => {
            const e = this.physics.add.sprite(pos.x * T, pos.y * T, 'enemy_top');
            e.setScale(0.65);
            e.speed = this.config.difficulty.enemySpeed + Phaser.Math.Between(-10, 20);
            e.body.setSize(32, 32);
            this.enemies.add(e);

            this.tweens.add({
                targets: e,
                angle: { from: -3, to: 3 },
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        });

        // Physics
        this.physics.world.setBounds(0, 0, mapW, mapH);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.collectibles, this.collect, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // Camera
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // UI
        this.updateUI();
        this.showMessage(level.name, 1500);
    }

    addWall(x, y, w, h) {
        const wall = this.add.tileSprite(x + w / 2, y + h / 2, w, h, 'walls');
        this.walls.add(wall);
        wall.body.setSize(w, h);
        wall.body.setOffset(-w / 2, -h / 2);
    }

    collect(player, item) {
        item.destroy();
        this.collected++;
        this.score += 100;
        soundManager.play('collect');
        this.updateUI();

        const level = this.config.levels[this.currentLevel];
        if (this.collected >= level.collectibles.length) {
            this.nextLevel();
        }
    }

    hitEnemy(player, enemy) {
        const now = this.time.now;
        if (now - this.lastDamageTime < 1000) return;
        this.lastDamageTime = now;

        this.takeDamage(this.config.difficulty.enemyDamage);
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => player.clearTint());
    }

    resetPlayer() {
        this.player.setPosition(80, 80);
    }

    update() {
        if (this.gameOver || !this.player) return;
        // Inputs may not be initialized until setup completes
        if (!this.cursors || !this.wasd) return;

        // Enemy AI
        this.enemies.children.iterate(e => {
            if (!e) return;
            const dx = this.player.x - e.x;
            const dy = this.player.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10) {
                e.setVelocity((dx / dist) * e.speed, (dy / dist) * e.speed);
            }
        });

        // Player movement
        const speed = this.config.difficulty.playerSpeed;
        this.player.setVelocity(0);
        let moving = false;

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
            moving = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
            moving = true;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(speed);
            moving = true;
        }

        // Normalize diagonal movement
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.body.velocity.normalize().scale(speed);
        }

        this.player.anims.play(moving ? 'walk' : 'idle', true);
    }
}

// ============================================
// RUNNER GAME SCENE
// ============================================
class RunnerScene extends BaseGameScene {
    constructor() {
        super('RunnerScene');
        this.speed = 300;
        this.isJumping = false;
    }

    create() {
        soundManager.unlock();

        this.waitForTextures(() => {
            this.setupRunner();
        });
    }

    waitForTextures(callback) {
        const required = ['ground', 'player_side', 'obstacle', 'coin'];
        const check = () => {
            if (required.every(k => this.textures.exists(k))) {
                if (!this.textures.exists('player')) {
                    const src = this.textures.get('player_side').getSourceImage();
                    this.textures.addSpriteSheet('player', src, { frameWidth: 48, frameHeight: 64 });
                }
                callback();
            } else {
                this.time.delayedCall(50, check);
            }
        };
        check();
    }

    setupRunner() {
        const cfg = this.config.runner;
        this.speed = cfg.groundSpeed;

        // Background
        this.add.rectangle(0, 0, 800, 600, 0x87ceeb).setOrigin(0);

        // Ground
        this.ground = this.add.tileSprite(0, 550, 800, 50, 'ground').setOrigin(0);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = this.physics.add.sprite(100, 480, 'player', 0);
        this.player.setScale(0.8);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(cfg.gravity);

        // Animations
        if (!this.anims.exists('run')) {
            this.anims.create({
                key: 'run',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.player.anims.play('run');

        // Groups
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // Collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

        // Spawn timers
        this.obstacleTimer = this.time.addEvent({
            delay: cfg.obstacleFrequency,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        this.coinTimer = this.time.addEvent({
            delay: cfg.coinFrequency,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.jump());

        this.updateUI();
    }

    jump() {
        if (this.player.body.touching.down) {
            this.player.setVelocityY(this.config.runner.jumpForce);
            soundManager.play('jump');
        }
    }

    spawnObstacle() {
        const obs = this.obstacles.create(850, 510, 'obstacle');
        obs.setScale(0.8);
        obs.setVelocityX(-this.speed);
        obs.body.setAllowGravity(false);
    }

    spawnCoin() {
        const y = Phaser.Math.Between(400, 520);
        const coin = this.coins.create(850, y, 'coin');
        coin.setVelocityX(-this.speed);
        coin.body.setAllowGravity(false);
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score += 10;
        soundManager.play('collect');
        this.updateUI();
    }

    hitObstacle(player, obstacle) {
        obstacle.destroy();
        this.takeDamage(this.config.difficulty.enemyDamage);
    }

    resetPlayer() {
        this.player.setPosition(100, 480);
        this.player.setVelocity(0);
    }

    update() {
        if (this.gameOver || !this.player) return;

        // Scroll ground
        this.ground.tilePositionX += this.speed * 0.016;

        // Jump control
        if (this.cursors.space.isDown || this.cursors.up.isDown) {
            this.jump();
        }

        // Clean up off-screen objects
        this.obstacles.children.iterate(o => {
            if (o && o.x < -50) o.destroy();
        });
        this.coins.children.iterate(c => {
            if (c && c.x < -50) c.destroy();
        });

        // Increase speed over time
        this.speed += this.config.runner.speedIncrease * 0.001;
        this.speed = Math.min(this.speed, this.config.runner.maxSpeed);

        // Score increases with time
        this.score += 1;
        if (this.score % 100 === 0) {
            this.updateUI();
        }
    }
}

// ============================================
// SHOOTER GAME SCENE
// ============================================
class ShooterScene extends BaseGameScene {
    constructor() {
        super('ShooterScene');
        this.lastFired = 0;
    }

    create() {
        soundManager.unlock();

        this.waitForTextures(() => {
            this.setupShooter();
        });
    }

    waitForTextures(callback) {
        const required = ['stars_far', 'stars_near', 'player_top', 'enemy_top', 'bullet'];
        const check = () => {
            if (required.every(k => this.textures.exists(k))) {
                if (!this.textures.exists('player')) {
                    const src = this.textures.get('player_top').getSourceImage();
                    this.textures.addSpriteSheet('player', src, { frameWidth: 64, frameHeight: 64 });
                }
                callback();
            } else {
                this.time.delayedCall(50, check);
            }
        };
        check();
    }

    setupShooter() {
        // Parallax starfield background
        this.bgFar = this.add.tileSprite(0, 0, 800, 600, 'stars_far').setOrigin(0);
        this.bgNear = this.add.tileSprite(0, 0, 800, 600, 'stars_near').setOrigin(0);

        // Background decorations group (planets, nebulae - non-interactive)
        this.bgDecorations = this.add.group();
        this.spawnBackgroundProps();

        // Player
        this.player = this.physics.add.sprite(400, 500, 'player', 0);
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);
        this.player.body.setCollideWorldBounds && this.player.body.setCollideWorldBounds(false);
        this.playerShield = false;
        this.weaponLevel = 1;
        this.speedBoost = 1;

        // Groups
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.hazards = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Level state
        this.levelDef = this.config.levels[this.currentLevel] || { enemyCount: 10, enemySpeed: 60, concepts: [] };
        this.remainingEnemies = this.levelDef.enemyCount;
        this.totalSpawns = 0;

        // Spawn enemies
        this.enemyTimer = this.time.addEvent({
            delay: this.config.shooter.enemySpawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Spawn powerups periodically
        this.time.addEvent({
            delay: 8000,
            callback: this.spawnPowerup,
            callbackScope: this,
            loop: true
        });

        // Spawn comets occasionally
        this.time.addEvent({
            delay: 12000,
            callback: this.spawnComet,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hazardHitPlayer, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.bullets, this.hazards, this.bulletHitHazard, null, this);

        // Friendly ad-ships carrying AIQNex logo (non-harmful)
        this.friendly = this.physics.add.group();
        // Prepare transparent version of the AIQNex logo if available
        this.prepareLogoTexture();
        this.time.addEvent({ delay: 15000, loop: true, callback: this.spawnFriendly, callbackScope: this });

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.fireKey = this.input.keyboard.addKey('SPACE');
        this.thrustKey = this.input.keyboard.addKey('SHIFT');
        // Mobile: fall back to on-screen controls
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        this.updateUI();
    }

    spawnBackgroundProps() {
        // Add distant planets and nebulae for atmosphere
        const props = [
            { key: 'nebula1', x: 100, y: 150, scale: 1.5, alpha: 0.3, speed: 5 },
            { key: 'nebula2', x: 650, y: 400, scale: 1.2, alpha: 0.25, speed: 4 },
            { key: 'planet1', x: 700, y: 80, scale: 0.6, alpha: 0.7, speed: 8 },
            { key: 'planet2', x: 150, y: 350, scale: 0.4, alpha: 0.6, speed: 6 },
            { key: 'ringed_planet', x: 400, y: -50, scale: 0.5, alpha: 0.5, speed: 3 },
        ];
        props.forEach(p => {
            if (this.textures.exists(p.key)) {
                const sprite = this.add.image(p.x, p.y, p.key);
                sprite.setScale(p.scale).setAlpha(p.alpha).setDepth(-10);
                sprite.scrollSpeed = p.speed;
                this.bgDecorations.add(sprite);
            }
        });
    }

    spawnPowerup() {
        const types = ['powerup_shield', 'powerup_weapon', 'powerup_speed', 'powerup_health'];
        const type = types[Phaser.Math.Between(0, types.length - 1)];
        const x = Phaser.Math.Between(50, 750);
        const p = this.powerups.create(x, -30, type);
        p.setScale(0.9);
        p.setVelocity(Phaser.Math.Between(-20, 20), 80);
        p.powerupType = type;
        // Add floating animation
        this.tweens.add({
            targets: p,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    collectPowerup(player, powerup) {
        const type = powerup.powerupType;
        powerup.destroy();
        soundManager.play('collect');
        this.score += 50;

        switch (type) {
            case 'powerup_shield':
                this.playerShield = true;
                this.player.setTint(0x00ffff);
                this.time.delayedCall(5000, () => {
                    this.playerShield = false;
                    this.player.clearTint();
                });
                this.showFloatingText(player.x, player.y, 'SHIELD!', '#00ffff');
                break;
            case 'powerup_weapon':
                this.weaponLevel = Math.min(3, this.weaponLevel + 1);
                this.showFloatingText(player.x, player.y, 'WEAPON UP!', '#ff6600');
                break;
            case 'powerup_speed':
                this.speedBoost = 1.5;
                this.time.delayedCall(5000, () => { this.speedBoost = 1; });
                this.showFloatingText(player.x, player.y, 'SPEED!', '#ffdd00');
                break;
            case 'powerup_health':
                this.health = Math.min(this.config.difficulty.playerHealth, this.health + 30);
                this.showFloatingText(player.x, player.y, '+30 HP', '#ff4466');
                break;
        }
        this.updateUI();
    }

    spawnComet() {
        if (!this.textures.exists('comet')) return;
        const x = Phaser.Math.Between(-50, 850);
        const c = this.hazards.create(x, -60, 'comet');
        c.setScale(0.7);
        c.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(200, 350));
        c.setRotation(Math.atan2(c.body.velocity.y, c.body.velocity.x));
        c.damage = 35;
    }

    bulletHitHazard(bullet, hazard) {
        bullet.destroy();
        // Asteroids and mines can be destroyed, comets cannot
        if (hazard.texture.key === 'asteroid' || hazard.texture.key === 'mine') {
            hazard.destroy();
            this.score += 25;
            soundManager.play('enemy');
            this.updateUI();
        }
    }

    spawnEnemy() {
        // 20% chance to spawn UFO instead of regular enemy
        if (Math.random() < 0.2 && this.textures.exists('ufo')) {
            this.spawnUFO();
        } else {
            const x = Phaser.Math.Between(50, 750);
            const e = this.enemies.create(x, -30, 'enemy_top');
            e.setScale(0.6);
            e.health = 40 + Math.floor((this.currentLevel || 0) * 10);
            e.setVelocity(Phaser.Math.Between(-20, 20), this.levelDef.enemySpeed || this.config.difficulty.enemySpeed);
        }
        if (!this.totalSpawns) this.totalSpawns = 0;
        this.totalSpawns++;
        // Occasionally spawn hazards
        if (Math.random() < 0.4) this.spawnHazard();
        // Boss if this level defines one
        if (!this.boss && this.levelDef.bossHealth && this.totalSpawns >= 4) {
            this.spawnBoss();
        }
    }

    spawnHazard() {
        const roll = Math.random();
        let key, scale, damage;

        if (roll < 0.35) {
            key = 'asteroid';
            scale = 0.8;
            damage = 25;
        } else if (roll < 0.55) {
            key = 'debris';
            scale = 1.2;
            damage = 10;
        } else if (roll < 0.75 && this.textures.exists('mine')) {
            key = 'mine';
            scale = 0.9;
            damage = 40;
        } else if (this.textures.exists('satellite')) {
            key = 'satellite';
            scale = 0.7;
            damage = 15;
        } else {
            key = 'asteroid';
            scale = 0.6;
            damage = 20;
        }

        const x = Phaser.Math.Between(20, 780);
        const h = this.hazards.create(x, -40, key);
        h.setScale(scale);
        h.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(80, 160));
        h.setAngularVelocity(key === 'mine' ? 0 : Phaser.Math.Between(-60, 60));
        h.damage = damage;

        // Mines blink red
        if (key === 'mine') {
            this.tweens.add({
                targets: h,
                alpha: 0.6,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }
    }

    spawnUFO() {
        if (!this.textures.exists('ufo')) return;
        const x = Phaser.Math.Between(50, 750);
        const u = this.enemies.create(x, -40, 'ufo');
        u.setScale(0.8);
        u.health = 60 + Math.floor((this.currentLevel || 0) * 15);
        u.setVelocity(0, 40);
        u.isUFO = true;
        // UFO moves in sine wave pattern
        this.tweens.add({
            targets: u,
            x: u.x + 150,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    spawnBoss() {
        this.boss = this.physics.add.sprite(400, -80, 'enemy_top');
        this.boss.setScale(1.6);
        this.boss.maxHealth = (this.levelDef && this.levelDef.bossHealth) ? this.levelDef.bossHealth : 600;
        this.boss.health = this.boss.maxHealth;
        this.boss.setVelocityY(50);
        this.bossTimer = this.time.addEvent({ delay: 800, callback: this.bossPattern, callbackScope: this, loop: true });
        // show boss bar
        this.updateUI();
        // Enable player bullets to damage boss
        this.physics.add.overlap(this.bullets, this.boss, this.bulletHitBoss, null, this);
        // Pause regular enemy spawns during the boss fight
        if (this.enemyTimer) {
            try { this.enemyTimer.remove(false); } catch (_) {}
            this.enemyTimer = null;
        }
        this.inBossFight = true;
    }

    bossPattern() {
        if (!this.boss || !this.boss.body) return;
        // Sine wave across screen
        const t = this.time.now / 1000;
        this.boss.setVelocityX(Math.sin(t) * 120);
        // Fire radial bullets downward
        const shots = 8;
        for (let i = 0; i < shots; i++) {
            const angle = (Math.PI * 2 * i) / shots;
            if (this.bullets) {
                const b = this.bullets.create(this.boss.x, this.boss.y + 10, 'bullet');
                b.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120 + 60);
                b.isEnemy = true;
            }
        }
    }

    // Create a transparent version of the AIQNex logo by removing corner background
    prepareLogoTexture() {
        const rawKey = 'aiqnex_logo';
        const cleanKey = 'aiqnex_logo_clean';
        if (!this.textures.exists(rawKey) || this.textures.exists(cleanKey)) return;
        try {
            const img = this.textures.get(rawKey).getSourceImage();
            const w = img.width, h = img.height;
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, w, h);
            const px = data.data;
            const r0 = px[0], g0 = px[1], b0 = px[2];
            const threshold = 32;
            for (let i = 0; i < px.length; i += 4) {
                const r = px[i], g = px[i + 1], b = px[i + 2];
                if (Math.abs(r - r0) < threshold && Math.abs(g - g0) < threshold && Math.abs(b - b0) < threshold) {
                    px[i + 3] = 0;
                }
            }
            ctx.putImageData(data, 0, 0);
            this.textures.addBase64(cleanKey, canvas.toDataURL());
        } catch (_) {
            // ignore
        }
    }

    fire() {
        const now = this.time.now;
        if (now - this.lastFired < this.config.shooter.fireRate) return;
        this.lastFired = now;

        const bulletSpeed = this.config.shooter.bulletSpeed;
        const px = this.player.x;
        const py = this.player.y - 20;
        const level = this.weaponLevel || 1;

        // Level 1: Single shot
        const b1 = this.bullets.create(px, py, 'bullet');
        b1.setVelocityY(-bulletSpeed);

        // Level 2: Double shot (side by side)
        if (level >= 2) {
            const b2 = this.bullets.create(px - 12, py, 'bullet');
            const b3 = this.bullets.create(px + 12, py, 'bullet');
            b2.setVelocityY(-bulletSpeed);
            b3.setVelocityY(-bulletSpeed);
        }

        // Level 3: Add angled shots
        if (level >= 3) {
            const b4 = this.bullets.create(px - 20, py + 5, 'bullet');
            const b5 = this.bullets.create(px + 20, py + 5, 'bullet');
            b4.setVelocity(-80, -bulletSpeed * 0.9);
            b5.setVelocity(80, -bulletSpeed * 0.9);
        }

        soundManager.play('shoot');
    }

    bulletHitEnemy(bullet, enemy) {
        bullet.destroy();
        // Ignore if this is enemy bullet hitting enemy
        if (bullet.isEnemy) return;
        enemy.health -= this.config.shooter.bulletDamage;

        if (enemy.health <= 0) {
            enemy.destroy();
            this.score += 50;
            soundManager.play('enemy');
            this.popupConcept(enemy.x, enemy.y);
            // Track kills for level progression (non-boss levels)
            if (this.remainingEnemies > 0) this.remainingEnemies--;
            // If this level has no boss and all required enemies are defeated, advance
            if (this.remainingEnemies <= 0 && !this.levelDef.bossHealth && this.currentLevel < (this.config.levels.length - 1)) {
                // Stop spawning quickly to avoid extra spawns during transition
                if (this.enemyTimer) this.enemyTimer.remove(false);
                this.nextLevel();
                return;
            }
            this.updateUI();
        }
    }

    bulletHitBoss(bullet, boss) {
        if (bullet.isEnemy) return;
        bullet.destroy();
        boss.health -= this.config.shooter.bulletDamage;
        soundManager.play('enemy');
        this.updateUI();
        if (boss.health <= 0) {
            boss.destroy();
            if (this.bossTimer) this.bossTimer.remove(false);
            this.boss = null;
            this.inBossFight = false;
            // Advance if not final level, else win
            if (this.currentLevel < (this.config.levels.length - 1)) {
                if (this.enemyTimer) this.enemyTimer.remove(false);
                this.nextLevel();
            } else {
                this.endGame(true);
            }
        }
    }

    spawnFriendly() {
        const baseKey = this.textures.exists('aiqnex_logo_clean') ? 'aiqnex_logo_clean' : (this.textures.exists('aiqnex_logo') ? 'aiqnex_logo' : null);
        if (!baseKey) return;
        const x = Phaser.Math.Between(60, 740);
        const y = -40;
        const ship = this.friendly.create(x, y, baseKey);
        ship.setScale(0.6);
        ship.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(60, 120));
        ship.setDepth(5);
        ship.setImmovable(true);
        ship.setTint(0xffffff);
        // Make non-colliding harm; overlap just for visual
        ship.body.checkCollision.none = true;
        // Auto-destroy when off screen
        ship.lifespan = this.time.addEvent({ delay: 15000, callback: () => ship.destroy() });
    }

    enemyHitPlayer(player, enemy) {
        enemy.destroy();
        if (this.playerShield) {
            soundManager.play('collect');
            this.showFloatingText(player.x, player.y, 'BLOCKED!', '#00ffff');
        } else {
            this.takeDamage(this.config.difficulty.enemyDamage);
        }
    }

    hazardHitPlayer(player, hz) {
        hz.destroy();
        if (this.playerShield) {
            soundManager.play('collect');
            this.showFloatingText(player.x, player.y, 'BLOCKED!', '#00ffff');
        } else {
            this.takeDamage(hz.damage || this.config.difficulty.enemyDamage);
        }
    }

    resetPlayer() {
        this.player.setPosition(400, 500);
    }

    update() {
        if (this.gameOver || !this.player) return;
        if (!this.cursors || !this.wasd) return;

        // Movement with speed boost
        const baseSpeed = this.config.difficulty.playerSpeed;
        const speed = baseSpeed * (this.speedBoost || 1);
        this.player.setVelocity(0);

        const m = window.mobileInput || {};
        const left = (this.cursors.left && this.cursors.left.isDown) || (this.wasd.A && this.wasd.A.isDown) || m.left;
        const right = (this.cursors.right && this.cursors.right.isDown) || (this.wasd.D && this.wasd.D.isDown) || m.right;
        const up = (this.cursors.up && this.cursors.up.isDown) || (this.wasd.W && this.wasd.W.isDown) || m.up;
        const down = (this.cursors.down && this.cursors.down.isDown) || (this.wasd.S && this.wasd.S.isDown) || m.down;

        if (left) {
            this.player.setVelocityX(-speed);
        } else if (right) {
            this.player.setVelocityX(speed);
        }

        if (up) {
            this.player.setVelocityY(-speed);
        } else if (down) {
            this.player.setVelocityY(speed);
        }

        // Thrust/forward drift
        const thrusting = (this.thrustKey && this.thrustKey.isDown) || m.thrust;
        if (!this.thrust) this.thrust = 0.4;
        const target = thrusting ? 1.0 : 0.4;
        this.thrust += (target - this.thrust) * 0.05;
        if (thrusting) soundManager.play('thrust');
        this.player.setVelocityY(this.player.body.velocity.y - this.thrust * 2);
        this.updateUI();

        // Fire
        if ((this.fireKey && this.fireKey.isDown) || m.fire) {
            this.fire();
        }

        // Clean up off-screen objects
        if (this.bullets && this.bullets.children) {
            this.bullets.children.iterate(b => {
                if (b && b.y < -20) b.destroy();
            });
        }
        if (this.enemies && this.enemies.children) {
            this.enemies.children.iterate(e => {
                if (e && e.y > 650) e.destroy();
            });
        }
        if (this.hazards && this.hazards.children) {
            this.hazards.children.iterate(h => {
                if (h && h.y > 680) h.destroy();
            });
        }
        if (this.powerups && this.powerups.children) {
            this.powerups.children.iterate(p => {
                if (p && p.y > 650) p.destroy();
            });
        }

        // Parallax scrolling for space movement illusion
        if (this.bgFar && this.bgNear) {
            this.bgFar.tilePositionY -= 0.5;
            this.bgNear.tilePositionY -= 1.2;
        }

        // Scroll background decorations (planets, nebulae)
        if (this.bgDecorations && this.bgDecorations.children) {
            this.bgDecorations.children.iterate(d => {
                if (d) {
                    d.y += (d.scrollSpeed || 5) * 0.1;
                    if (d.y > 700) {
                        d.y = -100;
                        d.x = Phaser.Math.Between(50, 750);
                    }
                }
            });
        }

        // Wrap player around screen edges for borderless space
        const w = this.scale.width;
        const h = this.scale.height;
        if (this.player.x < -10) this.player.x = w + 10;
        if (this.player.x > w + 10) this.player.x = -10;
        if (this.player.y < -10) this.player.y = h + 10;
        if (this.player.y > h + 10) this.player.y = -10;
    }

    popupConcept(x, y) {
        const qm = ['Superposition', 'Entanglement', 'Wavefunction', 'Decoherence', 'Quantum Tunneling'];
        const agent = ['MCP', 'A2A', 'LLM Reasoning', 'Context Engineering', 'Multi-Agent'];
        const pool = Math.random() < 0.5 ? qm : agent;
        const term = pool[Math.floor(Math.random() * pool.length)];
        const txt = this.add.text(x, y, term, { fontSize: '16px', color: '#ffd700', stroke: '#000', strokeThickness: 3 }).setDepth(999);
        this.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 1200, onComplete: () => txt.destroy() });
    }
}

// ============================================
// AUDIO LOADER HELPER
// ============================================
async function loadAllAudio() {
    if (typeof AUDIO_CONFIG === 'undefined') return;

    soundManager.unlock();

    // Set volume from config
    if (AUDIO_CONFIG.masterVolume !== undefined) {
        soundManager.masterGain.gain.value = AUDIO_CONFIG.masterVolume;
    }
    if (AUDIO_CONFIG.musicVolume !== undefined) {
        soundManager.setMusicVolume(AUDIO_CONFIG.musicVolume);
    }

    // Load sound effects
    const sounds = AUDIO_CONFIG.sounds || {};
    for (const [name, url] of Object.entries(sounds)) {
        await soundManager.loadAudio(name, url);
    }

    // Load music
    const music = AUDIO_CONFIG.music || {};
    for (const [name, url] of Object.entries(music)) {
        await soundManager.loadAudio(name, url);
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================
function initGame() {
    const cfg = getGameConfig();

    // Load audio files from config
    loadAllAudio().catch(e => console.warn('Audio load error:', e));

    // Select scene based on game type
    let scene;
    switch (cfg.type) {
        case 'runner':
            scene = RunnerScene;
            break;
        case 'shooter':
            scene = ShooterScene;
            break;
        case 'maze':
        default:
            scene = MazeScene;
            break;
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        pixelArt: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: scene
    };

    window.game = new Phaser.Game(config);
}

// Sound toggle
window.toggleSound = async () => {
    const enabled = await soundManager.toggle();
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.textContent = enabled ? '🔊' : '🔇';
    // Play confirmation sound when enabling
    if (enabled) {
        setTimeout(() => soundManager.play('collect'), 100);
    }
    return enabled;
};
