/**
 * SPRITE GENERATOR
 * ================
 * Generates game sprites programmatically.
 * Supports multiple views: top-down, side-scroll
 * All sprites have transparent backgrounds.
 */

class SpriteGenerator {
    // ============================================
    // HELPER METHODS
    // ============================================
    static roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }

    static ellipse(ctx, x, y, rx, ry) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ============================================
    // ENVIRONMENT SPRITES
    // ============================================

    // Floor tile (customizable color)
    static createFloor(size = 64, colors = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const baseColor = colors.floor || '#3d3d5c';
        const gridColor = colors.grid || '#4a4a6a';
        const tileColor = colors.tile || '#454566';
        const highlightColor = colors.highlight || '#4f4f72';

        // Base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);

        // Grid border
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);

        // Inner tile
        ctx.fillStyle = tileColor;
        ctx.fillRect(4, 4, size - 8, size - 8);

        // Highlight
        ctx.fillStyle = highlightColor;
        ctx.fillRect(6, 6, size - 12, 2);
        ctx.fillRect(6, 6, 2, size - 12);

        return canvas.toDataURL();
    }

    // Wall tile (customizable)
    static createWall(size = 64, colors = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const baseColor = colors.wall || '#1a1a2e';
        const brickColor = colors.brick || '#252540';
        const accentColor = colors.accent || '#8b5cf6';
        const borderColor = colors.border || '#6366f1';

        // Base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);

        // Brick pattern
        ctx.fillStyle = brickColor;
        const brickH = size / 4;
        const brickW = size / 2;
        for (let row = 0; row < 4; row++) {
            const offset = (row % 2) * (brickW / 2);
            for (let col = -1; col < 3; col++) {
                ctx.fillRect(col * brickW + offset + 2, row * brickH + 2, brickW - 4, brickH - 4);
            }
        }

        // Top highlight
        ctx.fillStyle = accentColor;
        ctx.fillRect(0, 0, size, 4);

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, size - 2, size - 2);

        return canvas.toDataURL();
    }

    // Ground for runner game
    static createGround(width = 64, height = 32, color = '#2d5a27') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Base ground
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);

        // Grass/texture on top
        ctx.fillStyle = this.lightenColor(color, 20);
        ctx.fillRect(0, 0, width, 4);

        // Dirt texture
        ctx.fillStyle = this.darkenColor(color, 20);
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = 8 + Math.random() * (height - 12);
            ctx.fillRect(x, y, 3, 2);
        }

        return canvas.toDataURL();
    }

    // ============================================
    // PLAYER SPRITES
    // ============================================

    // Starfield texture (tiled background)
    static createStarfield(size = 256, density = 60, color = '#ffffff') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Transparent black base for seamless tiling
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, size, size);

        // Random stars
        for (let i = 0; i < density; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 1.5 + 0.3;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            // occasional twinkle
            if (Math.random() < 0.15) {
                ctx.fillStyle = SpriteGenerator.lightenColor(color, 30);
                ctx.beginPath();
                ctx.arc(x + 0.5, y + 0.5, r * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        return canvas.toDataURL();
    }

    // Top-down rocket (for space expedition)
    static createRocketTopDown(size = 64, colors = {}, frames = 4) {
        const canvas = document.createElement('canvas');
        canvas.width = size * frames;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const hull = colors.body || '#a0b3c6';
        const accent = colors.accent || '#00e5ff';
        const windowColor = '#1a1a2e';
        const fin = this.darkenColor(hull, 25);

        for (let f = 0; f < frames; f++) {
            const cx = f * size + size / 2;
            const cy = size / 2;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            this.ellipse(ctx, cx, cy + 10, 16, 10);

            // Main body
            ctx.fillStyle = hull;
            this.roundRect(ctx, cx - 10, cy - 18, 20, 36, 10);
            // Nose cone
            ctx.fillStyle = this.lightenColor(hull, 10);
            ctx.beginPath();
            ctx.moveTo(cx, cy - 26);
            ctx.lineTo(cx - 10, cy - 12);
            ctx.lineTo(cx + 10, cy - 12);
            ctx.closePath();
            ctx.fill();

            // Accent stripe
            ctx.fillStyle = accent;
            this.roundRect(ctx, cx - 9, cy - 2, 18, 4, 2);

            // Window
            ctx.fillStyle = '#5ec8ff';
            ctx.beginPath();
            ctx.arc(cx, cy - 6, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = windowColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy - 6, 5, 0, Math.PI * 2);
            ctx.stroke();

            // Side fins
            ctx.fillStyle = fin;
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy + 2);
            ctx.lineTo(cx - 20, cy + 12);
            ctx.lineTo(cx - 6, cy + 8);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(cx + 12, cy + 2);
            ctx.lineTo(cx + 20, cy + 12);
            ctx.lineTo(cx + 6, cy + 8);
            ctx.closePath();
            ctx.fill();

            // Engine and flame flicker
            const flameLen = 8 + (f % 2 === 0 ? 4 : 0);
            // Engine port
            ctx.fillStyle = windowColor;
            this.roundRect(ctx, cx - 6, cy + 16, 12, 6, 2);
            // Flame
            const grad = ctx.createLinearGradient(cx, cy + 16, cx, cy + 16 + flameLen);
            grad.addColorStop(0, '#fff59d');
            grad.addColorStop(0.5, '#ffb300');
            grad.addColorStop(1, '#ff7043');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(cx, cy + 16);
            ctx.lineTo(cx - 5, cy + 16 + flameLen);
            ctx.lineTo(cx + 5, cy + 16 + flameLen);
            ctx.closePath();
            ctx.fill();
        }

        return canvas.toDataURL();
    }

    // Top-down player (for maze, shooter, strategy)
    static createPlayerTopDown(size = 64, colors = {}, frames = 4) {
        const canvas = document.createElement('canvas');
        canvas.width = size * frames;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const body = colors.body || '#e07020';
        const skin = colors.skin || '#deb887';
        const hair = colors.hair || '#2d1810';
        const shoes = colors.shoes || '#8b4513';

        const walkPhases = [
            { leftFoot: -5, rightFoot: 5 },
            { leftFoot: 0, rightFoot: 0 },
            { leftFoot: 5, rightFoot: -5 },
            { leftFoot: 0, rightFoot: 0 }
        ];

        for (let f = 0; f < frames; f++) {
            const cx = f * size + size / 2;
            const cy = size / 2;
            const phase = walkPhases[f];

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ellipse(ctx, cx, cy + 4, 16, 12);

            // Feet
            ctx.fillStyle = shoes;
            this.ellipse(ctx, cx - 7, cy + 10 + phase.leftFoot, 5, 6);
            this.ellipse(ctx, cx + 7, cy + 10 + phase.rightFoot, 5, 6);

            // Body
            ctx.fillStyle = body;
            this.ellipse(ctx, cx, cy, 13, 11);
            ctx.strokeStyle = this.darkenColor(body, 30);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 13, 11, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Head (hair from above)
            ctx.fillStyle = hair;
            ctx.beginPath();
            ctx.arc(cx, cy - 7, 9, 0, Math.PI * 2);
            ctx.fill();

            // Face indicator
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(cx, cy - 3, 5, 0, Math.PI * 2);
            ctx.fill();

            // Arms
            const armSwing = f % 2 === 0 ? 2 : -2;
            ctx.fillStyle = body;
            this.ellipse(ctx, cx - 14, cy - armSwing, 5, 7);
            this.ellipse(ctx, cx + 14, cy + armSwing, 5, 7);

            // Hands
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(cx - 15, cy - armSwing + 4, 3, 0, Math.PI * 2);
            ctx.arc(cx + 15, cy + armSwing + 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas.toDataURL();
    }

    // Side-view player (for runner, platformer)
    static createPlayerSide(width = 48, height = 64, colors = {}, frames = 4) {
        const canvas = document.createElement('canvas');
        canvas.width = width * frames;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const body = colors.body || '#e07020';
        const skin = colors.skin || '#deb887';
        const hair = colors.hair || '#2d1810';
        const shoes = colors.shoes || '#8b4513';
        const pants = colors.pants || '#1e3a5f';

        const runPhases = [
            { leftLeg: -20, rightLeg: 20, leftArm: 25, rightArm: -25 },
            { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 },
            { leftLeg: 20, rightLeg: -20, leftArm: -25, rightArm: 25 },
            { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 }
        ];

        for (let f = 0; f < frames; f++) {
            const cx = f * width + width / 2;
            const cy = height / 2;
            const phase = runPhases[f];

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ellipse(ctx, cx, height - 6, 12, 4);

            // Back leg
            ctx.save();
            ctx.translate(cx, cy + 10);
            ctx.rotate(phase.rightLeg * Math.PI / 180);
            ctx.fillStyle = this.darkenColor(pants, 20);
            this.roundRect(ctx, -4, 0, 8, 20, 3);
            ctx.fillStyle = this.darkenColor(shoes, 20);
            this.roundRect(ctx, -5, 17, 10, 6, 2);
            ctx.restore();

            // Back arm
            ctx.save();
            ctx.translate(cx - 2, cy - 8);
            ctx.rotate(phase.rightArm * Math.PI / 180);
            ctx.fillStyle = this.darkenColor(body, 20);
            this.roundRect(ctx, -3, 0, 6, 14, 2);
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(0, 14, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Body
            ctx.fillStyle = body;
            this.roundRect(ctx, cx - 10, cy - 12, 20, 24, 5);

            // Front leg
            ctx.save();
            ctx.translate(cx, cy + 10);
            ctx.rotate(phase.leftLeg * Math.PI / 180);
            ctx.fillStyle = pants;
            this.roundRect(ctx, -4, 0, 8, 20, 3);
            ctx.fillStyle = shoes;
            this.roundRect(ctx, -5, 17, 10, 6, 2);
            ctx.restore();

            // Front arm
            ctx.save();
            ctx.translate(cx + 2, cy - 8);
            ctx.rotate(phase.leftArm * Math.PI / 180);
            ctx.fillStyle = body;
            this.roundRect(ctx, -3, 0, 6, 14, 2);
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(0, 14, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Head
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(cx, cy - 18, 10, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = hair;
            ctx.beginPath();
            ctx.arc(cx, cy - 22, 9, Math.PI, Math.PI * 2);
            ctx.fill();
            this.ellipse(ctx, cx, cy - 24, 10, 5);

            // Eye
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(cx + 3, cy - 18, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas.toDataURL();
    }

    // ============================================
    // ENEMY SPRITES
    // ============================================

    // Top-down robot enemy
    static createEnemyTopDown(size = 64, colors = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size / 2;
        const cy = size / 2;
        const bodyColor = colors.body || '#2d3748';
        const eyeColor = colors.eye || '#ff0000';

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ellipse(ctx, cx, cy + 2, 20, 16);

        // Body
        ctx.fillStyle = bodyColor;
        this.ellipse(ctx, cx, cy, 18, 14);
        ctx.strokeStyle = this.darkenColor(bodyColor, 30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 18, 14, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Head plate
        ctx.fillStyle = this.lightenColor(bodyColor, 20);
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eye (glowing)
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner eye
        ctx.fillStyle = this.lightenColor(eyeColor, 40);
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = this.lightenColor(bodyColor, 10);
        this.ellipse(ctx, cx - 20, cy, 5, 8);
        this.ellipse(ctx, cx + 20, cy, 5, 8);

        // Treads
        ctx.fillStyle = this.darkenColor(bodyColor, 30);
        this.roundRect(ctx, cx - 16, cy + 10, 7, 5, 2);
        this.roundRect(ctx, cx + 9, cy + 10, 7, 5, 2);

        return canvas.toDataURL();
    }

    // Side-view enemy (for runner)
    static createEnemySide(width = 48, height = 48, colors = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const cx = width / 2;
        const cy = height / 2;
        const bodyColor = colors.body || '#8b0000';
        const eyeColor = colors.eye || '#ffff00';

        // Body (spiky)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();

        // Spikes
        ctx.fillStyle = this.darkenColor(bodyColor, 20);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = cx + Math.cos(angle) * 14;
            const y1 = cy + Math.sin(angle) * 14;
            const x2 = cx + Math.cos(angle) * 22;
            const y2 = cy + Math.sin(angle) * 22;
            ctx.beginPath();
            ctx.moveTo(x1 - 4, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1 + 4, y1);
            ctx.closePath();
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 5, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // ============================================
    // ITEM SPRITES
    // ============================================

    // Asteroid (irregular rock)
    static createAsteroid(size = 48, color = '#7a6f63') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;
        const points = 10;
        const radius = size / 2 - 4;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const ang = (i / points) * Math.PI * 2;
            const r = radius * (0.7 + Math.random() * 0.6);
            const x = cx + Math.cos(ang) * r;
            const y = cy + Math.sin(ang) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        // craters
        ctx.fillStyle = this.darkenColor(color, 20);
        for (let i = 0; i < 3; i++) {
            const rx = cx + (Math.random() * 0.6 - 0.3) * radius;
            const ry = cy + (Math.random() * 0.6 - 0.3) * radius;
            this.ellipse(ctx, rx, ry, 4 + Math.random() * 3, 3 + Math.random() * 2);
        }
        return canvas.toDataURL();
    }

    // Debris (small chunk)
    static createDebris(size = 16, color = '#9aa0a6') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        const w = 6 + Math.random() * (size - 8);
        const h = 4 + Math.random() * (size - 10);
        this.roundRect(ctx, (size - w) / 2, (size - h) / 2, w, h, 2);
        return canvas.toDataURL();
    }
    // Coin/collectible
    static createCoin(size = 32, color = '#ffd700') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 4;

        // Outer ring
        ctx.fillStyle = this.darkenColor(color, 20);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = this.lightenColor(color, 40);
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, r / 3, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = this.darkenColor(color, 30);
        ctx.font = `bold ${size/2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy + 1);

        return canvas.toDataURL();
    }

    // Bullet/projectile
    static createBullet(width = 16, height = 8, color = '#ffff00') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;

        // Bullet body
        ctx.fillStyle = color;
        this.roundRect(ctx, 0, 1, width - 2, height - 2, 3);

        // Highlight
        ctx.fillStyle = this.lightenColor(color, 50);
        ctx.fillRect(2, 2, width - 6, 2);

        return canvas.toDataURL();
    }

    // Obstacle (for runner)
    static createObstacle(width = 32, height = 48, color = '#654321') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Crate/box
        ctx.fillStyle = color;
        this.roundRect(ctx, 2, 2, width - 4, height - 4, 4);

        // Highlight
        ctx.fillStyle = this.lightenColor(color, 20);
        ctx.fillRect(4, 4, width - 8, 4);
        ctx.fillRect(4, 4, 4, height - 8);

        // Shadow
        ctx.fillStyle = this.darkenColor(color, 30);
        ctx.fillRect(width - 8, 8, 4, height - 12);
        ctx.fillRect(8, height - 8, width - 12, 4);

        // Cross pattern
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(width - 4, height - 4);
        ctx.moveTo(width - 4, 4);
        ctx.lineTo(4, height - 4);
        ctx.stroke();

        return canvas.toDataURL();
    }

    // Tower (for strategy)
    static createTower(size = 48, color = '#4a90d9') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size / 2;

        // Base
        ctx.fillStyle = this.darkenColor(color, 30);
        this.roundRect(ctx, cx - 16, size - 16, 32, 14, 3);

        // Tower body
        ctx.fillStyle = color;
        this.roundRect(ctx, cx - 12, 10, 24, size - 24, 4);

        // Top
        ctx.fillStyle = this.lightenColor(color, 20);
        ctx.beginPath();
        ctx.moveTo(cx - 14, 12);
        ctx.lineTo(cx, 2);
        ctx.lineTo(cx + 14, 12);
        ctx.closePath();
        ctx.fill();

        // Window/cannon
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(cx, size / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Cannon glow
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(cx, size / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // ============================================
    // SPACE PROPS & OBJECTS
    // ============================================

    // Planet with atmosphere
    static createPlanet(size = 64, baseColor = '#4a7c59', atmosphereColor = '#7ec8e3') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;
        const r = size / 2 - 6;

        // Atmosphere glow
        const glow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r + 6);
        glow.addColorStop(0, 'transparent');
        glow.addColorStop(0.5, atmosphereColor + '40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Planet body
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        grad.addColorStop(0, this.lightenColor(baseColor, 30));
        grad.addColorStop(0.5, baseColor);
        grad.addColorStop(1, this.darkenColor(baseColor, 40));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Surface details (craters/continents)
        ctx.fillStyle = this.darkenColor(baseColor, 15) + '80';
        this.ellipse(ctx, cx - r * 0.3, cy - r * 0.2, r * 0.25, r * 0.15);
        this.ellipse(ctx, cx + r * 0.4, cy + r * 0.3, r * 0.2, r * 0.12);
        this.ellipse(ctx, cx - r * 0.1, cy + r * 0.5, r * 0.18, r * 0.1);

        return canvas.toDataURL();
    }

    // Ringed planet (Saturn-like)
    static createRingedPlanet(size = 80, planetColor = '#d4a574', ringColor = '#c9b896') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;
        const r = size / 3;

        // Ring (back half)
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.6, r * 0.4, 0, Math.PI, 0);
        ctx.stroke();

        // Planet body
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        grad.addColorStop(0, this.lightenColor(planetColor, 20));
        grad.addColorStop(1, this.darkenColor(planetColor, 30));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Bands
        ctx.strokeStyle = this.darkenColor(planetColor, 15);
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.9, cy + i * 5);
            ctx.quadraticCurveTo(cx, cy + i * 5 + 3, cx + r * 0.9, cy + i * 5);
            ctx.stroke();
        }

        // Ring (front half)
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.6, r * 0.4, 0, 0, Math.PI);
        ctx.stroke();
        // Inner ring
        ctx.strokeStyle = this.darkenColor(ringColor, 20);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.3, r * 0.3, 0, 0, Math.PI);
        ctx.stroke();

        return canvas.toDataURL();
    }

    // Space station
    static createSpaceStation(size = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Main hub
        ctx.fillStyle = '#5a6a7a';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Solar panels
        ctx.fillStyle = '#2a3a5a';
        ctx.fillRect(cx - size * 0.45, cy - 6, size * 0.25, 12);
        ctx.fillRect(cx + size * 0.2, cy - 6, size * 0.25, 12);

        // Panel lines
        ctx.strokeStyle = '#4a6a9a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const x1 = cx - size * 0.42 + i * 5;
            ctx.beginPath();
            ctx.moveTo(x1, cy - 5);
            ctx.lineTo(x1, cy + 5);
            ctx.stroke();
            const x2 = cx + size * 0.23 + i * 5;
            ctx.beginPath();
            ctx.moveTo(x2, cy - 5);
            ctx.lineTo(x2, cy + 5);
            ctx.stroke();
        }

        // Antenna
        ctx.strokeStyle = '#8a9aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.2);
        ctx.lineTo(cx, cy - size * 0.4);
        ctx.stroke();
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Window lights
        ctx.fillStyle = '#aaffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // Nebula/space cloud
    static createNebula(size = 128, color = '#8b5cf6') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Multiple cloud layers
        for (let layer = 0; layer < 5; layer++) {
            const grad = ctx.createRadialGradient(
                cx + (Math.random() - 0.5) * size * 0.4,
                cy + (Math.random() - 0.5) * size * 0.4,
                0,
                cx, cy, size * 0.5
            );
            const alpha = 0.15 + Math.random() * 0.1;
            grad.addColorStop(0, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(0.5, color + '20');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        }

        // Scattered stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
            const sx = Math.random() * size;
            const sy = Math.random() * size;
            ctx.beginPath();
            ctx.arc(sx, sy, 0.5 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas.toDataURL();
    }

    // Explosion effect (animated frames)
    static createExplosion(size = 64, frames = 6) {
        const images = [];
        for (let f = 0; f < frames; f++) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const cx = size / 2, cy = size / 2;
            const progress = f / (frames - 1);
            const radius = size * 0.15 + size * 0.35 * progress;
            const alpha = 1 - progress * 0.8;

            // Outer glow
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
            glow.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
            glow.addColorStop(0.4, `rgba(255, 100, 20, ${alpha * 0.7})`);
            glow.addColorStop(0.7, `rgba(200, 50, 0, ${alpha * 0.4})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, size, size);

            // Core
            if (progress < 0.6) {
                ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Debris particles
            ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.8})`;
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2 + progress;
                const dist = radius * (0.6 + Math.random() * 0.4);
                ctx.beginPath();
                ctx.arc(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 2 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            images.push(canvas.toDataURL());
        }
        return images;
    }

    // Power-up: Shield
    static createShieldPowerup(size = 32) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        glow.addColorStop(0, '#00ffff40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Shield shape
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.35);
        ctx.quadraticCurveTo(cx + size * 0.35, cy - size * 0.2, cx + size * 0.3, cy + size * 0.1);
        ctx.quadraticCurveTo(cx, cy + size * 0.4, cx - size * 0.3, cy + size * 0.1);
        ctx.quadraticCurveTo(cx - size * 0.35, cy - size * 0.2, cx, cy - size * 0.35);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#66ddff';
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.25);
        ctx.quadraticCurveTo(cx + size * 0.2, cy - size * 0.1, cx + size * 0.15, cy);
        ctx.quadraticCurveTo(cx, cy + size * 0.15, cx - size * 0.15, cy);
        ctx.quadraticCurveTo(cx - size * 0.2, cy - size * 0.1, cx, cy - size * 0.25);
        ctx.fill();

        return canvas.toDataURL();
    }

    // Power-up: Weapon upgrade
    static createWeaponPowerup(size = 32) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        glow.addColorStop(0, '#ff440040');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Double arrow/bolt
        ctx.fillStyle = '#ff6600';
        // Left bolt
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 8);
        ctx.lineTo(cx - 4, cy);
        ctx.lineTo(cx - 8, cy);
        ctx.lineTo(cx - 2, cy - 10);
        ctx.lineTo(cx + 2, cy - 2);
        ctx.lineTo(cx - 2, cy - 2);
        ctx.closePath();
        ctx.fill();
        // Right bolt
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy + 8);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx + 2, cy - 10);
        ctx.lineTo(cx + 6, cy - 2);
        ctx.lineTo(cx + 2, cy - 2);
        ctx.closePath();
        ctx.fill();

        return canvas.toDataURL();
    }

    // Power-up: Speed boost
    static createSpeedPowerup(size = 32) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        glow.addColorStop(0, '#ffff0040');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Lightning bolt
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.moveTo(cx + 6, cy - 12);
        ctx.lineTo(cx - 2, cy - 2);
        ctx.lineTo(cx + 4, cy - 2);
        ctx.lineTo(cx - 6, cy + 12);
        ctx.lineTo(cx + 2, cy + 2);
        ctx.lineTo(cx - 4, cy + 2);
        ctx.closePath();
        ctx.fill();

        return canvas.toDataURL();
    }

    // Power-up: Health
    static createHealthPowerup(size = 32) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        glow.addColorStop(0, '#ff000040');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Heart shape
        ctx.fillStyle = '#ff4466';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10);
        ctx.bezierCurveTo(cx - 14, cy, cx - 14, cy - 10, cx - 7, cy - 10);
        ctx.bezierCurveTo(cx - 3, cy - 10, cx, cy - 5, cx, cy - 5);
        ctx.bezierCurveTo(cx, cy - 5, cx + 3, cy - 10, cx + 7, cy - 10);
        ctx.bezierCurveTo(cx + 14, cy - 10, cx + 14, cy, cx, cy + 10);
        ctx.fill();

        // Shine
        ctx.fillStyle = '#ff8899';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // UFO enemy
    static createUFO(size = 48, color = '#7a5caa') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Bottom glow (tractor beam hint)
        const glow = ctx.createRadialGradient(cx, cy + 8, 0, cx, cy + 10, size * 0.4);
        glow.addColorStop(0, '#44ff4440');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);

        // Saucer body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dome
        ctx.fillStyle = this.lightenColor(color, 20);
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, size * 0.2, size * 0.15, 0, Math.PI, 0);
        ctx.fill();

        // Dome window
        ctx.fillStyle = '#aaffaa';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4, size * 0.1, size * 0.08, 0, Math.PI, 0);
        ctx.fill();

        // Lights
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(cx - 12, cy + 4, 2, 0, Math.PI * 2);
        ctx.arc(cx + 12, cy + 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 2, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // Satellite
    static createSatellite(size = 40) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Solar panels
        ctx.fillStyle = '#2244aa';
        ctx.fillRect(cx - size * 0.45, cy - 4, size * 0.3, 8);
        ctx.fillRect(cx + size * 0.15, cy - 4, size * 0.3, 8);

        // Panel grid
        ctx.strokeStyle = '#4466cc';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - size * 0.42 + i * 4, cy - 3);
            ctx.lineTo(cx - size * 0.42 + i * 4, cy + 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + size * 0.18 + i * 4, cy - 3);
            ctx.lineTo(cx + size * 0.18 + i * 4, cy + 3);
            ctx.stroke();
        }

        // Body
        ctx.fillStyle = '#888899';
        this.roundRect(ctx, cx - 6, cy - 8, 12, 16, 2);

        // Antenna dish
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 5, Math.PI, 0);
        ctx.fill();

        // Signal
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy - 12, 3, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();

        return canvas.toDataURL();
    }

    // Wormhole/portal
    static createWormhole(size = 64, color = '#9933ff') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Swirl effect - multiple rings
        for (let i = 5; i >= 0; i--) {
            const r = (size / 2 - 4) * (i / 5);
            const alpha = 0.3 + (5 - i) * 0.1;
            const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center bright spot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 4, 0, Math.PI * 2);
        ctx.stroke();

        return canvas.toDataURL();
    }

    // Comet
    static createComet(size = 48) {
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size * 0.3, cy = size / 2;

        // Tail gradient
        const tailGrad = ctx.createLinearGradient(cx, cy, size * 2, cy);
        tailGrad.addColorStop(0, '#ffffcc');
        tailGrad.addColorStop(0.3, '#ffcc66');
        tailGrad.addColorStop(0.6, '#ff884420');
        tailGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.quadraticCurveTo(size, cy - 10, size * 2, cy);
        ctx.quadraticCurveTo(size, cy + 10, cx, cy + 6);
        ctx.closePath();
        ctx.fill();

        // Core
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#ffffaa');
        coreGrad.addColorStop(1, '#ffaa44');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // Mine/hazard
    static createMine(size = 32) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cx = size / 2, cy = size / 2;

        // Spikes
        ctx.fillStyle = '#444444';
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * 6, cy + Math.sin(ang) * 6);
            ctx.lineTo(cx + Math.cos(ang - 0.2) * 14, cy + Math.sin(ang - 0.2) * 14);
            ctx.lineTo(cx + Math.cos(ang + 0.2) * 14, cy + Math.sin(ang + 0.2) * 14);
            ctx.closePath();
            ctx.fill();
        }

        // Core
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Warning light
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    static lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    static darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}
