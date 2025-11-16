/**
 * NEON RUNNER - Main Game
 * 80s Cyberpunk Endless Runner with Era-Shifting Mechanics
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Global game objects
let game;
let player;
let obstacleManager;
let eraManager;
let particleSystem;
let audioManager;
let ui;

// Game state
let gameState = 'menu'; // menu, playing, paused, gameover
let isPaused = false;

// Debug mode
let debugMode = {
    showHitboxes: false,
    invincibility: false,
    slowMotion: false,
    showFPS: false,
    showGrid: false
};

let debugText;
let fpsText;

/**
 * Preload assets
 */
function preload() {
    console.log('🎮 Preload started...');
    // Preload audio (gracefully handles missing files)
    audioManager = new AudioManager(this);
    audioManager.preloadAudio();
    console.log('✅ Preload complete');
}

/**
 * Create game
 */
function create() {
    console.log('🎮 CREATE STARTED');

    try {
        // Initialize audio system
        audioManager.init();
        console.log('✅ Audio manager initialized');

        // Create particle system
        particleSystem = new ParticleSystem(this);
        console.log('✅ Particle system created');

        // Create player
        player = new Player(this, 150, 600, particleSystem, audioManager);
        console.log('✅ Player created at', player.x, player.y);

        // Create obstacle manager
        obstacleManager = new ObstacleManager(this, player, particleSystem, audioManager);
        console.log('✅ Obstacle manager created');

        // Create era manager
        eraManager = new EraManager(this, player, obstacleManager, particleSystem, audioManager);
        console.log('✅ Era manager created');

        // Create UI
        ui = new UI(this);
        console.log('✅ UI created');
        console.log('   Menu container visible:', ui.menuContainer.visible);
        console.log('   Menu container depth:', ui.menuContainer.depth);
        console.log('   Menu state:', ui.state);

        // Setup debug
        setupDebug.call(this);
        console.log('✅ Debug setup complete');

        // Setup pause
        setupPause.call(this);
        console.log('✅ Pause setup complete');

        // Setup Electron integration (if running in Electron)
        if (window.electronAPI) {
            setupElectronIntegration.call(this);
            console.log('✅ Electron integration setup');
        }

        // Play menu music
        audioManager.playTrack('menu', true);
        console.log('✅ Menu music started');

        // Hide loading screen
        hideLoadingScreen();
        console.log('✅ Loading screen hidden');

        // Store scene reference for callbacks
        this.startGame = startGame;
        this.restartGame = restartGame;
        this.returnToMenu = returnToMenu;

        console.log('🎉 CREATE COMPLETE - GAME READY!');
    } catch (error) {
        console.error('❌ ERROR IN CREATE:', error);
        console.error('Stack:', error.stack);
    }
}

/**
 * Main update loop
 */
function update(time, delta) {
    // Apply slow motion for debug
    const effectiveDelta = debugMode.slowMotion ? delta * 0.5 : delta;

    // Update based on game state
    switch(gameState) {
        case 'playing':
            if (!isPaused) {
                updateGameplay(effectiveDelta);
            }
            break;
    }

    // Update debug display
    if (debugMode.showFPS) {
        updateFPS.call(this);
    }
}

/**
 * Update gameplay
 */
function updateGameplay(delta) {
    // Handle player input
    player.handleInput();

    // Update player
    player.update(delta);

    // Update obstacle manager
    obstacleManager.update(delta);

    // Update all obstacle animations
    obstacleManager.obstacles.forEach(obstacle => {
        obstacleManager.updateObstacleAnimation(obstacle, delta);
    });

    // Update era manager
    eraManager.update(delta);

    // Update particles
    particleSystem.update(delta);

    // Update UI
    const scoreData = obstacleManager.getScoreData();
    const eraProgress = eraManager.getEraProgress();
    const eraName = eraManager.getEraName();
    ui.updateHUD(scoreData, eraProgress, eraName);

    // Check for game over
    if (obstacleManager.hasCollided && !debugMode.invincibility) {
        gameOver();
    }

    // Draw debug
    if (debugMode.showHitboxes) {
        drawDebugHitboxes.call(this);
    }

    if (debugMode.showGrid) {
        drawDebugGrid.call(this);
    }
}

