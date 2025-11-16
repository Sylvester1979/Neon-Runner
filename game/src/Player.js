/**
 * Player - Main player character with physics and controls
 */
class Player {
    constructor(scene, x, y, particleSystem, audioManager) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;

        // Physics constants
        this.jumpForce = -600;
        this.gravity = 1800;
        this.groundY = 600; // Ground level

        // State
        this.x = x;
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isSliding = false;
        this.hasDoubleJump = false;
        this.slideDuration = 0;
        this.maxSlideDuration = 0.6;

        // Hitbox
        this.width = 48;
        this.height = 48;
        this.slideHeight = 24;
        this.hitboxPadding = 4; // Makes hitbox slightly smaller for fairness

        // Invincibility
        this.isInvincible = false;
        this.invincibilityTime = 0;

        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        this.animationTimer = 0;
        this.currentEra = '8bit';

        // Graphics
        this.container = scene.add.container(x, this.y);
        this.container.setDepth(100); // ABOVE background but below UI
        this.graphics = scene.add.graphics();
        this.container.add(this.graphics);

        // Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Trail timer
        this.trailTimer = 0;

        // Draw initial sprite
        this.draw();
    }

    /**
     * Handle input
     */
    handleInput() {
        // Jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Slide
        if (this.cursors.down.isDown) {
            this.startSlide();
        } else if (this.isSliding) {
            this.endSlide();
        }
    }

    /**
     * Jump logic
     */
    jump() {
        if (this.isGrounded) {
            // First jump
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            this.hasDoubleJump = true;
            this.particleSystem.createJumpParticles(this.x, this.y + this.getHeight() / 2);
            this.audioManager.playSFX('jump');
        } else if (this.hasDoubleJump) {
            // Double jump
            this.velocityY = this.jumpForce * 0.8;
            this.hasDoubleJump = false;
            this.particleSystem.createJumpParticles(this.x, this.y);
            this.audioManager.playSFX('jump');
        }
    }

    /**
     * Start sliding
     */
    startSlide() {
        if (this.isGrounded && !this.isSliding) {
            this.isSliding = true;
            this.slideDuration = 0;
            this.audioManager.playSFX('slide');
        }
    }

    /**
     * End sliding
     */
    endSlide() {
        this.isSliding = false;
        this.slideDuration = 0;
    }

    /**
     * Update physics and animation
     */
    update(delta) {
        const deltaSeconds = delta / 1000;

        // Handle slide duration
        if (this.isSliding) {
            this.slideDuration += deltaSeconds;
            if (this.slideDuration >= this.maxSlideDuration) {
                this.endSlide();
            }
        }

        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity * deltaSeconds;
        }

        // Update Y position
        this.y += this.velocityY * deltaSeconds;

        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isGrounded = true;
            this.hasDoubleJump = false;
        }

        // Update container position
        this.container.y = this.y;

        // Update animation
        this.animationTimer += deltaSeconds;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % this.getMaxFrames();
        }

        // Create trail effect
        this.trailTimer += deltaSeconds;
        if (this.trailTimer >= 0.05) {
            this.trailTimer = 0;
            this.particleSystem.createTrail(this.x, this.y);
        }

        // Update invincibility
        if (this.isInvincible) {
            this.invincibilityTime -= deltaSeconds;
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
            }
        }

        // Redraw
        this.draw();
    }

    /**
     * Get max animation frames based on era
     */
    getMaxFrames() {
        switch(this.currentEra) {
            case '8bit': return 3;
            case '16bit': return 5;
            case 'neon': return 8;
            default: return 3;
        }
    }

    /**
     * Set current era for visual style
     */
    setEra(era) {
        this.currentEra = era;
        this.animationFrame = 0;
    }

    /**
     * Draw player sprite based on current era
     */
    draw() {
        this.graphics.clear();

        const height = this.getHeight();
        const width = this.width;

        // Add flashing effect when invincible
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            return; // Skip drawing to create flashing effect
        }

        switch(this.currentEra) {
            case '8bit':
                this.draw8Bit(width, height);
                break;
            case '16bit':
                this.draw16Bit(width, height);
                break;
            case 'neon':
                this.drawNeon(width, height);
                break;
        }
    }

    /**
     * 8-bit era sprite - Enhanced retro character
     */
    draw8Bit(width, height) {
        const colors = [0x0F380F, 0x306230, 0x8BAC0F, 0x9BBC0F];
        const frame = this.animationFrame;

        // Glow outline (subtle)
        this.graphics.lineStyle(2, colors[3], 0.3);
        this.graphics.strokeRect(-width/2 - 2, -height/2 - 14, width + 4, height * 0.6 + 16);

        // Body (square) with gradient effect
        this.graphics.fillStyle(colors[2], 1);
        this.graphics.fillRect(-width/2, -height/2, width, height * 0.6);
        this.graphics.fillStyle(colors[3], 0.3);
        this.graphics.fillRect(-width/2, -height/2, width, height * 0.2);

        // Head with detail
        this.graphics.fillStyle(colors[3], 1);
        this.graphics.fillRect(-width/2 + 8, -height/2 - 12, width - 16, 12);

        // Eyes (pixelated)
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(-width/2 + 12, -height/2 - 9, 4, 4);
        this.graphics.fillRect(width/2 - 16, -height/2 - 9, 4, 4);

        // Legs (animated)
        const legOffset = Math.sin(frame * Math.PI / 1.5) * 4;
        this.graphics.fillStyle(colors[1], 1);

        if (!this.isSliding) {
            // Left leg with motion blur
            this.graphics.fillRect(-width/2 + 8, height * 0.1, 8, height * 0.4 + legOffset);
            this.graphics.fillStyle(colors[1], 0.3);
            this.graphics.fillRect(-width/2 + 6, height * 0.1, 10, height * 0.4 + legOffset);

            // Right leg with motion blur
            this.graphics.fillStyle(colors[1], 1);
            this.graphics.fillRect(width/2 - 16, height * 0.1, 8, height * 0.4 - legOffset);
            this.graphics.fillStyle(colors[1], 0.3);
            this.graphics.fillRect(width/2 - 18, height * 0.1, 10, height * 0.4 - legOffset);
        }
    }

    /**
     * 16-bit era sprite - Enhanced cyberpunk character
     */
    draw16Bit(width, height) {
        const colors = [0x7209B7, 0x9D4EDD, 0x00FFFF, 0xFF00FF];
        const frame = this.animationFrame;

        // Outer glow (pulsing)
        const glowPulse = Math.sin(Date.now() / 200) * 0.2 + 0.6;
        this.graphics.lineStyle(4, colors[3], glowPulse * 0.4);
        this.graphics.strokeRect(-width/2, -height/2, width, height * 0.5 + 8);

        // Body with gradient effect
        this.graphics.fillStyle(colors[1], 1);
        this.graphics.fillRect(-width/2 + 4, -height/2 + 4, width - 8, height * 0.5);

        // Body highlight
        this.graphics.fillStyle(colors[2], 0.4);
        this.graphics.fillRect(-width/2 + 6, -height/2 + 6, width - 12, height * 0.15);

        // Head with glow
        this.graphics.fillStyle(colors[2], 1);
        this.graphics.fillCircle(0, -height/2 - 6, 10);
        this.graphics.fillStyle(colors[2], 0.3);
        this.graphics.fillCircle(0, -height/2 - 6, 14);

        // Visor/eyes
        this.graphics.fillStyle(colors[3], 0.8);
        this.graphics.fillRect(-8, -height/2 - 8, 16, 3);

        // Arms (animated) with glow trail
        const armSwing = Math.sin(frame * Math.PI / 2.5) * 8;

        // Arm glow
        this.graphics.lineStyle(6, colors[1], 0.3);
        this.graphics.lineBetween(-width/2, -height/4, -width/2 - 8, height/4 + armSwing);
        this.graphics.lineBetween(width/2, -height/4, width/2 + 8, height/4 - armSwing);

        // Arm solid
        this.graphics.lineStyle(4, colors[0], 1);
        this.graphics.lineBetween(-width/2, -height/4, -width/2 - 8, height/4 + armSwing);
        this.graphics.lineBetween(width/2, -height/4, width/2 + 8, height/4 - armSwing);

        // Legs (animated) with glow
        if (!this.isSliding) {
            const legSwing = Math.sin(frame * Math.PI / 2.5) * 10;

            // Leg glow
            this.graphics.lineStyle(8, colors[1], 0.3);
            this.graphics.lineBetween(-8, height * 0.3, -8 - legSwing, height * 0.6);
            this.graphics.lineBetween(8, height * 0.3, 8 + legSwing, height * 0.6);

            // Leg solid
            this.graphics.lineStyle(6, colors[0], 1);
            this.graphics.lineBetween(-8, height * 0.3, -8 - legSwing, height * 0.6);
            this.graphics.lineBetween(8, height * 0.3, 8 + legSwing, height * 0.6);
        }

        // Inner neon outline
        this.graphics.lineStyle(2, colors[3], 0.7);
        this.graphics.strokeRect(-width/2 + 2, -height/2 + 2, width - 4, height * 0.5 + 2);
    }

    /**
     * Neon era sprite - INTENSE futuristic runner with maximum glow
     */
    drawNeon(width, height) {
        const frame = this.animationFrame;
        const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;

        // Outermost glow aura - reduced for better obstacle visibility
        this.graphics.fillStyle(0x00FFFF, 0.08 * pulse);
        this.graphics.fillRect(-width/2 - 3, -height/2 - 3, width + 6, height * 0.55 + 6);

        // Secondary glow layer
        this.graphics.fillStyle(0xFF00FF, 0.12 * pulse);
        this.graphics.fillRect(-width/2 - 1, -height/2 - 1, width + 2, height * 0.55 + 3);

        // Main body (sleek design)
        this.graphics.fillStyle(0x0a0a1a, 1);
        this.graphics.fillRect(-width/2 + 6, -height/2 + 6, width - 12, height * 0.55);

        // Inner body glow
        this.graphics.fillStyle(0x00FFFF, 0.2);
        this.graphics.fillRect(-width/2 + 8, -height/2 + 8, width - 16, height * 0.2);

        // Triple neon outline for intense effect
        this.graphics.lineStyle(4, 0x00FFFF, 0.4 * pulse);
        this.graphics.strokeRect(-width/2 + 4, -height/2 + 4, width - 8, height * 0.55 + 2);

        this.graphics.lineStyle(3, 0x00FFFF, 0.8);
        this.graphics.strokeRect(-width/2 + 6, -height/2 + 6, width - 12, height * 0.55);

        this.graphics.lineStyle(1, 0xFF00FF, 1);
        this.graphics.strokeRect(-width/2 + 7, -height/2 + 7, width - 14, height * 0.55 - 2);

        // Head with multi-layer glow - reduced for better obstacle visibility
        this.graphics.fillStyle(0x00FFFF, 0.15);
        this.graphics.fillCircle(0, -height/2 - 8, 14);

        this.graphics.fillStyle(0x00FFFF, 0.35);
        this.graphics.fillCircle(0, -height/2 - 8, 11);

        this.graphics.fillStyle(0x00FFFF, 0.9);
        this.graphics.fillCircle(0, -height/2 - 8, 9);

        // Head outline glow
        this.graphics.lineStyle(2, 0xFF00FF, 0.8);
        this.graphics.strokeCircle(0, -height/2 - 8, 10);

        this.graphics.lineStyle(1, 0xFF00FF, 0.3);
        this.graphics.strokeCircle(0, -height/2 - 8, 12);

        // Visor with glow
        this.graphics.fillStyle(0xFF00FF, 0.9);
        this.graphics.fillRect(-10, -height/2 - 10, 20, 5);
        this.graphics.fillStyle(0xFF00FF, 0.3);
        this.graphics.fillRect(-12, -height/2 - 11, 24, 7);

        // Animated energy trails - reduced for better obstacle visibility
        const trailLength = Math.sin(frame * Math.PI / 4) * 5 + 10;

        // Trail glow
        this.graphics.lineStyle(4, 0xFF00FF, 0.15);
        this.graphics.lineBetween(-width/2, 0, -width/2 - trailLength, 0);
        this.graphics.lineStyle(3, 0x00FFFF, 0.15);
        this.graphics.lineBetween(-width/2, height/4, -width/2 - trailLength * 0.8, height/4);

        // Trail solid
        this.graphics.lineStyle(2, 0xFF00FF, 0.7);
        this.graphics.lineBetween(-width/2, 0, -width/2 - trailLength, 0);
        this.graphics.lineStyle(2, 0x00FFFF, 0.7);
        this.graphics.lineBetween(-width/2, height/4, -width/2 - trailLength * 0.8, height/4);

        // Energy particles trailing - reduced spacing
        for (let i = 0; i < 2; i++) {
            const px = -width/2 - i * 6 - (frame % 4) * 2;
            const py = i * 5;
            this.graphics.fillStyle(i % 2 === 0 ? 0x00FFFF : 0xFF00FF, 0.5);
            this.graphics.fillCircle(px, py, 1.5);
        }

        // Legs (smooth animation) with intense glow
        if (!this.isSliding) {
            const legSwing = Math.sin(frame * Math.PI / 4) * 12;

            // Outermost leg glow
            this.graphics.lineStyle(10, 0x00FFFF, 0.15);
            this.graphics.lineBetween(-6, height * 0.35, -6 - legSwing, height * 0.65);
            this.graphics.lineBetween(6, height * 0.35, 6 + legSwing, height * 0.65);

            // Middle leg glow
            this.graphics.lineStyle(6, 0x00FFFF, 0.4);
            this.graphics.lineBetween(-6, height * 0.35, -6 - legSwing, height * 0.65);
            this.graphics.lineBetween(6, height * 0.35, 6 + legSwing, height * 0.65);

            // Solid legs
            this.graphics.lineStyle(4, 0x00FFFF, 1);
            this.graphics.lineBetween(-6, height * 0.35, -6 - legSwing, height * 0.65);
            this.graphics.lineBetween(6, height * 0.35, 6 + legSwing, height * 0.65);

            // Inner highlight
            this.graphics.lineStyle(1, 0xFFFFFF, 0.8);
            this.graphics.lineBetween(-6, height * 0.35, -6 - legSwing, height * 0.65);
            this.graphics.lineBetween(6, height * 0.35, 6 + legSwing, height * 0.65);
        }

        // Speed lines - reduced for better obstacle visibility
        if (!this.isSliding) {
            this.graphics.lineStyle(1, 0x00FFFF, 0.2);
            for (let i = 0; i < 3; i++) {
                const sx = -width/2 - 5 - i * 4;
                const sy = -height/4 + i * 6;
                this.graphics.lineBetween(sx, sy, sx - 8, sy);
            }
        }
    }

    /**
     * Get current height (changes when sliding)
     */
    getHeight() {
        return this.isSliding ? this.slideHeight : this.height;
    }

    /**
     * Get hitbox for collision detection (slightly smaller than visual)
     */
    getHitbox() {
        const height = this.getHeight();
        return {
            x: this.x - (this.width / 2) + this.hitboxPadding,
            y: this.y - (height / 2) + this.hitboxPadding,
            width: this.width - (this.hitboxPadding * 2),
            height: height - (this.hitboxPadding * 2)
        };
    }

    /**
     * Make player invincible for a duration
     */
    makeInvincible(duration) {
        this.isInvincible = true;
        this.invincibilityTime = duration;
    }

    /**
     * Reset player state
     */
    reset() {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isSliding = false;
        this.hasDoubleJump = false;
        this.isInvincible = false;
        this.animationFrame = 0;
        this.container.y = this.y;
    }

    /**
     * Clean up
     */
    destroy() {
        this.container.destroy();
    }
}
