/**
 * EraManager - Manages era transitions and visual styles
 * Cycles through 8-bit, 16-bit, and Neon eras every 10 seconds
 */
class EraManager {
    constructor(scene, player, obstacleManager, particleSystem, audioManager) {
        this.scene = scene;
        this.player = player;
        this.obstacleManager = obstacleManager;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;

        // Era configuration
        this.eras = ['8bit', '16bit', 'neon'];
        this.currentEraIndex = 0;
        this.currentEra = this.eras[0];
        this.eraTimer = 0;
        this.eraDuration = 10; // 10 seconds per era
        this.erasCompleted = 0;

        // Transition state
        this.isTransitioning = false;
        this.transitionTimer = 0;
        this.transitionDuration = 1.5;
        this.transitionPhase = 0; // 0-5 for different visual phases

        // Background layers
        this.backgroundGraphics = scene.add.graphics();
        this.midgroundGraphics = scene.add.graphics();
        this.foregroundGraphics = scene.add.graphics();

        // Parallax positions
        this.bgScrollX = 0;
        this.mgScrollX = 0;
        this.fgScrollX = 0;

        // Animation timers
        this.animationTimer = 0;

        // Set initial era
        this.setEra(this.currentEra);
    }

    /**
     * Update era timer and handle transitions
     */
    update(delta, isPaused = false) {
        if (isPaused) return;

        const deltaSeconds = delta / 1000;
        this.animationTimer += deltaSeconds;

        if (this.isTransitioning) {
            this.updateTransition(deltaSeconds);
        } else {
            // Update era timer
            this.eraTimer += deltaSeconds;

            if (this.eraTimer >= this.eraDuration) {
                this.startTransition();
            }

            // Update background animations
            this.updateBackground(deltaSeconds);
        }
    }

    /**
     * Start era transition
     */
    startTransition() {
        this.isTransitioning = true;
        this.transitionTimer = 0;
        this.transitionPhase = 0;

        // Add era survival bonus
        this.obstacleManager.score += 100;
        this.erasCompleted++;

        this.audioManager.playSFX('transition');
    }

    /**
     * Update transition effects
     */
    updateTransition(deltaSeconds) {
        this.transitionTimer += deltaSeconds;
        const progress = this.transitionTimer / this.transitionDuration;

        // Update transition phase
        if (progress < 0.13) {
            this.transitionPhase = 0; // Flash
        } else if (progress < 0.33) {
            this.transitionPhase = 1; // Fade out old era
        } else if (progress < 0.53) {
            this.transitionPhase = 2; // Glitch effect
        } else if (progress < 0.86) {
            this.transitionPhase = 3; // Fade in new era
        } else {
            this.transitionPhase = 4; // Complete
        }

        // Apply visual effects
        this.applyTransitionEffect();

        // Screen shake during transition
        if (progress < 0.2) {
            this.scene.cameras.main.shake(200, 0.005);
        }

        // Complete transition
        if (this.transitionTimer >= this.transitionDuration) {
            this.completeTransition();
        }
    }

    /**
     * Apply visual transition effects
     */
    applyTransitionEffect() {
        const camera = this.scene.cameras.main;

        switch(this.transitionPhase) {
            case 0:
                // White flash
                camera.flash(100, 255, 255, 255);
                break;

            case 2:
                // Glitch effect (shift camera slightly)
                const glitchX = Phaser.Math.Between(-10, 10);
                const glitchY = Phaser.Math.Between(-5, 5);
                camera.scrollX = glitchX;
                camera.scrollY = glitchY;
                break;

            case 4:
                // Reset camera
                camera.scrollX = 0;
                camera.scrollY = 0;
                break;
        }
    }

    /**
     * Complete era transition
     */
    completeTransition() {
        this.isTransitioning = false;
        this.eraTimer = 0;

        // Move to next era
        this.currentEraIndex = (this.currentEraIndex + 1) % this.eras.length;
        this.currentEra = this.eras[this.currentEraIndex];

        this.setEra(this.currentEra);

        // Give player brief invincibility
        this.player.makeInvincible(0.15);

        // Transition music
        const musicTrack = `era_${this.currentEra}`;
        this.audioManager.playTrack(musicTrack, true, 1000);
    }

