/**
 * ScreenEffects - Adds visual polish with scanlines, vignette, and CRT effects
 */
class ScreenEffects {
    constructor(scene) {
        this.scene = scene;
        this.currentEra = '8bit';

        // Create effects layer (subtle background atmospheric effects)
        this.effectsGraphics = scene.add.graphics();
        this.effectsGraphics.setDepth(5); // Behind player/obstacles for subtle effect

        // Animation timer
        this.time = 0;
    }

    /**
     * Set current era for era-specific effects
     */
    setEra(era) {
        this.currentEra = era;
    }

    /**
     * Update and draw all screen effects
     */
    update(delta) {
        this.time += delta / 1000;
        this.draw();
    }

    /**
     * Draw all screen effects based on current era
     */
    draw() {
        this.effectsGraphics.clear();

        switch(this.currentEra) {
            case '8bit':
                this.draw8BitEffects();
                break;
            case '16bit':
                this.draw16BitEffects();
                break;
            case 'neon':
                this.drawNeonEffects();
                break;
        }

        // Always draw vignette (all eras)
        this.drawVignette();
    }

    /**
     * 8-bit era effects - Retro CRT scanlines
     */
    draw8BitEffects() {
        const g = this.effectsGraphics;

        // Horizontal scanlines
        g.lineStyle(1, 0x000000, 0.15);
        for (let y = 0; y < 720; y += 3) {
            g.lineBetween(0, y, 1280, y);
        }

        // Subtle screen flicker
        const flicker = Math.sin(this.time * 60) * 0.02;
        g.fillStyle(0x9BBC0F, Math.abs(flicker));
        g.fillRect(0, 0, 1280, 720);

        // Screen edge distortion (CRT curve simulation)
        g.fillStyle(0x0F380F, 0.2);
        g.fillRect(0, 0, 15, 720); // Left edge
        g.fillRect(1265, 0, 15, 720); // Right edge
        g.fillRect(0, 0, 1280, 10); // Top edge
        g.fillRect(0, 710, 1280, 10); // Bottom edge
    }

    /**
     * 16-bit era effects - Subtle scanlines with glow
     */
    draw16BitEffects() {
        const g = this.effectsGraphics;

        // Fine scanlines
        g.lineStyle(1, 0x000000, 0.12);
        for (let y = 0; y < 720; y += 2) {
            g.lineBetween(0, y, 1280, y);
        }

        // Chromatic aberration effect (very subtle)
        const aberration = Math.sin(this.time * 2) * 2;
        if (Math.abs(aberration) > 1) {
            g.fillStyle(0xFF00FF, 0.03);
            g.fillRect(0, 0, 1280, 720);
        }

        // Neon glow overlay
        g.fillStyle(0x7209B7, 0.03);
        g.fillRect(0, 0, 1280, 720);

        // Corner shadows for depth
        g.fillStyle(0x000000, 0.15);
        // Top-left corner
        g.fillTriangle(0, 0, 80, 0, 0, 80);
        // Top-right corner
        g.fillTriangle(1280, 0, 1200, 0, 1280, 80);
        // Bottom-left corner
        g.fillTriangle(0, 720, 0, 640, 80, 720);
        // Bottom-right corner
        g.fillTriangle(1280, 720, 1280, 640, 1200, 720);
    }

    /**
     * Neon era effects - Intense glow and atmospheric effects
     */
    drawNeonEffects() {
        const g = this.effectsGraphics;

        // Very fine scanlines (more subtle)
        g.lineStyle(1, 0x000000, 0.08);
        for (let y = 0; y < 720; y += 2) {
            g.lineBetween(0, y, 1280, y);
        }

        // Animated scan line (like old CRT)
        const scanY = (this.time * 200) % 720;
        g.lineStyle(2, 0x00FFFF, 0.15);
        g.lineBetween(0, scanY, 1280, scanY);

        // Atmospheric fog/mist effect
        const fogAlpha = Math.sin(this.time * 0.5) * 0.02 + 0.03;
        g.fillStyle(0x1a0a2e, fogAlpha);
        g.fillRect(0, 0, 1280, 300);

        // Light rays effect (subtle)
        for (let i = 0; i < 3; i++) {
            const rayX = (i * 400 + this.time * 30) % 1280;
            const rayAlpha = Math.sin(this.time + i) * 0.02 + 0.02;
            g.fillStyle(0x00FFFF, rayAlpha);
            g.fillTriangle(rayX, 0, rayX - 20, 300, rayX + 20, 300);
        }

        // Neon color bleeding effect
        const bleed = Math.sin(this.time * 1.5) * 0.015 + 0.015;
        g.fillStyle(0xFF00FF, bleed);
        g.fillRect(0, 0, 1280, 720);

        // Edge glow (like monitor backlight)
        g.fillStyle(0x00FFFF, 0.08);
        g.fillRect(0, 0, 1280, 5); // Top
        g.fillRect(0, 715, 1280, 5); // Bottom
        g.fillRect(0, 0, 5, 720); // Left
        g.fillRect(1275, 0, 5, 720); // Right
    }

    /**
     * Draw vignette effect (darker edges)
     */
    drawVignette() {
        const g = this.effectsGraphics;

        // Radial gradient simulation with concentric rectangles
        const steps = 12;
        for (let i = 0; i < steps; i++) {
            const progress = i / steps;
            const inset = (1 - progress) * 200;
            const alpha = progress * progress * 0.15; // Quadratic falloff - reduced for better visibility

            g.fillStyle(0x000000, alpha);
            g.fillRect(inset, inset, 1280 - inset * 2, 720 - inset * 2);
        }

        // Extra darkness at corners - reduced for better visibility
        g.fillStyle(0x000000, 0.08);
        // Top-left
        g.fillTriangle(0, 0, 150, 0, 0, 150);
        // Top-right
        g.fillTriangle(1280, 0, 1130, 0, 1280, 150);
        // Bottom-left
        g.fillTriangle(0, 720, 0, 570, 150, 720);
        // Bottom-right
        g.fillTriangle(1280, 720, 1280, 570, 1130, 720);
    }

    /**
     * Flash effect for transitions or hits
     */
    flash(color = 0xFFFFFF, duration = 100) {
        const g = this.effectsGraphics;

        // Full screen flash
        g.fillStyle(color, 0.6);
        g.fillRect(0, 0, 1280, 720);

        // Fade out
        this.scene.tweens.add({
            targets: { alpha: 0.6 },
            alpha: 0,
            duration: duration,
            onUpdate: (tween, target) => {
                g.clear();
                g.fillStyle(color, target.alpha);
                g.fillRect(0, 0, 1280, 720);
                this.draw(); // Redraw normal effects
            }
        });
    }

    /**
     * Clean up
     */
    destroy() {
        this.effectsGraphics.destroy();
    }
}
