// Sound Management System

class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.isEnabled = true;
        this.audioContext = null;
        
        this.init();
    }

    // Initialize sound manager
    init() {
        // Load settings
        const settings = window.StorageManager.loadSettings();
        this.volume = settings.soundVolume / 100 || 0.5;
        this.isEnabled = settings.soundEnabled !== false;
        
        // Initialize audio context
        this.initAudioContext();
        
        // Load sound effects
        this.loadSounds();
        
        // Load music
        this.loadMusic();
        
        // Add volume control event listener
        const volumeSlider = document.getElementById('sound-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
        
        // Add sound toggle event listener
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
    }

    // Initialize audio context
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported');
        }
    }

    // Load sound effects
    loadSounds() {
        // Create sound effects using Web Audio API
        this.sounds = {
            move: this.createSound(200, 'sine', 0.1),
            rotate: this.createSound(300, 'sine', 0.1),
            drop: this.createSound(150, 'sine', 0.15),
            hardDrop: this.createSound(100, 'square', 0.2),
            lineClear: this.createSound(400, 'sine', 0.2),
            tetris: this.createSound(600, 'sine', 0.3),
            levelUp: this.createSound(800, 'sine', 0.3),
            gameOver: this.createSound(200, 'sawtooth', 0.4),
            powerup: this.createSound(500, 'triangle', 0.2),
            achievement: this.createSound(700, 'sine', 0.25),
            button: this.createSound(250, 'sine', 0.1),
            error: this.createSound(150, 'sawtooth', 0.2)
        };
    }

    // Load music
    loadMusic() {
        // Create background music patterns
        this.music = {
            menu: this.createMusicPattern('menu'),
            game: this.createMusicPattern('game'),
            victory: this.createMusicPattern('victory'),
            defeat: this.createMusicPattern('defeat')
        };
    }

    // Create a simple sound effect
    createSound(frequency, type, duration) {
        return {
            frequency: frequency,
            type: type,
            duration: duration,
            play: (volume = 1) => this.playSound(frequency, type, duration, volume)
        };
    }

    // Play a sound effect
    playSound(frequency, type, duration, volume = 1) {
        if (!this.isEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }

    // Create music pattern
    createMusicPattern(type) {
        const patterns = {
            menu: [
                { note: 'C4', duration: 0.5 },
                { note: 'E4', duration: 0.5 },
                { note: 'G4', duration: 0.5 },
                { note: 'C5', duration: 1.0 }
            ],
            game: [
                { note: 'A3', duration: 0.25 },
                { note: 'C4', duration: 0.25 },
                { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }
            ],
            victory: [
                { note: 'C5', duration: 0.3 },
                { note: 'E5', duration: 0.3 },
                { note: 'G5', duration: 0.3 },
                { note: 'C6', duration: 0.6 }
            ],
            defeat: [
                { note: 'C3', duration: 0.5 },
                { note: 'A2', duration: 0.5 },
                { note: 'F2', duration: 1.0 }
            ]
        };
        
        return {
            pattern: patterns[type] || patterns.menu,
            play: () => this.playMusicPattern(patterns[type] || patterns.menu)
        };
    }

    // Play music pattern
    playMusicPattern(pattern) {
        if (!this.isEnabled || !this.audioContext) return;

        pattern.forEach((note, index) => {
            const frequency = this.noteToFrequency(note.note);
            const delay = index * 0.5; // 0.5 second between notes
            
            setTimeout(() => {
                this.playSound(frequency, 'sine', note.duration, this.musicVolume);
            }, delay * 1000);
        });
    }

    // Convert note to frequency
    noteToFrequency(note) {
        const notes = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
        
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const baseFreq = notes[noteName];
        
        return baseFreq * Math.pow(2, octave - 4);
    }

    // Play sound effect
    play(soundName, volume = 1) {
        if (!this.isEnabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.play(volume);
        }
    }

    // Play music
    playMusic(musicName) {
        if (!this.isEnabled) return;
        
        const music = this.music[musicName];
        if (music) {
            this.stopMusic();
            this.currentMusic = musicName;
            music.play();
        }
    }

    // Stop current music
    stopMusic() {
        this.currentMusic = null;
    }

    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume display
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.volume * 100)}%`;
        }
        
        // Save settings
        const settings = window.StorageManager.loadSettings();
        settings.soundVolume = Math.round(this.volume * 100);
        window.StorageManager.saveSettings(settings);
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    // Toggle sound on/off
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        
        // Update button text
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = this.isEnabled ? '🔊' : '🔇';
        }
        
        // Save settings
        const settings = window.StorageManager.loadSettings();
        settings.soundEnabled = this.isEnabled;
        window.StorageManager.saveSettings(settings);
        
        if (!this.isEnabled) {
            this.stopMusic();
        }
    }

    // Game-specific sound effects
    playMoveSound() {
        this.play('move', 0.3);
    }

    playRotateSound() {
        this.play('rotate', 0.4);
    }

    playDropSound() {
        this.play('drop', 0.5);
    }

    playHardDropSound() {
        this.play('hardDrop', 0.6);
    }

    playLineClearSound(lines) {
        if (lines === 4) {
            this.play('tetris', 0.7);
        } else {
            this.play('lineClear', 0.5);
        }
    }

    playLevelUpSound() {
        this.play('levelUp', 0.8);
    }

    playGameOverSound() {
        this.play('gameOver', 0.9);
    }

    playPowerupSound() {
        this.play('powerup', 0.6);
    }

    playAchievementSound() {
        this.play('achievement', 0.7);
    }

    playButtonSound() {
        this.play('button', 0.3);
    }

    playErrorSound() {
        this.play('error', 0.4);
    }

    // Create more complex sound effects
    createComplexSound(frequencies, durations, type = 'sine') {
        return {
            frequencies: frequencies,
            durations: durations,
            type: type,
            play: (volume = 1) => this.playComplexSound(frequencies, durations, type, volume)
        };
    }

    // Play complex sound
    playComplexSound(frequencies, durations, type, volume = 1) {
        if (!this.isEnabled || !this.audioContext) return;

        frequencies.forEach((freq, index) => {
            const delay = durations.slice(0, index).reduce((sum, dur) => sum + dur, 0);
            setTimeout(() => {
                this.playSound(freq, type, durations[index], volume);
            }, delay * 1000);
        });
    }

    // Create ambient background sounds
    createAmbientSound() {
        const ambient = {
            play: () => {
                if (!this.isEnabled || !this.audioContext) return;
                
                // Create a subtle background hum
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01 * this.volume, this.audioContext.currentTime + 1);
                
                oscillator.start(this.audioContext.currentTime);
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
                        setTimeout(() => oscillator.stop(), 1000);
                    }
                };
            }
        };
        
        return ambient;
    }

    // Create sound for specific game events
    createEventSound(event) {
        const eventSounds = {
            'piece-locked': () => this.play('drop', 0.4),
            'line-complete': (lines) => this.playLineClearSound(lines),
            'level-up': () => this.play('levelUp', 0.8),
            'powerup-activated': () => this.play('powerup', 0.6),
            'achievement-unlocked': () => this.play('achievement', 0.7),
            'game-over': () => this.play('gameOver', 0.9),
            'menu-navigate': () => this.play('button', 0.2),
            'error': () => this.play('error', 0.4)
        };
        
        return eventSounds[event] || (() => {});
    }

    // Get sound statistics
    getSoundStats() {
        return {
            enabled: this.isEnabled,
            volume: this.volume,
            musicVolume: this.musicVolume,
            currentMusic: this.currentMusic,
            soundsLoaded: Object.keys(this.sounds).length,
            musicLoaded: Object.keys(this.music).length
        };
    }

    // Reset sound settings
    resetSettings() {
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.isEnabled = true;
        
        // Update UI
        const volumeSlider = document.getElementById('sound-volume');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
        
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.volume * 100)}%`;
        }
        
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = '🔊';
        }
    }

    // Clean up audio context
    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export SoundManager
window.SoundManager = SoundManager;

// Initialize sound manager
const soundManager = new SoundManager();
window.soundManager = soundManager; 