    /**
     * Set current era and update all systems
     */
    setEra(era) {
        this.currentEra = era;
        this.player.setEra(era);
        this.obstacleManager.setEra(era);
        this.particleSystem.setEra(era);
        this.drawBackground();
    }

    /**
     * Update background parallax scrolling
     */
    updateBackground(deltaSeconds) {
        const baseSpeed = this.obstacleManager.currentSpeed;

        // Different parallax speeds for each layer
        this.bgScrollX -= baseSpeed * 0.2 * deltaSeconds;
        this.mgScrollX -= baseSpeed * 0.5 * deltaSeconds;
        this.fgScrollX -= baseSpeed * 1.0 * deltaSeconds;

        // Wrap around
        if (this.bgScrollX < -1280) this.bgScrollX += 1280;
        if (this.mgScrollX < -1280) this.mgScrollX += 1280;
        if (this.fgScrollX < -1280) this.fgScrollX += 1280;

        this.drawBackground();
    }

    /**
     * Draw background based on current era
     */
    drawBackground() {
        this.backgroundGraphics.clear();
        this.midgroundGraphics.clear();
        this.foregroundGraphics.clear();

        switch(this.currentEra) {
            case '8bit':
                this.draw8BitBackground();
                break;
            case '16bit':
                this.draw16BitBackground();
                break;
            case 'neon':
                this.drawNeonBackground();
                break;
        }
    }

    /**
     * Draw 8-bit era background
     */
    draw8BitBackground() {
        const g = this.backgroundGraphics;

        // Sky
        g.fillStyle(0x0F380F, 1);
        g.fillRect(0, 0, 1280, 720);

        // Static grid lines
        g.lineStyle(1, 0x9BBC0F, 0.3);
        for (let x = 0; x < 1280; x += 40) {
            g.lineBetween(x + this.bgScrollX, 0, x + this.bgScrollX, 720);
        }
        for (let y = 0; y < 720; y += 40) {
            g.lineBetween(0, y, 1280, y);
        }

        // Simple building silhouettes
        g.fillStyle(0x306230, 1);
        for (let i = 0; i < 10; i++) {
            const x = (i * 150 + this.bgScrollX) % 1280;
            const height = 100 + (i % 3) * 50;
            g.fillRect(x, 300 - height, 80, height);
        }

        // Ground
        g.fillStyle(0x8BAC0F, 1);
        g.fillRect(0, 600, 1280, 120);

        // Ground pattern
        g.fillStyle(0x306230, 1);
        for (let x = 0; x < 1280; x += 20) {
            g.fillRect((x + this.fgScrollX) % 1280, 600, 10, 120);
        }
    }

    /**
     * Draw 16-bit era background
     */
    draw16BitBackground() {
        const g = this.backgroundGraphics;

        // Gradient sky
        g.fillStyle(0x1a0a2e, 1);
        g.fillRect(0, 0, 1280, 360);
        g.fillStyle(0x3d1a5f, 1);
        g.fillRect(0, 360, 1280, 360);

        // Distant city (background layer)
        g.fillStyle(0x5a2a7e, 0.6);
        for (let i = 0; i < 15; i++) {
            const x = (i * 100 + this.bgScrollX * 0.5) % 1400 - 100;
            const height = 150 + (i % 4) * 40;
            g.fillRect(x, 300 - height, 60, height);
        }

        // Mid-ground city
        g.fillStyle(0x7209B7, 0.8);
        for (let i = 0; i < 10; i++) {
            const x = (i * 150 + this.mgScrollX) % 1500 - 150;
            const height = 200 + (i % 3) * 60;

            g.fillRect(x, 400 - height, 100, height);

            // Neon signs (animated)
            if (Math.floor(this.animationTimer * 2 + i) % 2 === 0) {
                g.fillStyle(0x00FFFF, 0.8);
                g.fillRect(x + 10, 300 - height, 20, 10);
                g.fillStyle(0xFF00FF, 0.8);
                g.fillRect(x + 70, 320 - height, 20, 10);
            }
            g.fillStyle(0x7209B7, 0.8);
        }

        // Ground
        g.fillStyle(0x2d1b4e, 1);
        g.fillRect(0, 600, 1280, 120);

        // Ground details
        g.lineStyle(2, 0x9D4EDD, 0.8);
        for (let x = 0; x < 1280; x += 30) {
            const fx = (x + this.fgScrollX) % 1280;
            g.lineBetween(fx, 600, fx + 10, 620);
        }
    }

