/**
 * ObstacleManager - Spawns and manages obstacles with object pooling
 */
class ObstacleManager {
    constructor(scene, player, particleSystem, audioManager) {
        this.scene = scene;
        this.player = player;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;

        this.obstacles = [];
        this.obstaclePool = [];
        this.currentEra = '8bit';

        // Spawning parameters
        this.baseSpeed = 400;
        this.currentSpeed = this.baseSpeed;
        this.spawnTimer = 0;
        this.spawnInterval = 1.8; // Initial gap between obstacles
        this.minSpawnInterval = 0.9;

        // Game progression
        this.gameTime = 0;
        this.lastSpeedIncrease = 0;
        this.lastIntervalDecrease = 0;

        // Score tracking
        this.score = 0;
        this.distanceTraveled = 0;
        this.consecutiveDodges = 0;
        this.comboMultiplier = 1;

        // Collision tracking
        this.hasCollided = false;
    }

    /**
     * Set current era for obstacle types
     */
    setEra(era) {
        this.currentEra = era;
    }

    /**
     * Update obstacles and spawning
     */
    update(delta, isPaused = false) {
        if (isPaused) return;

        const deltaSeconds = delta / 1000;
        this.gameTime += deltaSeconds;

        // Update speed (every 10 seconds)
        if (this.gameTime - this.lastSpeedIncrease >= 10) {
            this.lastSpeedIncrease = this.gameTime;
            this.currentSpeed = Math.min(800, this.baseSpeed + Math.floor(this.gameTime / 10) * 50);
        }

        // Update spawn interval (every 15 seconds)
        if (this.gameTime - this.lastIntervalDecrease >= 15) {
            this.lastIntervalDecrease = this.gameTime;
            this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval - 0.05);
        }

        // Update distance score
        this.distanceTraveled += this.currentSpeed * deltaSeconds;
        this.score = Math.floor(this.distanceTraveled / 10);

