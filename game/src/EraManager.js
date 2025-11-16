/**
 * EraManager - Manages era transitions and visual styles
 * Cycles through 8-bit, 16-bit, and Neon eras every 10 seconds
 */
class EraManager {
    constructor(scene, player, obstacleManager, particleSystem, audioManager, screenEffects = null) {
        this.scene = scene;
        this.player = player;
        this.obstacleManager = obstacleManager;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;
        this.screenEffects = screenEffects;

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

        // Background layers - all behind obstacles for clear gameplay visibility
        this.backgroundGraphics = scene.add.graphics();
        this.backgroundGraphics.setDepth(0); // Furthest back
        this.midgroundGraphics = scene.add.graphics();
        this.midgroundGraphics.setDepth(2); // Middle layer
        this.foregroundGraphics = scene.add.graphics();
        this.foregroundGraphics.setDepth(4); // Front background layer - behind screen effects

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
        if (this.screenEffects) {
            this.screenEffects.setEra(era);
        }
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
     * Draw 8-bit era background - Enhanced retro aesthetic
     */
    draw8BitBackground() {
        const g = this.backgroundGraphics;
        const mg = this.midgroundGraphics;
        const fg = this.foregroundGraphics;

        // Sky gradient (darker at top, lighter at horizon)
        g.fillStyle(0x081820, 1);
        g.fillRect(0, 0, 1280, 200);
        g.fillStyle(0x0F380F, 1);
        g.fillRect(0, 200, 1280, 200);
        g.fillStyle(0x306230, 1);
        g.fillRect(0, 400, 1280, 200);

        // Pixelated stars in background
        for (let i = 0; i < 30; i++) {
            const x = (i * 67) % 1280;
            const y = (i * 43) % 300;
            const twinkle = Math.floor(this.animationTimer * 3 + i) % 3;
            if (twinkle === 0) {
                g.fillStyle(0x9BBC0F, 0.8);
                g.fillRect(x, y, 2, 2);
            }
        }

        // Distant mountain silhouettes
        g.fillStyle(0x0F380F, 0.6);
        for (let i = 0; i < 8; i++) {
            const x = (i * 180 + this.bgScrollX * 0.3) % 1400 - 100;
            const height = 80 + (i % 3) * 30;
            // Triangle mountain
            g.fillTriangle(x, 400, x + 90, 400, x + 45, 400 - height);
        }

        // Animated grid lines (perspective grid)
        g.lineStyle(1, 0x9BBC0F, 0.4);
        for (let i = 0; i < 15; i++) {
            const y = 420 + i * 20;
            const perspectiveOffset = (i / 15) * 50;
            g.lineBetween(-perspectiveOffset + (this.bgScrollX * 0.5) % 100, y,
                         1280 + perspectiveOffset + (this.bgScrollX * 0.5) % 100, y);
        }

        // Vertical grid lines
        for (let x = 0; x < 1400; x += 40) {
            const scrolledX = (x + this.bgScrollX * 0.7) % 1400 - 100;
            g.lineBetween(scrolledX, 420, scrolledX, 600);
        }

        // Pixelated building silhouettes (midground)
        mg.fillStyle(0x306230, 1);
        for (let i = 0; i < 15; i++) {
            const x = (i * 120 + this.bgScrollX) % 1400 - 100;
            const height = 120 + (i % 4) * 40;
            const width = 60 + (i % 3) * 20;

            // Building body
            mg.fillRect(x, 600 - height, width, height);

            // Pixelated windows
            mg.fillStyle(0x9BBC0F, 0.6);
            for (let wy = 20; wy < height - 10; wy += 25) {
                for (let wx = 10; wx < width - 10; wx += 15) {
                    if (Math.floor(this.animationTimer + i + wx) % 4 === 0) {
                        mg.fillRect(x + wx, 600 - height + wy, 8, 8);
                    }
                }
            }
            mg.fillStyle(0x306230, 1);

            // Antenna on some buildings
            if (i % 3 === 0) {
                mg.fillRect(x + width/2 - 2, 600 - height - 15, 4, 15);
                mg.fillStyle(0xFF0000, 0.8);
                mg.fillRect(x + width/2 - 3, 600 - height - 18, 6, 3);
                mg.fillStyle(0x306230, 1);
            }
        }

        // Ground with detail
        fg.fillStyle(0x8BAC0F, 1);
        fg.fillRect(0, 600, 1280, 120);

        // Ground pattern (tile effect)
        fg.fillStyle(0x306230, 1);
        for (let x = 0; x < 1300; x += 40) {
            const fx = (x + this.fgScrollX) % 1300;
            fg.fillRect(fx, 600, 38, 2);
            fg.fillRect(fx, 610, 38, 2);
            fg.fillRect(fx, 620, 38, 2);
        }

        // Ground blocks
        fg.fillStyle(0x0F380F, 0.3);
        for (let x = 0; x < 1300; x += 40) {
            const fx = (x + this.fgScrollX * 1.2) % 1300;
            fg.fillRect(fx + 5, 605, 30, 110);
        }
    }

    /**
     * Draw 16-bit era background - Cyberpunk city
     */
    draw16BitBackground() {
        const g = this.backgroundGraphics;
        const mg = this.midgroundGraphics;
        const fg = this.foregroundGraphics;

        // Gradient sky with purple/pink tones
        g.fillStyle(0x0a0514, 1);
        g.fillRect(0, 0, 1280, 150);
        g.fillStyle(0x1a0a2e, 1);
        g.fillRect(0, 150, 1280, 150);
        g.fillStyle(0x3d1a5f, 1);
        g.fillRect(0, 300, 1280, 150);
        g.fillStyle(0x5a2a7e, 1);
        g.fillRect(0, 450, 1280, 150);

        // Distant stars
        for (let i = 0; i < 40; i++) {
            const x = (i * 61 + this.bgScrollX * 0.05) % 1280;
            const y = (i * 47) % 250;
            const pulse = Math.sin(this.animationTimer * 2 + i) * 0.3 + 0.7;
            g.fillStyle(0xFFFFFF, pulse * 0.6);
            g.fillCircle(x, y, 1);
        }

        // Distant city silhouettes with neon accents
        g.fillStyle(0x2a1440, 0.8);
        for (let i = 0; i < 18; i++) {
            const x = (i * 90 + this.bgScrollX * 0.4) % 1500 - 100;
            const height = 180 + (i % 5) * 35;
            const width = 50 + (i % 3) * 15;

            // Building
            g.fillRect(x, 450 - height, width, height);

            // Neon strip on building edge
            const neonColor = i % 3 === 0 ? 0x00FFFF : i % 3 === 1 ? 0xFF00FF : 0x9D4EDD;
            g.fillStyle(neonColor, 0.4);
            g.fillRect(x - 1, 450 - height, 2, height);
            g.fillRect(x + width - 1, 450 - height, 2, height);
            g.fillStyle(0x2a1440, 0.8);
        }

        // Mid-ground city with detailed buildings
        for (let i = 0; i < 12; i++) {
            const x = (i * 140 + this.mgScrollX) % 1600 - 150;
            const height = 220 + (i % 4) * 55;
            const width = 95 + (i % 3) * 20;

            // Building body
            mg.fillStyle(0x1a0a2e, 1);
            mg.fillRect(x, 600 - height, width, height);

            // Building outline glow
            mg.lineStyle(2, 0x7209B7, 0.6);
            mg.strokeRect(x, 600 - height, width, height);

            // Animated windows grid
            const windowColor = i % 2 === 0 ? 0x00FFFF : 0xFF00FF;
            for (let wy = 15; wy < height - 15; wy += 22) {
                for (let wx = 8; wx < width - 8; wx += 18) {
                    // Window flicker
                    const flicker = Math.floor(this.animationTimer * 4 + i + wx + wy) % 5;
                    if (flicker > 0) {
                        mg.fillStyle(windowColor, 0.5 + Math.sin(this.animationTimer + wx) * 0.2);
                        mg.fillRect(x + wx, 600 - height + wy, 12, 16);
                    }
                }
            }

            // Neon signs
            const signFlash = Math.floor(this.animationTimer * 3 + i) % 3;
            if (signFlash > 0) {
                mg.fillStyle(0x00FFFF, 0.9);
                mg.fillRect(x + 15, 600 - height + 30, 25, 12);
                mg.fillStyle(0xFF00FF, 0.9);
                mg.fillRect(x + width - 40, 600 - height + 50, 25, 12);
            }

            // Rooftop lights
            mg.fillStyle(0xFF0000, 0.7 + Math.sin(this.animationTimer * 5 + i) * 0.3);
            mg.fillCircle(x + width/2, 600 - height - 5, 3);
        }

        // Ground with wet reflection effect
        fg.fillStyle(0x1a0a2e, 1);
        fg.fillRect(0, 600, 1280, 120);

        // Reflective puddles
        fg.fillStyle(0x3d1a5f, 0.4);
        for (let i = 0; i < 8; i++) {
            const px = (i * 180 + this.fgScrollX * 0.8) % 1400 - 100;
            fg.fillEllipse(px, 640, 80, 15);
        }

        // Neon ground lines (like road markings)
        fg.lineStyle(3, 0x9D4EDD, 0.7);
        for (let x = 0; x < 1400; x += 60) {
            const fx = (x + this.fgScrollX) % 1400 - 100;
            fg.lineBetween(fx, 605, fx + 35, 605);
        }

        // Glowing ground edge
        fg.lineStyle(4, 0xFF00FF, 0.3);
        fg.lineBetween(0, 600, 1280, 600);
    }

    /**
     * Draw neon era background - Futuristic neon city
     */
    drawNeonBackground() {
        const g = this.backgroundGraphics;
        const mg = this.midgroundGraphics;
        const fg = this.foregroundGraphics;

        // Deep space gradient
        g.fillStyle(0x000000, 1);
        g.fillRect(0, 0, 1280, 180);
        g.fillStyle(0x0a0514, 1);
        g.fillRect(0, 180, 1280, 150);
        g.fillStyle(0x1a0a2e, 1);
        g.fillRect(0, 330, 1280, 150);
        g.fillStyle(0x0f0f1e, 1);
        g.fillRect(0, 480, 1280, 120);

        // Rich starfield with different sizes and brightness
        for (let i = 0; i < 80; i++) {
            const x = (i * 53 + this.bgScrollX * 0.08) % 1280;
            const y = (i * 41) % 400;
            const brightness = Math.sin(this.animationTimer * (1 + i % 3) + i) * 0.4 + 0.6;
            const size = i % 4 === 0 ? 2 : 1;

            // Main star
            g.fillStyle(0xFFFFFF, brightness);
            g.fillCircle(x, y, size);

            // Glow for larger stars
            if (size > 1) {
                g.fillStyle(0x00FFFF, brightness * 0.3);
                g.fillCircle(x, y, size + 2);
            }
        }

        // Shooting stars
        const shootingStar = Math.floor(this.animationTimer) % 10;
        if (shootingStar === 0) {
            const sx = (this.animationTimer * 300) % 1280;
            const sy = (this.animationTimer * 80) % 200;
            g.lineStyle(2, 0xFFFFFF, 0.7);
            g.lineBetween(sx, sy, sx - 40, sy + 20);
        }

        // Distant nebula effect
        g.fillStyle(0xFF00FF, 0.05);
        for (let i = 0; i < 3; i++) {
            const nx = (i * 400 + this.bgScrollX * 0.15) % 1400 - 100;
            g.fillCircle(nx, 150 + i * 50, 120);
        }
        g.fillStyle(0x00FFFF, 0.05);
        for (let i = 0; i < 3; i++) {
            const nx = (i * 450 + 200 + this.bgScrollX * 0.15) % 1400 - 100;
            g.fillCircle(nx, 200 + i * 40, 100);
        }

        // Massive neon city buildings
        for (let i = 0; i < 14; i++) {
            const x = (i * 115 + this.mgScrollX) % 1600 - 150;
            const height = 280 + (i % 5) * 60;
            const width = 85 + (i % 3) * 18;

            // Building shadow/depth
            mg.fillStyle(0x000000, 0.5);
            mg.fillRect(x + 5, 600 - height + 5, width, height);

            // Building body
            mg.fillStyle(0x0a0a1a, 1);
            mg.fillRect(x, 600 - height, width, height);

            // Intense neon outline
            const neonColor = i % 3 === 0 ? 0x00FFFF : i % 3 === 1 ? 0xFF00FF : 0x00FF00;
            mg.lineStyle(3, neonColor, 0.9);
            mg.strokeRect(x, 600 - height, width, height);

            // Glowing edges
            mg.lineStyle(1, neonColor, 0.4);
            mg.strokeRect(x - 2, 600 - height - 2, width + 4, height + 4);

            // Highly detailed animated windows
            const windowColor = i % 2 === 0 ? 0x00FFFF : 0xFF00FF;
            for (let wy = 18; wy < height - 18; wy += 24) {
                for (let wx = 10; wx < width - 10; wx += 16) {
                    const flicker = Math.sin(this.animationTimer * 5 + i + wx + wy) * 0.5 + 0.5;
                    if (flicker > 0.3) {
                        mg.fillStyle(windowColor, 0.6 + flicker * 0.3);
                        mg.fillRect(x + wx, 600 - height + wy, 10, 18);
                        // Window glow
                        mg.fillStyle(windowColor, 0.15);
                        mg.fillRect(x + wx - 1, 600 - height + wy - 1, 12, 20);
                    }
                }
            }

            // Large neon billboards
            const billboard = Math.floor(this.animationTimer * 2 + i) % 4;
            if (billboard > 1) {
                mg.fillStyle(neonColor, 0.95);
                mg.fillRect(x + width * 0.2, 600 - height + 40, width * 0.6, 25);
                // Billboard glow
                mg.fillStyle(neonColor, 0.3);
                mg.fillRect(x + width * 0.15, 600 - height + 35, width * 0.7, 35);
            }

            // Pulsing rooftop beacon
            const pulse = Math.sin(this.animationTimer * 8 + i) * 0.5 + 0.5;
            mg.fillStyle(0xFF0000, 0.8 + pulse * 0.2);
            mg.fillCircle(x + width/2, 600 - height - 8, 5);
            // Beacon glow
            mg.fillStyle(0xFF0000, 0.2 * pulse);
            mg.fillCircle(x + width/2, 600 - height - 8, 12);

            // Holographic advertising projections
            if (i % 4 === 0) {
                const holoPhase = (this.animationTimer + i) % 3;
                if (holoPhase < 2) {
                    mg.fillStyle(0x00FFFF, 0.15);
                    mg.fillRect(x - 30, 600 - height + 60, 30, 80);
                    mg.lineStyle(1, 0x00FFFF, 0.6);
                    mg.strokeRect(x - 30, 600 - height + 60, 30, 80);
                }
            }
        }

        // Ultra-detailed grid floor with perspective
        fg.fillStyle(0x000000, 1);
        fg.fillRect(0, 600, 1280, 120);

        // Perspective grid lines (horizontal)
        for (let i = 0; i < 8; i++) {
            const y = 600 + i * 15;
            const perspective = i / 8;
            const alpha = 0.5 + perspective * 0.5;
            const thickness = 1 + Math.floor(perspective * 3);

            fg.lineStyle(thickness, 0xFF00FF, alpha);
            const offset = perspective * 40;
            fg.lineBetween(-offset, y, 1280 + offset, y);
        }

        // Vertical grid lines (converging to horizon)
        fg.lineStyle(2, 0x00FFFF, 0.5);
        for (let x = 0; x < 1600; x += 50) {
            const fx = (x + this.fgScrollX) % 1600 - 200;
            fg.lineBetween(fx, 600, fx + 25, 720);
        }

        // Intersection glow points
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 16; j++) {
                const gx = (j * 50 + this.fgScrollX) % 1600 - 200 + 12;
                const gy = 600 + i * 15;
                const glow = Math.sin(this.animationTimer * 3 + i + j) * 0.3 + 0.4;
                fg.fillStyle(0xFF00FF, glow * 0.6);
                fg.fillCircle(gx, gy, 2);
            }
        }