/**
 * Start game
 */
function startGame() {
    gameState = 'playing';
    isPaused = false;

    // Reset all systems
    player.reset();
    obstacleManager.reset();
    eraManager.reset();
    particleSystem.clear();

    // Start era music
    audioManager.playTrack('era_8bit', true, 1000);
}

/**
 * Restart game
 */
function restartGame() {
    startGame();
}

/**
 * Return to menu
 */
function returnToMenu() {
    gameState = 'menu';
    isPaused = false;

    // Reset all systems
    player.reset();
    obstacleManager.reset();
    eraManager.reset();
    particleSystem.clear();

    // Play menu music
    audioManager.playTrack('menu', true, 1000);
}

/**
 * Game over
 */
function gameOver() {
    gameState = 'gameover';

    const scoreData = obstacleManager.getScoreData();
    const erasCompleted = eraManager.erasCompleted;

    // Show game over screen
    ui.showGameOver(scoreData, erasCompleted);

    // Stop music
    audioManager.stopMusic(1000);
}

/**
 * Setup pause functionality
 */
function setupPause() {
    this.input.keyboard.on('keydown-P', () => {
        if (gameState === 'playing') {
            togglePause.call(this);
        }
    });
}

/**
 * Toggle pause
 */
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        // Show pause overlay
        const pauseOverlay = this.add.container(0, 0);
        pauseOverlay.name = 'pauseOverlay';

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRect(0, 0, 1280, 720);
        pauseOverlay.add(bg);

        const text = this.add.text(640, 360, 'PAUSED\n\nPress P to Resume', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff',
            align: 'center'
        });
        text.setOrigin(0.5);
        pauseOverlay.add(text);

        // Pulse animation
        this.tweens.add({
            targets: text,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    } else {
        // Remove pause overlay
        const pauseOverlay = this.children.getByName('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.destroy();
        }
    }
}

/**
 * Setup Electron integration (desktop app features)
 */
function setupElectronIntegration() {
    console.log('🖥️ Running in Electron desktop mode');

    // Listen for menu commands from Electron
    window.electronAPI.onNewGame(() => {
        if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'gameover') {
            restartGame();
        }
    });

    window.electronAPI.onTogglePause(() => {
        if (gameState === 'playing') {
            togglePause.call(this);
        }
    });

    window.electronAPI.onToggleAudio(() => {
        audioManager.toggleAudio();
    });

    window.electronAPI.onToggleHitboxes(() => {
        debugMode.showHitboxes = !debugMode.showHitboxes;
    });

    window.electronAPI.onToggleFPS(() => {
        debugMode.showFPS = !debugMode.showFPS;
        if (debugMode.showFPS && !fpsText) {
            fpsText = this.add.text(10, 10, 'FPS: 60', {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                color: '#00ff00',
                backgroundColor: '#000000'
            });
        }
        if (fpsText) {
            fpsText.setVisible(debugMode.showFPS);
        }
    });

    window.electronAPI.onToggleInvincibility(() => {
        debugMode.invincibility = !debugMode.invincibility;
        console.log('Invincibility:', debugMode.invincibility);
    });

    window.electronAPI.onShowHelp(() => {
        if (ui && ui.showHowToPlay) {
            ui.showHowToPlay();
        }
    });
}

/**
 * Setup debug features
 */