        // Update spawn timer
        this.spawnTimer += deltaSeconds;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacle();
        }

        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];

            // Move obstacle
            obstacle.x -= this.currentSpeed * deltaSeconds;

            // Update container position
            obstacle.container.x = obstacle.x;

            // Check if passed player
            if (!obstacle.passed && obstacle.x + obstacle.width < this.player.x) {
                obstacle.passed = true;
                this.handleObstaclePassed(obstacle);
            }

            // Remove if off-screen
            if (obstacle.x < -200) {
                this.removeObstacle(i);
            }
        }

        // Check collisions
        this.checkCollisions();
    }

    /**
     * Spawn a new obstacle based on current era
     */
    spawnObstacle() {
        let obstacleData;

        switch(this.currentEra) {
            case '8bit':
                obstacleData = this.get8BitObstacle();
                break;
            case '16bit':
                obstacleData = this.get16BitObstacle();
                break;
            case 'neon':
                obstacleData = this.getNeonObstacle();
                break;
        }

        const obstacle = this.createObstacle(obstacleData);
        this.obstacles.push(obstacle);
    }

    /**
     * Get random 8-bit obstacle configuration
     */
    get8BitObstacle() {
        const types = [
            { type: 'low_barrier', width: 48, height: 32, y: 600 },
            { type: 'high_barrier', width: 48, height: 64, y: 600 },
            { type: 'gap', width: 96, height: 0, y: 620 } // Gap in ground
        ];

        return Phaser.Utils.Array.GetRandom(types);
    }

    /**
     * Get random 16-bit obstacle configuration
     */
    get16BitObstacle() {
        const types = [
            { type: 'laser_gate', width: 32, height: 80, y: 600 },
            { type: 'platform_gap', width: 64, height: 20, y: 500 },
            { type: 'drone', width: 40, height: 40, y: 480, animated: true }
        ];

        return Phaser.Utils.Array.GetRandom(types);
    }

    /**
     * Get random neon obstacle configuration
     */
    getNeonObstacle() {
        const types = [
            { type: 'hologram_wall', width: 48, height: 80, y: 600, flickers: true },
            { type: 'energy_field', width: 60, height: 60, y: 570, wave: true },
            { type: 'flying_car', width: 80, height: 50, y: 450 }
        ];

        return Phaser.Utils.Array.GetRandom(types);
    }

    /**
     * Create obstacle from configuration
     */
    createObstacle(config) {
        const obstacle = {
            type: config.type,
            x: 1400, // Spawn off-screen right
            y: config.y,
            width: config.width,
            height: config.height,
            passed: false,
            animated: config.animated || false,
            flickers: config.flickers || false,
            wave: config.wave || false,
            animationTimer: 0,
            visible: true
        };

        // Create graphics
        const graphics = this.scene.add.graphics();
        obstacle.graphics = graphics;

        // Create container
        const container = this.scene.add.container(obstacle.x, obstacle.y);
        container.setDepth(50); // ABOVE backgrounds (0-20) but BELOW player (100)
        container.add(graphics);
        obstacle.container = container;

        // Draw obstacle
        this.drawObstacle(obstacle);

        return obstacle;
    }

    /**
     * Draw obstacle based on type and era
     */
    drawObstacle(obstacle) {
        const g = obstacle.graphics;
        g.clear();

        if (!obstacle.visible) return;

        switch(this.currentEra) {
            case '8bit':
                this.draw8BitObstacle(obstacle, g);
                break;
            case '16bit':
                this.draw16BitObstacle(obstacle, g);
                break;
            case 'neon':
                this.drawNeonObstacle(obstacle, g);
                break;
        }
    }

    /**
     * Draw 8-bit obstacles
     */
    draw8BitObstacle(obstacle, g) {
        const colors = [0x0F380F, 0x306230, 0x8BAC0F, 0x9BBC0F];

        if (obstacle.type === 'gap') {
            // Draw gap markers
            g.fillStyle(0xFF0000, 1);
            g.fillRect(0, 0, 8, 20);
            g.fillRect(obstacle.width - 8, 0, 8, 20);
        } else {
            // Draw solid barrier
            g.fillStyle(colors[1], 1);
            g.fillRect(0, -obstacle.height, obstacle.width, obstacle.height);

            // Add pattern
            for (let i = 0; i < obstacle.width; i += 8) {
                for (let j = 0; j < obstacle.height; j += 8) {
                    if ((i + j) % 16 === 0) {
                        g.fillStyle(colors[0], 1);
                        g.fillRect(i, -obstacle.height + j, 4, 4);
                    }
                }
            }
        }
    }

    /**
     * Draw 16-bit obstacles
     */
    draw16BitObstacle(obstacle, g) {
        const colors = [0x7209B7, 0x9D4EDD, 0x00FFFF, 0xFF00FF];

        switch(obstacle.type) {
            case 'laser_gate':
                // Vertical laser beam
                g.lineStyle(8, colors[3], 0.8);
                g.lineBetween(obstacle.width/2, -obstacle.height, obstacle.width/2, 0);

                // Glow effect
                g.lineStyle(16, colors[3], 0.3);
                g.lineBetween(obstacle.width/2, -obstacle.height, obstacle.width/2, 0);
                break;

            case 'platform_gap':
                // Floating platform
                g.fillStyle(colors[1], 1);
                g.fillRect(0, -obstacle.height, obstacle.width, obstacle.height);
                g.lineStyle(2, colors[2], 1);
                g.strokeRect(0, -obstacle.height, obstacle.width, obstacle.height);
                break;

            case 'drone':
                // Hovering enemy
                g.fillStyle(colors[0], 1);
                g.fillCircle(obstacle.width/2, -obstacle.height/2, obstacle.width/2);
                g.lineStyle(2, colors[3], 1);
                g.strokeCircle(obstacle.width/2, -obstacle.height/2, obstacle.width/2);

                // Add animated parts
                const pulse = Math.sin(obstacle.animationTimer * 5) * 3;
                g.fillStyle(0xFF0000, 0.8);
                g.fillCircle(obstacle.width/2, -obstacle.height/2, 8 + pulse);
                break;
        }
    }

    /**
     * Draw neon obstacles
     */
    drawNeonObstacle(obstacle, g) {
        switch(obstacle.type) {
            case 'hologram_wall':
                const alpha = obstacle.flickers ? Math.abs(Math.sin(obstacle.animationTimer * 3)) : 1;
                g.fillStyle(0x00FFFF, alpha * 0.3);
                g.fillRect(0, -obstacle.height, obstacle.width, obstacle.height);
                g.lineStyle(3, 0x00FFFF, alpha);
                g.strokeRect(0, -obstacle.height, obstacle.width, obstacle.height);

                // Scan lines
                for (let y = 0; y < obstacle.height; y += 8) {
                    g.lineStyle(1, 0xFF00FF, alpha * 0.5);
                    g.lineBetween(0, -obstacle.height + y, obstacle.width, -obstacle.height + y);
                }
                break;

            case 'energy_field':
                const waveOffset = obstacle.wave ? Math.sin(obstacle.animationTimer * 4) * 10 : 0;
                g.fillStyle(0xFF00FF, 0.6);
                g.fillCircle(obstacle.width/2, -obstacle.height/2 + waveOffset, obstacle.width/2);

                g.lineStyle(4, 0xFF00FF, 0.8);
                g.strokeCircle(obstacle.width/2, -obstacle.height/2 + waveOffset, obstacle.width/2);

                // Outer glow
                g.lineStyle(8, 0xFF00FF, 0.3);
                g.strokeCircle(obstacle.width/2, -obstacle.height/2 + waveOffset, obstacle.width/2 + 8);
                break;

            case 'flying_car':
                // Futuristic vehicle
                g.fillStyle(0x1a1a2e, 1);
                g.fillRect(0, -obstacle.height, obstacle.width, obstacle.height);

                // Neon outline
                g.lineStyle(3, 0x00FFFF, 1);
                g.strokeRect(0, -obstacle.height, obstacle.width, obstacle.height);

                // Windows
                g.fillStyle(0xFF00FF, 0.6);
                g.fillRect(10, -obstacle.height + 10, obstacle.width - 20, obstacle.height/2);

                // Glow underneath
                g.fillStyle(0x00FFFF, 0.4);
                g.fillRect(0, -10, obstacle.width, 10);
                break;
        }
    }

    /**
     * Update obstacle animations
     */
    updateObstacleAnimation(obstacle, delta) {
        if (obstacle.animated || obstacle.flickers || obstacle.wave) {
            obstacle.animationTimer += delta / 1000;
            this.drawObstacle(obstacle);
        }

        // Drone hovering animation
        if (obstacle.type === 'drone') {
            obstacle.container.y = obstacle.y + Math.sin(obstacle.animationTimer * 2) * 15;
        }
    }

    /**
     * Check collisions with player
     */
    checkCollisions() {
        if (this.player.isInvincible || this.hasCollided) return;

        const playerHitbox = this.player.getHitbox();

        for (const obstacle of this.obstacles) {
            if (obstacle.passed) continue;

            // Special handling for gaps
            if (obstacle.type === 'gap') {
                // Player must jump over gap
                if (this.checkAABB(playerHitbox, {
                    x: obstacle.x,
                    y: obstacle.y - 10,
                    width: obstacle.width,
                    height: 30
                }) && this.player.isGrounded) {
                    this.handleCollision(obstacle);
                    return;
                }
            } else {
                // Normal AABB collision
                const obstacleHitbox = {
                    x: obstacle.x,
                    y: obstacle.y - obstacle.height,
                    width: obstacle.width,
                    height: obstacle.height
                };

                if (this.checkAABB(playerHitbox, obstacleHitbox)) {
                    this.handleCollision(obstacle);
                    return;
                }
            }
        }
    }

    /**
     * AABB (Axis-Aligned Bounding Box) collision detection
     */
    checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * Handle collision with obstacle
     */
    handleCollision(obstacle) {
        this.hasCollided = true;
        this.particleSystem.createExplosion(this.player.x, this.player.y);
        this.audioManager.playSFX('collision');
        this.consecutiveDodges = 0;
        this.comboMultiplier = 1;
    }

    /**
     * Handle successful obstacle dodge
     */
    handleObstaclePassed(obstacle) {
        // Perfect dodge bonus (didn't jump)
        if (this.player.isGrounded && obstacle.type !== 'gap') {
            this.score += 10;
        }

        // Consecutive dodges for combo
        this.consecutiveDodges++;

        if (this.consecutiveDodges >= 10) {
            this.comboMultiplier = 3;
        } else if (this.consecutiveDodges >= 5) {
            this.comboMultiplier = 2;
        }
    }

    /**
     * Remove obstacle and return to pool
     */
    removeObstacle(index) {
        const obstacle = this.obstacles[index];
        obstacle.container.destroy();
        this.obstacles.splice(index, 1);
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles.forEach(obstacle => obstacle.container.destroy());
        this.obstacles = [];
    }

    /**
     * Reset manager state
     */
    reset() {
        this.clearObstacles();
        this.gameTime = 0;
        this.score = 0;
        this.distanceTraveled = 0;
        this.consecutiveDodges = 0;
        this.comboMultiplier = 1;
        this.hasCollided = false;
        this.currentSpeed = this.baseSpeed;
        this.spawnInterval = 1.8;
        this.lastSpeedIncrease = 0;
        this.lastIntervalDecrease = 0;
        this.spawnTimer = 0;
    }

    /**
     * Get current score data
     */
    getScoreData() {
        return {
            score: this.score * this.comboMultiplier,
            distance: Math.floor(this.distanceTraveled),
            combo: this.comboMultiplier,
            speed: Math.floor(this.currentSpeed)
        };
    }
}
