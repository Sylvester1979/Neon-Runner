/**
 * ParticleSystem - Era-specific visual effects
 * Handles particles for 8-bit, 16-bit, and Neon eras
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 100;
        this.currentEra = '8bit';
    }

    /**
     * Set current era for particle styling
     */
    setEra(era) {
        this.currentEra = era;
    }

    /**
     * Create jump particles based on current era
     */
    createJumpParticles(x, y) {
        switch(this.currentEra) {
            case '8bit':
                this.create8BitJumpParticles(x, y);
                break;
            case '16bit':
                this.create16BitJumpParticles(x, y);
                break;
            case 'neon':
                this.createNeonJumpParticles(x, y);
                break;
        }
    }

    /**
     * 8-bit era particles - blocky pixels
     */
    create8BitJumpParticles(x, y) {
        const colors = [0x0F380F, 0x306230, 0x8BAC0F, 0x9BBC0F];

        for (let i = 0; i < 8; i++) {
            const graphics = this.scene.add.graphics();
            const color = Phaser.Utils.Array.GetRandom(colors);
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, 0, 4, 4); // 4x4 pixel blocks

            const particle = this.scene.add.container(x, y, [graphics]);
            particle.setDepth(80); // Above obstacles (50) but below player (100)

            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(50, 150);
            const vx = Math.cos(angle * Math.PI / 180) * speed;
            const vy = Math.sin(angle * Math.PI / 180) * speed;

            particle.velocityX = vx;
            particle.velocityY = vy;
            particle.life = 0.5;

            this.particles.push(particle);
        }
    }

    /**
     * 16-bit era particles - sparkles
     */
    create16BitJumpParticles(x, y) {
        const colors = [0x00FFFF, 0xFF00FF, 0x9D4EDD, 0x7209B7];

        for (let i = 0; i < 12; i++) {
            const graphics = this.scene.add.graphics();
            const color = Phaser.Utils.Array.GetRandom(colors);
            graphics.fillStyle(color, 1);
            graphics.fillCircle(0, 0, 2);

            const particle = this.scene.add.container(x, y, [graphics]);
            particle.setDepth(80); // Above obstacles (50) but below player (100)

            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(80, 200);
            const vx = Math.cos(angle * Math.PI / 180) * speed;
            const vy = Math.sin(angle * Math.PI / 180) * speed;

            particle.velocityX = vx;
            particle.velocityY = vy;
            particle.life = 0.8;

            this.particles.push(particle);
        }
    }

    /**
     * Neon era particles - glowing trails
     */
    createNeonJumpParticles(x, y) {
        const colors = [0x00FFFF, 0xFF00FF, 0xFFFF00];

        for (let i = 0; i < 16; i++) {
            const graphics = this.scene.add.graphics();
            const color = Phaser.Utils.Array.GetRandom(colors);

            // Create glowing effect
            graphics.fillStyle(color, 0.8);
            graphics.fillCircle(0, 0, 4);
            graphics.lineStyle(2, color, 0.6);
            graphics.strokeCircle(0, 0, 6);

            const particle = this.scene.add.container(x, y, [graphics]);
            particle.setDepth(80); // Above obstacles (50) but below player (100)

            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(100, 250);
            const vx = Math.cos(angle * Math.PI / 180) * speed;
            const vy = Math.sin(angle * Math.PI / 180) * speed;

            particle.velocityX = vx;
            particle.velocityY = vy;
            particle.life = 1.0;
            particle.initialAlpha = 1;

            this.particles.push(particle);
        }
    }

    /**
     * Create player trail effect
     */
    createTrail(x, y) {
        if (this.particles.length >= this.maxParticles) return;

        let graphics = this.scene.add.graphics();

        switch(this.currentEra) {
            case '8bit':
                graphics.fillStyle(0x9BBC0F, 0.5);
                graphics.fillRect(0, 0, 6, 6);
                break;
            case '16bit':
                graphics.fillStyle(0xFF00FF, 0.6);
                graphics.fillCircle(0, 0, 4);
                break;
            case 'neon':
                graphics.fillStyle(0x00FFFF, 0.8);
                graphics.fillCircle(0, 0, 6);
                graphics.lineStyle(2, 0xFF00FF, 0.6);
                graphics.strokeCircle(0, 0, 8);
                break;
        }

        const particle = this.scene.add.container(x, y, [graphics]);
        particle.setDepth(80); // Above obstacles (50) but below player (100)
        particle.velocityX = 0;
        particle.velocityY = 0;
        particle.life = 0.3;
        particle.initialAlpha = 0.8;

        this.particles.push(particle);
    }

    /**
     * Create collision explosion
     */
    createExplosion(x, y) {
        const particleCount = this.currentEra === 'neon' ? 24 : 16;

        for (let i = 0; i < particleCount; i++) {
            const graphics = this.scene.add.graphics();

            switch(this.currentEra) {
                case '8bit':
                    graphics.fillStyle(0xFF0000, 1);
                    graphics.fillRect(0, 0, 8, 8);
                    break;
                case '16bit':
                    graphics.fillStyle(0xFF4444, 1);
                    graphics.fillCircle(0, 0, 4);
                    break;
                case 'neon':
                    graphics.fillStyle(0xFF0000, 1);
                    graphics.fillCircle(0, 0, 6);
                    graphics.lineStyle(2, 0xFF00FF, 1);
                    graphics.strokeCircle(0, 0, 8);
                    break;
            }

            const particle = this.scene.add.container(x, y, [graphics]);
            particle.setDepth(80); // Above obstacles (50) but below player (100)

            const angle = (360 / particleCount) * i;
            const speed = Phaser.Math.Between(200, 400);
            const vx = Math.cos(angle * Math.PI / 180) * speed;
            const vy = Math.sin(angle * Math.PI / 180) * speed;

            particle.velocityX = vx;
            particle.velocityY = vy;
            particle.life = 0.6;
            particle.initialAlpha = 1;

            this.particles.push(particle);
        }
    }

    /**
     * Update all particles
     */
    update(delta) {
        const deltaSeconds = delta / 1000;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Update position
            particle.x += particle.velocityX * deltaSeconds;
            particle.y += particle.velocityY * deltaSeconds;

            // Apply gravity to certain particles
            if (particle.velocityY !== undefined) {
                particle.velocityY += 500 * deltaSeconds;
            }

            // Update life
            particle.life -= deltaSeconds;

            // Fade out
            if (particle.initialAlpha) {
                particle.alpha = particle.life / particle.initialAlpha;
            }

            // Remove dead particles
            if (particle.life <= 0) {
                particle.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles.forEach(particle => particle.destroy());
        this.particles = [];
    }

    /**
     * Clean up
     */
    destroy() {
        this.clear();
    }
}
