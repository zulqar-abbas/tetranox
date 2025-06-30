// Main application entry point
class TetrisApp {
    constructor() {
        this.gameEngine = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Initialize managers
            this.initializeManagers();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved data
            this.loadSavedData();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize Tetris app:', error);
            this.showInitializationError(error);
        }
    }

    async initializeFirebase() {
        try {
            // Firebase should already be initialized via firebase-config.js
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }
        } catch (error) {
            console.warn('Firebase initialization failed:', error);
            // Continue without Firebase for local-only mode
        }
    }

    initializeManagers() {
        // Initialize all managers (they should auto-initialize)
        // These are already initialized in their respective files
    }

    setupEventListeners() {
        // Keyboard controls
        this.setupKeyboardControls();
        
        // Touch controls for mobile
        this.setupTouchControls();
        
        // Window events
        this.setupWindowEvents();
        
        // Power-up buttons
        this.setupPowerupButtons();
        
        // Game over events
        if (window.screenManager) {
            window.screenManager.bindGameOverEvents();
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const gameEngine = window.gameEngine;
            if (!gameEngine || gameEngine.isGameOver) return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    gameEngine.moveLeft();
                    break;
                    
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    gameEngine.moveRight();
                    break;
                    
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    gameEngine.moveDown();
                    break;
                    
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    gameEngine.rotate();
                    break;
                    
                case 'Space':
                    e.preventDefault();
                    gameEngine.hardDrop();
                    break;
                    
                case 'KeyC':
                case 'ShiftLeft':
                case 'ShiftRight':
                    e.preventDefault();
                    gameEngine.hold();
                    break;
                    
                case 'KeyR':
                    e.preventDefault();
                    gameEngine.reset();
                    gameEngine.start();
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    if (gameEngine.isPaused) {
                        gameEngine.resume();
                    } else {
                        gameEngine.pause();
                    }
                    break;
                    
                case 'Digit1':
                    e.preventDefault();
                    gameEngine.activatePowerup('SLOW_TIME');
                    break;
                    
                case 'Digit2':
                    e.preventDefault();
                    gameEngine.activatePowerup('FREEZE_LINE');
                    break;
                    
                case 'Digit3':
                    e.preventDefault();
                    gameEngine.activatePowerup('BOMB_PIECE');
                    break;
            }
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        document.addEventListener('touchstart', (e) => {
            const gameEngine = window.gameEngine;
            if (!gameEngine || gameEngine.isGameOver) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });

        document.addEventListener('touchend', (e) => {
            const gameEngine = window.gameEngine;
            if (!gameEngine || gameEngine.isGameOver) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            // Determine gesture
            if (deltaTime < 200) { // Quick tap
                if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) {
                    // Tap - rotate piece
                    gameEngine.rotate();
                }
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 50) {
                    gameEngine.moveRight();
                } else if (deltaX < -50) {
                    gameEngine.moveLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY > 50) {
                    gameEngine.hardDrop();
                }
            }
        });
    }

    setupWindowEvents() {
        // Handle window focus/blur
        window.addEventListener('focus', () => {
            const gameEngine = window.gameEngine;
            if (gameEngine && !gameEngine.isGameOver) {
                gameEngine.resume();
            }
        });

        window.addEventListener('blur', () => {
            const gameEngine = window.gameEngine;
            if (gameEngine && !gameEngine.isGameOver) {
                gameEngine.pause();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
    }

    setupPowerupButtons() {
        const powerupElements = document.querySelectorAll('.powerup');
        powerupElements.forEach(element => {
            element.addEventListener('click', () => {
                const gameEngine = window.gameEngine;
                if (!gameEngine || gameEngine.isGameOver) return;
                
                const powerupType = element.dataset.powerup;
                if (powerupType) {
                    const gamePowerupType = this.mapPowerupType(powerupType);
                    gameEngine.activatePowerup(gamePowerupType);
                }
            });
        });
    }

    mapPowerupType(htmlType) {
        const mapping = {
            'slow-time': 'SLOW_TIME',
            'bomb-piece': 'BOMB_PIECE',
            'freeze-line': 'FREEZE_LINE'
        };
        return mapping[htmlType] || htmlType;
    }

    handleResize() {
        // Simple layout adjustment - no canvas resizing
        // The main game board stays at its fixed size (320x640)
        // Only adjust positioning and layout of other elements
        
        // Redraw if game is running to ensure crisp rendering
        if (this.gameEngine && !this.gameEngine.gameOver) {
            this.gameEngine.render();
        }
    }

    loadSavedData() {
        try {
            // Load saved game state
            const savedState = window.StorageManager.loadGameState();
            if (savedState && savedState.autoSave !== false) {
                this.showResumeGameDialog(savedState);
            }

            // Load settings
            if (window.screenManager) {
                window.screenManager.loadSettings();
            }

        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    showResumeGameDialog(savedState) {
        const dialog = document.createElement('div');
        dialog.className = 'resume-dialog';
        dialog.innerHTML = `
            <div class="resume-content">
                <h3>Resume Game?</h3>
                <p>You have a saved game with ${savedState.score || 0} points.</p>
                <div class="resume-buttons">
                    <button id="resume-yes">Resume</button>
                    <button id="resume-no">New Game</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('resume-yes').addEventListener('click', () => {
            this.resumeGame(savedState);
            document.body.removeChild(dialog);
        });

        document.getElementById('resume-no').addEventListener('click', () => {
            window.StorageManager.clearGameState();
            document.body.removeChild(dialog);
        });
    }

    resumeGame(savedState) {
        if (window.screenManager) {
            window.screenManager.showScreen('game');
        }

        // Initialize game engine with saved state
        const canvas = document.getElementById('game-board');
        if (canvas) {
            this.gameEngine = new GameEngine(canvas, savedState);
        }
    }

    saveGameState() {
        if (this.gameEngine && !this.gameEngine.gameOver) {
            const gameState = this.gameEngine.getGameState();
            window.StorageManager.saveGameState(gameState);
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showInitializationError(error) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-message">
                    <h2>Initialization Error</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    getGameEngine() {
        return this.gameEngine;
    }

    setGameEngine(engine) {
        this.gameEngine = engine;
    }

    isReady() {
        return this.isInitialized;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            gameEngine: !!this.gameEngine,
            gameOver: this.gameEngine ? this.gameEngine.gameOver : null,
            score: this.gameEngine ? this.gameEngine.score : 0,
            level: this.gameEngine ? this.gameEngine.level : 0,
            lines: this.gameEngine ? this.gameEngine.lines : 0,
            managers: {
                storage: !!window.StorageManager,
                achievements: !!window.AchievementManager,
                theme: !!window.themeManager,
                sound: !!window.soundManager,
                screen: !!window.screenManager,
                leaderboard: !!window.leaderboardManager
            }
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tetrisApp = new TetrisApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TetrisApp;
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.tetrisApp) {
        window.tetrisApp.showNotification('An error occurred. Please refresh the page.', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.tetrisApp) {
        window.tetrisApp.showNotification('A network error occurred.', 'error');
    }
});

// Export for debugging
window.TetrisApp = TetrisApp; 