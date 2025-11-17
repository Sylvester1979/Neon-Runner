/**
 * UI - Manages menu, HUD, and game over screens
 */
class UI {
    constructor(scene) {
        this.scene = scene;
        this.state = 'menu'; // menu, playing, paused, gameover

        // Text objects
        this.scoreText = null;
        this.comboText = null;
        this.eraText = null;
        this.eraProgressBar = null;
        this.menuContainer = null;
        this.gameOverContainer = null;
        this.hudContainer = null;

        // High scores (localStorage)
        this.highScores = this.loadHighScores();

        this.createUI();
    }

    /**
     * Create all UI elements
     */
    createUI() {
        this.createMenu();
        this.createHUD();
        this.createGameOverScreen();

        // Show menu by default
        this.showMenu();
    }

    /**
     * Create main menu
     */
    createMenu() {
        this.menuContainer = this.scene.add.container(0, 0);
        this.menuContainer.setDepth(1000); // ABOVE everything else

        // Semi-transparent background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, 1280, 720);
        this.menuContainer.add(bg);

        // Title
        const title = this.scene.add.text(640, 150, 'NEON RUNNER', {
            fontSize: '72px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff',
            stroke: '#ff00ff',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        this.menuContainer.add(title);

        // Animated title glow
        this.scene.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Subtitle
        const subtitle = this.scene.add.text(640, 230, '80s CYBERPUNK ENDLESS RUNNER', {
            fontSize: '20px',
            fontFamily: 'Courier New, monospace',
            color: '#9d4edd'
        });
        subtitle.setOrigin(0.5);
        this.menuContainer.add(subtitle);

        // Start button
        const startButton = this.createButton(640, 350, 'START GAME', () => {
            this.hideMenu();
            this.scene.startGame();
        });
        this.menuContainer.add(startButton);

        // How to Play button
        const howToButton = this.createButton(640, 430, 'HOW TO PLAY', () => {
            this.showHowToPlay();
        });
        this.menuContainer.add(howToButton);

        // High Score display
        const highScoreText = this.scene.add.text(640, 520,
            `HIGH SCORE: ${this.highScores[0]?.score || 0}`, {
            fontSize: '24px',
            fontFamily: 'Courier New, monospace',
            color: '#ffff00'
        });
        highScoreText.setOrigin(0.5);
        this.menuContainer.add(highScoreText);

        // Dedication (heartfelt message)
        const dedication = this.scene.add.text(640, 540,
            '~ Dedicated to the good old 80s ~\nand to the kid I once was', {
            fontSize: '18px',
            fontFamily: 'Courier New, monospace',
            color: '#9d4edd',
            align: 'center',
            fontStyle: 'italic',
            lineSpacing: 5
        });
        dedication.setOrigin(0.5);
        this.menuContainer.add(dedication);

        // Controls hint
        const controls = this.scene.add.text(640, 610,
            'SPACE/UP: Jump | DOWN: Slide | P: Pause', {
            fontSize: '16px',
            fontFamily: 'Courier New, monospace',
            color: '#CCCCCC'
        });
        controls.setOrigin(0.5);
        this.menuContainer.add(controls);

        // Creator credits with year (prominent)
        const creator = this.scene.add.text(640, 655,
            'Created by the almighty Tasso Kala-e-Jakis • 2025', {
            fontSize: '16px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff',
            fontStyle: 'bold'
        });
        creator.setOrigin(0.5);
        this.menuContainer.add(creator);

        // Tech credits (smaller, less prominent)
        const credits = this.scene.add.text(640, 690,
            'Phaser 3 | Music: Suno AI', {
            fontSize: '12px',
            fontFamily: 'Courier New, monospace',
            color: '#999999'
        });
        credits.setOrigin(0.5);
        this.menuContainer.add(credits);
    }

    /**
     * Create HUD elements
     */
    createHUD() {
        this.hudContainer = this.scene.add.container(0, 0);
        this.hudContainer.setDepth(1000); // ABOVE everything else

        // Score
        this.scoreText = this.scene.add.text(30, 30, 'SCORE: 0', {
            fontSize: '32px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.hudContainer.add(this.scoreText);

        // Combo multiplier
        this.comboText = this.scene.add.text(30, 75, '', {
            fontSize: '24px',
            fontFamily: 'Courier New, monospace',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.hudContainer.add(this.comboText);

        // Era indicator
        this.eraText = this.scene.add.text(1250, 30, '8-BIT', {
            fontSize: '28px',
            fontFamily: 'Courier New, monospace',
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.eraText.setOrigin(1, 0);
        this.hudContainer.add(this.eraText);

        // Era progress bar background
        const progressBg = this.scene.add.graphics();
        progressBg.fillStyle(0x333333, 0.8);
        progressBg.fillRect(1050, 70, 200, 20);
        this.hudContainer.add(progressBg);

        // Era progress bar
        this.eraProgressBar = this.scene.add.graphics();
        this.hudContainer.add(this.eraProgressBar);

        // Speed indicator
        this.speedText = this.scene.add.text(30, 650, 'SPEED: 400', {
            fontSize: '20px',
            fontFamily: 'Courier New, monospace',
            color: '#CCCCCC'
        });
        this.hudContainer.add(this.speedText);

        // Initial hint (fades after 5 seconds)
        this.hintText = this.scene.add.text(640, 500,
            'Press SPACE to Jump!', {
            fontSize: '24px',
            fontFamily: 'Courier New, monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.hintText.setOrigin(0.5);
        this.hudContainer.add(this.hintText);

        this.scene.time.delayedCall(5000, () => {
            this.scene.tweens.add({
                targets: this.hintText,
                alpha: 0,
                duration: 1000,
                onComplete: () => this.hintText.setVisible(false)
            });
        });

        this.hudContainer.setVisible(false);
    }

    /**
     * Create game over screen
     */
    createGameOverScreen() {
        this.gameOverContainer = this.scene.add.container(0, 0);
        this.gameOverContainer.setDepth(1000); // ABOVE everything else

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(0, 0, 1280, 720);
        this.gameOverContainer.add(bg);

        // Game Over title
        const title = this.scene.add.text(640, 150, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Courier New, monospace',
            color: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        this.gameOverContainer.add(title);

        // Final score (will be updated)
        this.finalScoreText = this.scene.add.text(640, 250, 'SCORE: 0', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff'
        });
        this.finalScoreText.setOrigin(0.5);
        this.gameOverContainer.add(this.finalScoreText);

        // High score indicator
        this.newHighScoreText = this.scene.add.text(640, 310, '', {
            fontSize: '28px',
            fontFamily: 'Courier New, monospace',
            color: '#ffff00'
        });
        this.newHighScoreText.setOrigin(0.5);
        this.gameOverContainer.add(this.newHighScoreText);

        // Stats
        this.statsText = this.scene.add.text(640, 380, '', {
            fontSize: '20px',
            fontFamily: 'Courier New, monospace',
            color: '#ffffff',
            align: 'center'
        });
        this.statsText.setOrigin(0.5);
        this.gameOverContainer.add(this.statsText);

        // Retry button
        const retryButton = this.createButton(540, 500, 'RETRY', () => {
            this.hideGameOver();
            this.scene.restartGame();
        });
        this.gameOverContainer.add(retryButton);

        // Menu button (10px gap from RETRY button)
        const menuButton = this.createButton(750, 500, 'MENU', () => {
            this.hideGameOver();
            this.showMenu();
            this.scene.returnToMenu();
        });
        this.gameOverContainer.add(menuButton);

        // Leaderboard
        this.leaderboardText = this.scene.add.text(640, 580, '', {
            fontSize: '18px',
            fontFamily: 'Courier New, monospace',
            color: '#9d4edd',
            align: 'center'
        });
        this.leaderboardText.setOrigin(0.5);
        this.gameOverContainer.add(this.leaderboardText);

        // Creator credits on game over screen
        const gameOverCredits = this.scene.add.text(640, 670,
            'by Tasso Kala-e-Jakis • 2025', {
            fontSize: '14px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff'
        });
        gameOverCredits.setOrigin(0.5);
        this.gameOverContainer.add(gameOverCredits);

        this.gameOverContainer.setVisible(false);
    }

    /**
     * Create a button
     */
    createButton(x, y, text, callback) {
        const button = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x7209B7, 1);
        bg.fillRect(-100, -30, 200, 60);
        bg.lineStyle(3, 0x00FFFF, 1);
        bg.strokeRect(-100, -30, 200, 60);

        const label = this.scene.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: 'Courier New, monospace',
            color: '#ffffff'
        });
        label.setOrigin(0.5);

        button.add([bg, label]);

        // Make interactive
        const hitArea = new Phaser.Geom.Rectangle(-100, -30, 200, 60);
        button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        button.on('pointerover', () => {
            this.scene.input.setDefaultCursor('pointer');
            bg.clear();
            bg.fillStyle(0x9D4EDD, 1);
            bg.fillRect(-100, -30, 200, 60);
            bg.lineStyle(3, 0xFF00FF, 1);
            bg.strokeRect(-100, -30, 200, 60);
        });

        button.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default');
            bg.clear();
            bg.fillStyle(0x7209B7, 1);
            bg.fillRect(-100, -30, 200, 60);
            bg.lineStyle(3, 0x00FFFF, 1);
            bg.strokeRect(-100, -30, 200, 60);
        });

        button.on('pointerdown', callback);

        return button;
    }

    /**
     * Update HUD during gameplay
     */
    updateHUD(scoreData, eraProgress, eraName) {
        if (this.state !== 'playing') return;

        // Update score
        this.scoreText.setText(`SCORE: ${scoreData.score}`);

        // Update combo
        if (scoreData.combo > 1) {
            this.comboText.setText(`COMBO x${scoreData.combo}`);
            this.comboText.setVisible(true);
        } else {
            this.comboText.setVisible(false);
        }

        // Update era
        this.eraText.setText(eraName);

        // Update era progress bar
        this.eraProgressBar.clear();
        const barColor = eraName === '8-BIT' ? 0x9BBC0F :
                        eraName === '16-BIT' ? 0xFF00FF : 0x00FFFF;
        this.eraProgressBar.fillStyle(barColor, 0.8);
        this.eraProgressBar.fillRect(1050, 70, 200 * eraProgress, 20);

        // Update speed
        this.speedText.setText(`SPEED: ${scoreData.speed}`);
    }

    /**
     * Show menu
     */
    showMenu() {
        console.log('📋 SHOWING MENU');
        this.state = 'menu';
        this.menuContainer.setVisible(true);
        this.menuContainer.setAlpha(1); // Ensure fully opaque
        this.hudContainer.setVisible(false);
        this.gameOverContainer.setVisible(false);
        console.log('   Menu visible:', this.menuContainer.visible);
        console.log('   Menu alpha:', this.menuContainer.alpha);
        console.log('   Menu depth:', this.menuContainer.depth);
    }

    /**
     * Hide menu
     */
    hideMenu() {
        // Close how to play overlay if open
        if (this.howToPlayOverlay) {
            this.howToPlayOverlay.destroy();
            this.howToPlayOverlay = null;
        }

        this.menuContainer.setVisible(false);
        this.hudContainer.setVisible(true);
        this.state = 'playing';
    }

    /**
     * Show game over screen
     */
    showGameOver(scoreData, erasCompleted) {
        this.state = 'gameover';
        this.hudContainer.setVisible(false);
        this.gameOverContainer.setVisible(true);

        // Update final score
        const finalScore = scoreData.score;
        this.finalScoreText.setText(`SCORE: ${finalScore}`);

        // Check for new high score
        const isNewHighScore = this.addHighScore(finalScore);
        if (isNewHighScore) {
            this.newHighScoreText.setText('★ NEW HIGH SCORE ★');
            this.newHighScoreText.setVisible(true);

            // Pulse animation
            this.scene.tweens.add({
                targets: this.newHighScoreText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.newHighScoreText.setVisible(false);
        }

        // Update stats
        this.statsText.setText(
            `Distance: ${scoreData.distance}m\n` +
            `Eras Completed: ${erasCompleted}\n` +
            `Max Combo: x${scoreData.combo}`
        );

        // Update leaderboard
        this.updateLeaderboard();
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        this.gameOverContainer.setVisible(false);
    }

    /**
     * Show how to play
     */
    showHowToPlay() {
        // Hide any existing overlay first
        if (this.howToPlayOverlay) {
            this.howToPlayOverlay.destroy();
            this.howToPlayOverlay = null;
        }

        // Create temporary overlay
        const overlay = this.scene.add.container(0, 0);
        overlay.setDepth(2000); // ABOVE EVERYTHING (menu is 1000)
        this.howToPlayOverlay = overlay; // Store reference

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRect(0, 0, 1280, 720);
        bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
        overlay.add(bg);

        const title = this.scene.add.text(640, 80, 'HOW TO PLAY', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#00ffff'
        });
        title.setOrigin(0.5);
        overlay.add(title);

        const instructions = this.scene.add.text(640, 360,
            '• Press SPACE or UP ARROW to JUMP\n\n' +
            '• Press DOWN ARROW to SLIDE\n\n' +
            '• You can DOUBLE JUMP in mid-air\n\n' +
            '• Survive three eras: 8-BIT → 16-BIT → NEON\n\n' +
            '• Each era lasts 10 seconds with unique obstacles\n\n' +
            '• Build combos by dodging consecutive obstacles\n\n' +
            '• Speed increases as you progress\n\n' +
            'Press any key or click to return...', {
            fontSize: '22px',
            fontFamily: 'Courier New, monospace',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        });
        instructions.setOrigin(0.5);
        overlay.add(instructions);

        // Close on any key OR click
        const closeHandler = () => {
            if (this.howToPlayOverlay) {
                this.howToPlayOverlay.destroy();
                this.howToPlayOverlay = null;
            }
            this.scene.input.keyboard.off('keydown', closeHandler);
            bg.off('pointerdown', closeHandler);
        };
        this.scene.input.keyboard.on('keydown', closeHandler);
        bg.on('pointerdown', closeHandler);
    }

    /**
     * Load high scores from localStorage
     */
    loadHighScores() {
        const saved = localStorage.getItem('neonRunnerHighScores');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    /**
     * Add new high score
     */
    addHighScore(score) {
        this.highScores.push({ score, date: Date.now() });
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5); // Keep top 5

        localStorage.setItem('neonRunnerHighScores', JSON.stringify(this.highScores));

        return this.highScores[0].score === score;
    }

    /**
     * Update leaderboard display
     */
    updateLeaderboard() {
        let leaderboardStr = 'TOP SCORES\n\n';
        this.highScores.forEach((entry, index) => {
            leaderboardStr += `${index + 1}. ${entry.score}\n`;
        });

        this.leaderboardText.setText(leaderboardStr);
    }

    /**
     * Clean up
     */
    destroy() {
        this.menuContainer.destroy();
        this.hudContainer.destroy();
        this.gameOverContainer.destroy();
    }
}
