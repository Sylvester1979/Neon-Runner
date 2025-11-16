/**
 * AudioManager - Handles all game audio with graceful fallback for missing files
 * CRITICAL: Game must work perfectly even if audio files don't exist!
 */
class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTrack = null;
        this.audioEnabled = true;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;

        // Track loading status
        this.tracksLoaded = {
            menu: false,
            era_8bit: false,
            era_16bit: false,
            era_neon: false
        };

        // Sound effects (will be created procedurally if audio files missing)
        this.sfx = {};
    }

    /**
     * Preload audio files - called in scene preload()
     * Uses error handling to prevent crashes if files are missing
     */
    preloadAudio() {
        const audioFiles = [
            { key: 'menu', path: 'assets/audio/menu.mp3' },
            { key: 'era_8bit', path: 'assets/audio/era_8bit.mp3' },
            { key: 'era_16bit', path: 'assets/audio/era_16bit.mp3' },
            { key: 'era_neon', path: 'assets/audio/era_neon.mp3' }
        ];

        audioFiles.forEach(file => {
            // Phaser will handle missing files gracefully in the load event
            this.scene.load.audio(file.key, file.path);
        });

        // Listen for load errors
        this.scene.load.on('loaderror', (file) => {
            if (file.type === 'audio') {
                console.log(`🔇 Audio file not found: ${file.key} - Game will run without music`);
                this.tracksLoaded[file.key] = false;
            }
        });

        // Listen for successful loads
        this.scene.load.on('filecomplete-audio', (key) => {
            this.tracksLoaded[key] = true;
            console.log(`🎵 Loaded audio: ${key}`);
        });
    }

    /**
     * Initialize audio system after scene is created
     */
    init() {
        // Check if any music was loaded
        const anyMusicLoaded = Object.values(this.tracksLoaded).some(loaded => loaded);

        if (!anyMusicLoaded) {
            console.log('🔇 No music files found. Add MP3 files to assets/audio/ folder.');
            console.log('📖 See assets/audio/README.md for instructions');
        }

        // Create procedural sound effects (always work, even without files)
        this.createProceduralSFX();
    }

    /**
     * Create simple procedural sound effects using Web Audio API
     */
    createProceduralSFX() {
        // These are backup sounds that always work
        this.sfx.jump = this.createBeep(440, 0.1);
        this.sfx.slide = this.createBeep(220, 0.15);
        this.sfx.collision = this.createBeep(110, 0.3);
        this.sfx.transition = this.createBeep(880, 0.2);
    }

    /**
     * Create a simple beep sound
     */
    createBeep(frequency, duration) {
        return {
            play: () => {
                if (!this.audioEnabled) return;

                const audioContext = this.scene.sound.context;
                if (!audioContext) return;

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'square';

                gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }
        };
    }

    /**
     * Play a music track with crossfade
     * @param {string} trackName - Name of the track (menu, era_8bit, era_16bit, era_neon)
     * @param {boolean} loop - Whether to loop the track
     * @param {number} fadeTime - Crossfade duration in milliseconds
     */
    playTrack(trackName, loop = true, fadeTime = 1000) {
        if (!this.audioEnabled) return;

        // Check if track exists
        if (!this.tracksLoaded[trackName]) {
            console.log(`🔇 Track '${trackName}' not available`);
            return;
        }

        // If same track is playing, do nothing
        if (this.currentTrack && this.currentTrack.key === trackName && this.currentTrack.isPlaying) {
            return;
        }

        // Fade out current track
        if (this.currentTrack && this.currentTrack.isPlaying) {
            this.scene.tweens.add({
                targets: this.currentTrack,
                volume: 0,
                duration: fadeTime,
                onComplete: () => {
                    this.currentTrack.stop();
                }
            });
        }

        // Create and play new track
        const newTrack = this.scene.sound.add(trackName, {
            loop: loop,
            volume: 0
        });

        newTrack.play();

        // Fade in new track
        this.scene.tweens.add({
            targets: newTrack,
            volume: this.musicVolume,
            duration: fadeTime
        });

        this.currentTrack = newTrack;
    }

    /**
     * Play a sound effect
     * @param {string} sfxName - Name of the sound effect
     */
    playSFX(sfxName) {
        if (!this.audioEnabled) return;

        if (this.sfx[sfxName]) {
            this.sfx[sfxName].play();
        }
    }

    /**
     * Stop all music
     */
    stopMusic(fadeTime = 500) {
        if (this.currentTrack && this.currentTrack.isPlaying) {
            this.scene.tweens.add({
                targets: this.currentTrack,
                volume: 0,
                duration: fadeTime,
                onComplete: () => {
                    this.currentTrack.stop();
                    this.currentTrack = null;
                }
            });
        }
    }

    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;

        if (!this.audioEnabled) {
            this.stopMusic(100);
        }

        return this.audioEnabled;
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentTrack) {
            this.currentTrack.setVolume(this.musicVolume);
        }
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    }

    /**
     * Clean up
     */
    destroy() {
        this.stopMusic(0);
    }
}