    /**
     * Draw neon era background
     */
    drawNeonBackground() {
        const g = this.backgroundGraphics;

        // Dark gradient sky
        g.fillStyle(0x0a0a0a, 1);
        g.fillRect(0, 0, 1280, 300);
        g.fillStyle(0x1a0a2e, 1);
        g.fillRect(0, 300, 1280, 300);

        // Starfield (background)
        for (let i = 0; i < 50; i++) {
            const x = (i * 50 + this.bgScrollX * 0.1) % 1280;
            const y = (i * 37) % 300;
            const brightness = Math.sin(this.animationTimer + i) * 0.5 + 0.5;
            g.fillStyle(0xFFFFFF, brightness);
            g.fillCircle(x, y, 1);
        }

        // Distant city with neon
        const mg = this.midgroundGraphics;
        for (let i = 0; i < 12; i++) {
            const x = (i * 120 + this.mgScrollX) % 1500 - 150;
            const height = 250 + (i % 4) * 50;

            // Building body
            mg.fillStyle(0x1a1a2e, 1);
            mg.fillRect(x, 400 - height, 90, height);

            // Neon outline
            mg.lineStyle(2, 0x00FFFF, 0.8);
            mg.strokeRect(x, 400 - height, 90, height);

            // Glowing windows
            const windowColor = i % 2 === 0 ? 0x00FFFF : 0xFF00FF;
            mg.fillStyle(windowColor, 0.6);
            for (let wy = 20; wy < height - 20; wy += 30) {
                for (let wx = 10; wx < 80; wx += 20) {
                    mg.fillRect(x + wx, 400 - height + wy, 15, 20);
                }
            }
        }

        // Animated grid floor
        const fg = this.foregroundGraphics;
        fg.lineStyle(2, 0xFF00FF, 0.4);

        // Horizontal lines
        for (let y = 600; y < 720; y += 20) {
            const perspective = (y - 600) / 120;
            const lineY = y;
            fg.lineBetween(0, lineY, 1280, lineY);
        }

        // Vertical lines (with perspective)
        for (let x = 0; x < 1280; x += 40) {
            const fx = (x + this.fgScrollX) % 1280;
            fg.lineBetween(fx, 600, fx + 20, 720);
        }

        // Volumetric light beams
        fg.fillStyle(0x00FFFF, 0.05);
        for (let i = 0; i < 5; i++) {
            const x = (i * 250 + this.animationTimer * 20) % 1280;
            fg.fillTriangle(x, 0, x - 50, 720, x + 50, 720);
        }

        // Ground glow
        fg.fillStyle(0xFF00FF, 0.2);
        fg.fillRect(0, 600, 1280, 10);
    }

    /**
     * Get era progress (0-1)
     */
    getEraProgress() {
        return this.eraTimer / this.eraDuration;
    }

    /**
     * Get current era name for display
     */
    getEraName() {
        switch(this.currentEra) {
            case '8bit': return '8-BIT';
            case '16bit': return '16-BIT';
            case 'neon': return 'NEON';
            default: return 'UNKNOWN';
        }
    }

    /**
     * Reset era system
     */
    reset() {
        this.currentEraIndex = 0;
        this.currentEra = this.eras[0];
        this.eraTimer = 0;
        this.erasCompleted = 0;
        this.isTransitioning = false;
        this.setEra(this.currentEra);
    }

    /**
     * Clean up
     */
    destroy() {
        this.backgroundGraphics.destroy();
        this.midgroundGraphics.destroy();
        this.foregroundGraphics.destroy();
    }
}