        // Volumetric light beams from buildings - moved to background for better obstacle visibility
        g.fillStyle(0x00FFFF, 0.05);
        for (let i = 0; i < 7; i++) {
            const bx = (i * 180 + this.animationTimer * 15) % 1280;
            const wave = Math.sin(this.animationTimer + i) * 10;
            g.fillTriangle(bx + wave, 200, bx - 60, 720, bx + 60, 720);
        }

        g.fillStyle(0xFF00FF, 0.05);
        for (let i = 0; i < 6; i++) {
            const bx = (i * 200 + 100 + this.animationTimer * 12) % 1280;
            g.fillTriangle(bx, 250, bx - 50, 720, bx + 50, 720);
        }

        // Intense ground edge glow
        fg.lineStyle(6, 0xFF00FF, 0.6);
        fg.lineBetween(0, 600, 1280, 600);
        fg.lineStyle(3, 0x00FFFF, 0.8);
        fg.lineBetween(0, 601, 1280, 601);

        // Glowing particles floating above ground - moved to midground for better obstacle visibility
        for (let i = 0; i < 20; i++) {
            const px = (i * 70 + this.mgScrollX * 1.3) % 1400 - 100;
            const py = 550 + Math.sin(this.animationTimer * 2 + i) * 30;
            const pGlow = Math.sin(this.animationTimer * 4 + i) * 0.5 + 0.5;
            const pColor = i % 2 === 0 ? 0x00FFFF : 0xFF00FF;
            mg.fillStyle(pColor, pGlow * 0.3);
            mg.fillCircle(px, py, 2);
            mg.fillStyle(pColor, pGlow * 0.1);
            mg.fillCircle(px, py, 5);
        }
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