function setupDebug() {
    // H: Toggle hitboxes
    this.input.keyboard.on('keydown-H', () => {
        debugMode.showHitboxes = !debugMode.showHitboxes;
        console.log('Hitboxes:', debugMode.showHitboxes);
    });

    // G: Toggle grid
    this.input.keyboard.on('keydown-G', () => {
        debugMode.showGrid = !debugMode.showGrid;
        console.log('Grid:', debugMode.showGrid);
    });

    // I: Toggle invincibility
    this.input.keyboard.on('keydown-I', () => {
        debugMode.invincibility = !debugMode.invincibility;
        console.log('Invincibility:', debugMode.invincibility);
    });

    // S: Toggle slow motion
    this.input.keyboard.on('keydown-S', () => {
        debugMode.slowMotion = !debugMode.slowMotion;
        console.log('Slow Motion:', debugMode.slowMotion);
    });

    // F: Toggle FPS
    this.input.keyboard.on('keydown-F', () => {
        debugMode.showFPS = !debugMode.showFPS;

        if (debugMode.showFPS && !fpsText) {
            fpsText = this.add.text(10, 10, 'FPS: 60', {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                color: '#00ff00',
                backgroundColor: '#000000'
            });
        } else if (!debugMode.showFPS && fpsText) {
            fpsText.setVisible(false);
        }

        if (fpsText) {
            fpsText.setVisible(debugMode.showFPS);
        }
    });

    // M: Toggle audio
    this.input.keyboard.on('keydown-M', () => {
        const enabled = audioManager.toggleAudio();
        console.log('Audio:', enabled ? 'ON' : 'OFF');
    });

    // Debug text
    debugText = this.add.text(10, 700, '', {
        fontSize: '14px',
        fontFamily: 'Courier New, monospace',
        color: '#ffff00',
        backgroundColor: '#000000'
    });
    debugText.setOrigin(0, 1);
}

/**
 * Draw debug hitboxes
 */
function drawDebugHitboxes() {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 1);

    // Player hitbox
    const playerHitbox = player.getHitbox();
    graphics.strokeRect(
        playerHitbox.x,
        playerHitbox.y,
        playerHitbox.width,
        playerHitbox.height
    );

    // Obstacle hitboxes
    obstacleManager.obstacles.forEach(obstacle => {
        graphics.lineStyle(2, 0xff0000, 1);
        if (obstacle.type === 'gap') {
            graphics.strokeRect(
                obstacle.x,
                obstacle.y - 10,
                obstacle.width,
                30
            );
        } else {
            graphics.strokeRect(
                obstacle.x,
                obstacle.y - obstacle.height,
                obstacle.width,
                obstacle.height
            );
        }
    });

    // Auto-destroy after frame
    this.time.delayedCall(0, () => graphics.destroy());
}

/**
 * Draw debug grid
 */
function drawDebugGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    for (let x = 0; x < 1280; x += 40) {
        graphics.lineBetween(x, 0, x, 720);
    }

    for (let y = 0; y < 720; y += 40) {
        graphics.lineBetween(0, y, 1280, y);
    }

    // Ground line
    graphics.lineStyle(2, 0xff00ff, 0.8);
    graphics.lineBetween(0, 600, 1280, 600);

    this.time.delayedCall(0, () => graphics.destroy());
}

/**
 * Update FPS display
 */
function updateFPS() {
    if (fpsText) {
        const fps = Math.round(this.game.loop.actualFps);
        fpsText.setText(`FPS: ${fps}`);

        // Color code based on performance
        if (fps >= 55) {
            fpsText.setColor('#00ff00');
        } else if (fps >= 40) {
            fpsText.setColor('#ffff00');
        } else {
            fpsText.setColor('#ff0000');
        }
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        console.log('✅ Loading screen hidden');
    }
}

// Initialize game
function initGame() {
    console.log('🎮 Initializing game...');

    // Check if Phaser loaded
    if (typeof Phaser === 'undefined') {
        console.error('❌ CRITICAL: Phaser failed to load!');

        // Show error on screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <h1 style="color: #ff0000;">ERROR</h1>
                <p style="color: #00ffff;">Phaser failed to load from CDN</p>
                <p style="color: #ffffff; font-size: 14px;">Check internet connection</p>
            `;
        }
        return;
    }

    console.log('✅ Phaser loaded successfully:', Phaser.VERSION);

    // Create game
    try {
        game = new Phaser.Game(config);
        console.log('✅ Phaser Game instance created');

        // Verify canvas after delay
        setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                console.log('✅ Canvas:', canvas.width, 'x', canvas.height);
                console.log('Canvas parent:', canvas.parentElement.id);
                console.log('Canvas visible:', canvas.style.display !== 'none');
            } else {
                console.error('❌ Canvas NOT created!');
            }
        }, 2000);
    } catch (error) {
        console.error('❌ Error creating Phaser game:', error);
    }
}

// Wait for everything to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM ready');
        // Give scripts time to load
        setTimeout(initGame, 100);
    });
} else {
    // Already loaded
    setTimeout(initGame, 100);
}
