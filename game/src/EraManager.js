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
     * Draw 8-bit era background - MASSIVELY ENHANCED retro aesthetic
     * Features: Rich building variety, animated elements, traffic, atmospheric details
     */
    draw8BitBackground() {
        const g = this.backgroundGraphics;
        const mg = this.midgroundGraphics;
        const fg = this.foregroundGraphics;

        // ============================================================
        // SKY - Enhanced 5-layer gradient for depth
        // ============================================================
        g.fillStyle(0x081820, 1);
        g.fillRect(0, 0, 1280, 120);

        g.fillStyle(0x0a2028, 1);
        g.fillRect(0, 120, 1280, 100);

        g.fillStyle(0x0F380F, 1);
        g.fillRect(0, 220, 1280, 100);

        g.fillStyle(0x1a4a1a, 1);
        g.fillRect(0, 320, 1280, 80);

        g.fillStyle(0x306230, 1);
        g.fillRect(0, 400, 1280, 50);

        // ============================================================
        // STARS - Multi-layer starfield with variety
        // ============================================================

        // Large bright stars
        for (let i = 0; i < 15; i++) {
            const x = (i * 97) % 1280;
            const y = (i * 37) % 180;
            const twinkle = Math.sin(this.animationTimer * 2 + i) * 0.5 + 0.5;
            g.fillStyle(0x9BBC0F, 0.6 + twinkle * 0.4);
            g.fillRect(x, y, 3, 3);
            // Star cross pattern
            g.fillRect(x - 1, y + 1, 1, 1);
            g.fillRect(x + 3, y + 1, 1, 1);
            g.fillRect(x + 1, y - 1, 1, 1);
            g.fillRect(x + 1, y + 3, 1, 1);
        }

        // Medium stars
        for (let i = 0; i < 35; i++) {
            const x = (i * 67 + 30) % 1280;
            const y = (i * 43) % 250;
            const twinkle = Math.floor(this.animationTimer * 3 + i) % 4;
            if (twinkle > 0) {
                g.fillStyle(0x9BBC0F, 0.7);
                g.fillRect(x, y, 2, 2);
            }
        }

        // Small stars (dense)
        for (let i = 0; i < 50; i++) {
            const x = (i * 53 + 60) % 1280;
            const y = (i * 31 + 20) % 300;
            const phase = Math.floor(this.animationTimer * 4 + i) % 6;
            if (phase < 4) {
                g.fillStyle(0x8BAC0F, 0.5);
                g.fillRect(x, y, 1, 1);
            }
        }

        // ============================================================
        // CLOUDS - Drifting pixel clouds
        // ============================================================
        g.fillStyle(0x0F380F, 0.4);
        for (let i = 0; i < 6; i++) {
            const cloudX = (i * 240 + this.bgScrollX * 0.15) % 1400 - 100;
            const cloudY = 180 + (i % 3) * 40;

            // Cloud shape
            g.fillRect(cloudX + 10, cloudY, 30, 8);
            g.fillRect(cloudX + 5, cloudY + 8, 40, 8);
            g.fillRect(cloudX, cloudY + 16, 50, 8);
            g.fillRect(cloudX + 5, cloudY + 24, 40, 8);
            g.fillRect(cloudX + 15, cloudY + 32, 20, 4);
        }

        // ============================================================
        // FLYING BIRDS
        // ============================================================
        g.fillStyle(0x081820, 0.8);
        for (let i = 0; i < 8; i++) {
            const birdX = (i * 190 + this.bgScrollX * 0.6 + this.animationTimer * 80) % 1400 - 100;
            const birdY = 150 + (i % 4) * 60 + Math.sin(this.animationTimer * 2 + i) * 10;
            const wingFlap = Math.floor(this.animationTimer * 8 + i) % 2;

            // Bird body
            g.fillRect(birdX, birdY, 4, 2);
            // Wings
            if (wingFlap === 0) {
                g.fillRect(birdX - 3, birdY, 2, 1);
                g.fillRect(birdX + 4, birdY, 2, 1);
            } else {
                g.fillRect(birdX - 2, birdY - 2, 2, 2);
                g.fillRect(birdX + 4, birdY - 2, 2, 2);
            }
        }

        // ============================================================
        // MOUNTAINS - Varied silhouettes
        // ============================================================
        g.fillStyle(0x0F380F, 0.5);
        for (let i = 0; i < 12; i++) {
            const x = (i * 140 + this.bgScrollX * 0.25) % 1500 - 150;
            const height = 70 + (i % 4) * 35;
            const style = i % 3;

            if (style === 0) {
                g.fillTriangle(x, 400, x + 100, 400, x + 50, 400 - height);
            } else if (style === 1) {
                g.fillTriangle(x, 400, x + 60, 400, x + 30, 400 - height);
                g.fillTriangle(x + 40, 400, x + 100, 400, x + 70, 400 - height + 15);
            } else {
                g.fillRect(x, 400 - height, 90, height);
                g.fillTriangle(x, 400 - height, x + 45, 400 - height - 20, x + 90, 400 - height);
            }
        }

        // ============================================================
        // PERSPECTIVE GRID - Enhanced
        // ============================================================
        g.lineStyle(1, 0x9BBC0F, 0.35);
        for (let i = 0; i < 18; i++) {
            const y = 420 + i * 18;
            const perspectiveOffset = (i / 18) * 70;
            const alpha = 0.25 + (i / 18) * 0.25;
            const thickness = i > 12 ? 2 : 1;

            g.lineStyle(thickness, 0x9BBC0F, alpha);
            g.lineBetween(-perspectiveOffset + (this.bgScrollX * 0.5) % 100, y,
                         1280 + perspectiveOffset + (this.bgScrollX * 0.5) % 100, y);
        }

        // Vertical grid lines
        g.lineStyle(1, 0x9BBC0F, 0.3);
        for (let x = 0; x < 1500; x += 45) {
            const scrolledX = (x + this.bgScrollX * 0.7) % 1500 - 100;
            g.lineBetween(scrolledX, 420, scrolledX + 15, 650);
        }

        // Grid intersection glow
        for (let i = 0; i < 18; i += 3) {
            for (let x = 0; x < 1500; x += 90) {
                const scrolledX = (x + this.bgScrollX * 0.7) % 1500 - 100;
                const y = 420 + i * 18;
                const pulse = Math.sin(this.animationTimer * 3 + x + i) * 0.3 + 0.5;
                if (pulse > 0.6) {
                    g.fillStyle(0x9BBC0F, pulse * 0.4);
                    g.fillRect(scrolledX, y, 2, 2);
                }
            }
        }

        // ============================================================
        // BUILDINGS - 5 different types with rich detail
        // ============================================================
        for (let i = 0; i < 18; i++) {
            const x = (i * 95 + this.mgScrollX) % 1600 - 150;
            const buildingType = i % 5;
            const height = 140 + (i % 5) * 45;
            const width = 55 + (i % 4) * 18;

            // Building shadow
            mg.fillStyle(0x081820, 0.3);
            mg.fillRect(x + 3, 603 - height, width, height);

            // Main building
            mg.fillStyle(0x306230, 1);
            mg.fillRect(x, 600 - height, width, height);

            // Building outline
            mg.lineStyle(1, 0x0F380F, 0.8);
            mg.strokeRect(x, 600 - height, width, height);

            // Type-specific details
            if (buildingType === 0) {
                // Office - regular windows
                mg.fillStyle(0x9BBC0F, 0.5);
                for (let wy = 15; wy < height - 10; wy += 20) {
                    for (let wx = 8; wx < width - 8; wx += 12) {
                        const lightOn = Math.floor(this.animationTimer * 2 + i + wx + wy) % 5;
                        if (lightOn > 0) {
                            mg.fillRect(x + wx, 600 - height + wy, 8, 12);
                        }
                    }
                }
                mg.fillStyle(0x0F380F, 1);
                mg.fillRect(x + width * 0.3, 600 - height - 8, width * 0.4, 8);

            } else if (buildingType === 1) {
                // Apartment - balconies
                for (let floor = 0; floor < Math.floor(height / 25); floor++) {
                    const floorY = 600 - height + floor * 25 + 10;
                    mg.lineStyle(1, 0x0F380F, 1);
                    mg.lineBetween(x + 5, floorY + 5, x + width - 5, floorY + 5);
                    mg.fillStyle(0x9BBC0F, 0.6);
                    for (let wx = 8; wx < width - 8; wx += 16) {
                        const lightOn = Math.floor(this.animationTimer + i + wx + floor) % 4;
                        if (lightOn > 0) {
                            mg.fillRect(x + wx, floorY - 8, 10, 12);
                        }
                    }
                }
                // Water tower
                mg.fillStyle(0x306230, 1);
                mg.fillRect(x + width * 0.35, 600 - height - 18, width * 0.3, 10);
                mg.fillRect(x + width * 0.4, 600 - height - 24, width * 0.2, 6);

            } else if (buildingType === 2) {
                // Commercial - storefront
                mg.fillStyle(0x9BBC0F, 0.8);
                mg.fillRect(x + 5, 600 - 40, width - 10, 35);
                mg.fillStyle(0x0F380F, 1);
                mg.fillRect(x + 3, 600 - 42, width - 6, 4);
                // Upper windows
                mg.fillStyle(0x9BBC0F, 0.5);
                for (let wy = 55; wy < height - 10; wy += 22) {
                    for (let wx = 10; wx < width - 10; wx += 14) {
                        const lightOn = Math.floor(this.animationTimer + i + wx) % 3;
                        if (lightOn > 0) {
                            mg.fillRect(x + wx, 600 - height + wy, 9, 14);
                        }
                    }
                }
                // Billboard
                const signFlash = Math.floor(this.animationTimer * 4 + i) % 3;
                if (signFlash > 0) {
                    mg.fillStyle(0x9BBC0F, 0.9);
                    mg.fillRect(x + width * 0.15, 600 - height - 15, width * 0.7, 12);
                }

            } else if (buildingType === 3) {
                // Industrial - smokestack
                mg.fillStyle(0x0F380F, 1);
                mg.fillRect(x + width * 0.2, 600 - height - 20, 4, 20 + height * 0.3);
                // Smoke
                const smokePhase = Math.floor(this.animationTimer + i) % 4;
                if (smokePhase < 2) {
                    mg.fillStyle(0x306230, 0.3);
                    const puffY = 600 - height - 25 - (smokePhase * 10);
                    mg.fillRect(x + width * 0.2 - 3, puffY, 10, 8);
                }
                // Windows
                mg.fillStyle(0x9BBC0F, 0.4);
                for (let wy = 20; wy < height - 20; wy += 35) {
                    for (let wx = 12; wx < width - 12; wx += 20) {
                        mg.fillRect(x + wx, 600 - height + wy, 12, 20);
                    }
                }

            } else {
                // Mixed use - fire escape
                mg.fillStyle(0x9BBC0F, 0.6);
                for (let wy = 15; wy < height - 10; wy += 24) {
                    for (let wx = 6; wx < width - 6; wx += 18) {
                        const lightOn = Math.floor(this.animationTimer * 1.5 + i + wx) % 4;
                        if (lightOn > 0) {
                            mg.fillRect(x + wx, 600 - height + wy, 10, 14);
                        }
                    }
                }
                // Fire escape
                mg.lineStyle(1, 0x0F380F, 1);
                const escapeX = x + width - 8;
                for (let floor = 0; floor < Math.floor(height / 30); floor++) {
                    const floorY = 600 - height + 20 + floor * 30;
                    mg.strokeRect(escapeX, floorY, 6, 25);
                }
            }

            // Antenna/satellite
            if (i % 3 === 0) {
                mg.fillStyle(0x0F380F, 1);
                mg.fillRect(x + width/2 - 1, 600 - height - 25, 2, 25);
                const blink = Math.floor(this.animationTimer * 2 + i) % 2;
                if (blink === 0) {
                    mg.fillStyle(0xFF0000, 0.9);
                    mg.fillRect(x + width/2 - 2, 600 - height - 27, 4, 3);
                }
            }
        }

        // ============================================================
        // GROUND - Enhanced with details
        // ============================================================
        fg.fillStyle(0x8BAC0F, 1);
        fg.fillRect(0, 600, 1280, 120);

        // Ground shading
        fg.fillStyle(0x306230, 0.15);
        fg.fillRect(0, 600, 1280, 25);

        // Street tiles
        fg.fillStyle(0x306230, 1);
        for (let x = 0; x < 1350; x += 40) {
            const fx = (x + this.fgScrollX) % 1350;
            fg.fillRect(fx, 600, 2, 120);
            fg.fillRect(fx, 600, 40, 2);
            fg.fillRect(fx, 615, 40, 1);
            fg.fillRect(fx, 630, 40, 1);
        }

        // Ground blocks
        fg.fillStyle(0x0F380F, 0.25);
        for (let x = 0; x < 1350; x += 40) {
            const fx = (x + this.fgScrollX * 1.2) % 1350;
            fg.fillRect(fx + 3, 603, 34, 114);
        }

        // Street lamps with glow
        fg.fillStyle(0x0F380F, 1);
        for (let i = 0; i < 7; i++) {
            const lampX = (i * 185 + this.fgScrollX * 0.95) % 1500 - 100;
            fg.fillRect(lampX, 550, 3, 50);
            fg.fillRect(lampX - 4, 545, 11, 6);
            const glow = Math.sin(this.animationTimer * 1.5 + i) * 0.2 + 0.8;
            fg.fillStyle(0x9BBC0F, glow * 0.4);
            fg.fillRect(lampX - 6, 551, 15, 8);
            fg.fillStyle(0x9BBC0F, 0.1);
            fg.fillTriangle(lampX + 1.5, 551, lampX - 15, 600, lampX + 18, 600);
            fg.fillStyle(0x0F380F, 1);
        }

        // Moving cars
        for (let i = 0; i < 3; i++) {
            const carX = (i * 420 + this.fgScrollX * 2.5 + this.animationTimer * 150) % 1600 - 100;
            const carY = 570 + (i % 2) * 15;

            fg.fillStyle(0x306230, 1);
            fg.fillRect(carX, carY, 28, 12);
            fg.fillRect(carX + 6, carY - 6, 16, 6);
            fg.fillStyle(0x081820, 1);
            fg.fillRect(carX + 4, carY + 10, 4, 3);
            fg.fillRect(carX + 20, carY + 10, 4, 3);
            fg.fillStyle(0x9BBC0F, 0.7);
            fg.fillRect(carX + 26, carY + 2, 2, 3);
            fg.fillRect(carX + 26, carY + 7, 2, 3);
        }

        // Ground edge highlight
        fg.lineStyle(2, 0x9BBC0F, 0.3);
        fg.lineBetween(0, 600, 1280, 600);
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

        // Mid-ground city with detailed buildings (increased from 12 to 18)
        for (let i = 0; i < 18; i++) {
            const x = (i * 100 + this.mgScrollX) % 2000 - 150;
            const height = 220 + (i % 4) * 55;
            const width = 75 + (i % 3) * 20;

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

        // Flying vehicles (hovercars) - adds life to the scene
        for (let i = 0; i < 4; i++) {
            const vx = (i * 400 + this.animationTimer * 150 + i * 80) % 1600 - 200;
            const vy = 250 + (i % 2) * 100 + Math.sin(this.animationTimer * 2 + i) * 15;

            // Vehicle body
            mg.fillStyle(0x7209B7, 0.8);
            mg.fillRect(vx, vy, 32, 14);

            // Glowing headlights
            const headlightPulse = Math.sin(this.animationTimer * 8 + i) * 0.3 + 0.7;
            mg.fillStyle(0x00FFFF, headlightPulse);
            mg.fillCircle(vx + 30, vy + 7, 4);

            // Light trail
            mg.fillStyle(0xFF00FF, 0.3);
            mg.fillRect(vx - 20, vy + 5, 20, 4);
        }

        // Holographic billboards/advertisements
        for (let i = 0; i < 3; i++) {
            const bx = (i * 450 + this.mgScrollX * 0.7) % 1500 - 150;
            const by = 300 + (i % 2) * 80;

            // Billboard frame
            mg.lineStyle(2, 0x9D4EDD, 0.6);
            mg.strokeRect(bx, by, 80, 45);

            // Holographic content (animated scan lines)
            const scanPhase = Math.floor(this.animationTimer * 6 + i) % 8;
            for (let sy = 0; sy < 45; sy += 6) {
                const scanAlpha = sy === scanPhase * 6 ? 0.9 : 0.3;
                mg.fillStyle(i % 2 === 0 ? 0x00FFFF : 0xFF00FF, scanAlpha);
                mg.fillRect(bx + 2, by + sy, 76, 4);
            }
        }

        // Atmospheric lighting beams from buildings
        for (let i = 0; i < 5; i++) {
            const lx = (i * 280 + this.bgScrollX * 0.3) % 1400 - 100;
            const beamAlpha = (Math.sin(this.animationTimer * 1.5 + i) * 0.15 + 0.15);

            mg.fillStyle(0x7209B7, beamAlpha);
            // Vertical light beam
            mg.fillRect(lx, 200, 8, 250);

            // Beam glow
            mg.fillStyle(0xFF00FF, beamAlpha * 0.5);
            mg.fillRect(lx - 2, 200, 12, 250);
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
