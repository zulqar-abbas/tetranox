class ScreenManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.screens = {
            'loading': 'loading-screen',
            'main-menu': 'main-menu',
            'single-player-setup': 'single-player-setup',
            'multiplayer-setup': 'multiplayer-setup',
            'game': 'game-screen',
            'leaderboard': 'leaderboard-screen',
            'settings': 'settings-screen'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindGameOverEvents();
        this.loadSettings();
    }

    bindEvents() {
        // Main menu navigation
        const singlePlayerBtn = document.getElementById('single-player-btn');
        if (singlePlayerBtn) {
            singlePlayerBtn.addEventListener('click', () => {
                this.showScreen('single-player-setup');
            });
        }

        const multiplayerBtn = document.getElementById('multiplayer-btn');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => {
                this.showScreen('multiplayer-setup');
            });
        }

        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.showScreen('leaderboard');
                if (window.leaderboardManager) {
                    leaderboardManager.loadLeaderboards();
                }
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showScreen('settings');
            });
        }

        // Back buttons
        const backToMenu = document.getElementById('back-to-menu');
        if (backToMenu) {
            backToMenu.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        const backToMenu2 = document.getElementById('back-to-menu-2');
        if (backToMenu2) {
            backToMenu2.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        const backToMenu3 = document.getElementById('back-to-menu-3');
        if (backToMenu3) {
            backToMenu3.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        const backToMenu4 = document.getElementById('back-to-menu-4');
        if (backToMenu4) {
            backToMenu4.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        // Game controls
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (window.gameEngine) {
                    gameEngine.togglePause();
                }
            });
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                if (window.themeManager) {
                    themeManager.cycleTheme();
                }
            });
        }

        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                if (window.soundManager) {
                    soundManager.toggleSound();
                }
            });
        }

        // Settings
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Single player setup
        const startSinglePlayerBtn = document.getElementById('start-single-player');
        if (startSinglePlayerBtn) {
            startSinglePlayerBtn.addEventListener('click', () => {
                this.startSinglePlayer();
            });
        }

        // Multiplayer setup
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                this.createMultiplayerRoom();
            });
        }

        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                this.joinMultiplayerRoom();
            });
        }

        // Room modal
        const copyRoomCodeBtn = document.getElementById('copy-room-code');
        if (copyRoomCodeBtn) {
            copyRoomCodeBtn.addEventListener('click', () => {
                this.copyRoomCode();
            });
        }

        const cancelRoomBtn = document.getElementById('cancel-room');
        if (cancelRoomBtn) {
            cancelRoomBtn.addEventListener('click', () => {
                this.cancelRoom();
            });
        }

        // Chat
        const sendChatBtn = document.getElementById('send-chat');
        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Settings form
        this.bindSettingsForm();
    }

    bindSettingsForm() {
        const themeSelector = document.getElementById('theme-selector');
        const soundVolume = document.getElementById('sound-volume');
        const volumeDisplay = document.getElementById('volume-display');
        const ghostPieceToggle = document.getElementById('ghost-piece-toggle');
        const particlesToggle = document.getElementById('particles-toggle');
        const autoSaveToggle = document.getElementById('auto-save-toggle');

        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                if (window.themeManager) {
                    themeManager.setTheme(e.target.value);
                }
            });
        }

        if (soundVolume) {
            soundVolume.addEventListener('input', (e) => {
                const volume = e.target.value;
                if (volumeDisplay) {
                    volumeDisplay.textContent = `${volume}%`;
                }
                if (window.soundManager) {
                    soundManager.setVolume(volume / 100);
                }
            });
        }

        // Bind toggle events for immediate feedback
        if (ghostPieceToggle) {
            ghostPieceToggle.addEventListener('change', (e) => {
                // Save immediately for immediate feedback
                this.saveSettings();
            });
        }

        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                // Save immediately for immediate feedback
                this.saveSettings();
            });
        }

        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                // Save immediately for immediate feedback
                this.saveSettings();
            });
        }
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(this.screens[screenName]);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }

        // Handle screen-specific logic
        this.handleScreenChange(screenName);
    }

    handleScreenChange(screenName) {
        switch (screenName) {
            case 'main-menu':
                this.hideLoadingScreen();
                break;
            case 'game':
                this.setupGameScreen();
                break;
            case 'leaderboard':
                if (window.leaderboardManager) {
                    leaderboardManager.loadLeaderboards();
                }
                break;
            case 'settings':
                this.loadSettingsForm();
                break;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    setupGameScreen() {
        // The game screen uses a single layout for both single-player and multiplayer
        // No need to switch between different layouts
    }

    startSinglePlayer() {
        const nicknameInput = document.getElementById('single-nickname');
        const difficultySelect = document.getElementById('difficulty');
        const powerupsToggle = document.getElementById('powerups-toggle');
        
        const nickname = nicknameInput ? nicknameInput.value.trim() || 'Player' : 'Player';
        const difficulty = difficultySelect ? difficultySelect.value : 'medium';
        const powerupsEnabled = powerupsToggle ? powerupsToggle.checked : true;

        // Save nickname
        storageManager.save('nickname', nickname);

        // Initialize game
        if (window.gameEngine) {
            gameEngine.destroy();
        }

        // Create new game engine
        const canvas = document.getElementById('game-board');
        if (canvas) {
            window.gameEngine = new GameEngine(canvas, {
                difficulty: difficulty,
                powerupsEnabled: powerupsEnabled,
                nickname: nickname
            });
            
            // Start the game
            window.gameEngine.start();
        }

        this.showScreen('game');
    }

    createMultiplayerRoom() {
        const nicknameInput = document.getElementById('multi-nickname');
        const nickname = nicknameInput ? nicknameInput.value.trim() || 'Player' : 'Player';
        
        if (!nickname) {
            this.showError('Please enter a nickname');
            return;
        }

        // Save nickname
        storageManager.save('nickname', nickname);

        // Create room
        if (window.roomManager) {
            roomManager.createRoom(nickname).then(roomCode => {
                const roomCodeDisplay = document.getElementById('room-code-display');
                const roomModal = document.getElementById('room-modal');
                if (roomCodeDisplay) {
                    roomCodeDisplay.textContent = roomCode;
                }
                if (roomModal) {
                    roomModal.classList.remove('hidden');
                }
            }).catch(error => {
                this.showError('Failed to create room: ' + error.message);
            });
        }
    }

    joinMultiplayerRoom() {
        const nicknameInput = document.getElementById('multi-nickname');
        const roomCodeInput = document.getElementById('room-code');
        
        const nickname = nicknameInput ? nicknameInput.value.trim() || 'Player' : 'Player';
        const roomCode = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';

        if (!nickname) {
            this.showError('Please enter a nickname');
            return;
        }

        if (!roomCode) {
            this.showError('Please enter a room code');
            return;
        }

        // Save nickname
        storageManager.save('nickname', nickname);

        // Join room
        if (window.roomManager) {
            roomManager.joinRoom(roomCode, nickname).then(() => {
                this.showScreen('game');
            }).catch(error => {
                this.showError('Failed to join room: ' + error.message);
            });
        }
    }

    copyRoomCode() {
        const roomCodeDisplay = document.getElementById('room-code-display');
        if (!roomCodeDisplay) {
            this.showError('Room code display not found');
            return;
        }
        
        const roomCode = roomCodeDisplay.textContent;
        navigator.clipboard.writeText(roomCode).then(() => {
            this.showSuccess('Room code copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy room code');
        });
    }

    cancelRoom() {
        if (window.roomManager) {
            roomManager.cancelRoom();
        }
        const roomModal = document.getElementById('room-modal');
        if (roomModal) {
            roomModal.classList.add('hidden');
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input) {
            return;
        }
        
        const message = input.value.trim();

        if (message && window.roomManager) {
            roomManager.sendChatMessage(message);
            input.value = '';
        }
    }

    loadSettingsForm() {
        const settings = storageManager.loadSettings();
        
        const themeSelector = document.getElementById('theme-selector');
        const soundVolume = document.getElementById('sound-volume');
        const volumeDisplay = document.getElementById('volume-display');

        if (themeSelector) {
            themeSelector.value = settings.theme || 'classic';
        }
        if (soundVolume) {
            soundVolume.value = (settings.soundVolume || 0.5) * 100;
        }
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round((settings.soundVolume || 0.5) * 100)}%`;
        }

        const ghostPieceToggle = document.getElementById('ghost-piece-toggle');
        const particlesToggle = document.getElementById('particles-toggle');
        const autoSaveToggle = document.getElementById('auto-save-toggle');

        if (ghostPieceToggle) {
            ghostPieceToggle.checked = settings.showGhostPiece !== false;
        }
        if (particlesToggle) {
            particlesToggle.checked = settings.enableParticles !== false;
        }
        if (autoSaveToggle) {
            autoSaveToggle.checked = settings.autoSave !== false;
        }
    }

    saveSettings() {
        // Show saving indicator
        const saveBtn = document.getElementById('save-settings');
        let originalText = 'Save Settings'; // Default value
        
        if (saveBtn) {
            originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.7';
        }
        
        const themeSelector = document.getElementById('theme-selector');
        const soundVolume = document.getElementById('sound-volume');
        const ghostPieceToggle = document.getElementById('ghost-piece-toggle');
        const particlesToggle = document.getElementById('particles-toggle');
        const autoSaveToggle = document.getElementById('auto-save-toggle');
        
        const settings = {
            theme: themeSelector ? themeSelector.value : 'classic',
            soundVolume: soundVolume ? soundVolume.value / 100 : 0.5,
            showGhostPiece: ghostPieceToggle ? ghostPieceToggle.checked : true,
            enableParticles: particlesToggle ? particlesToggle.checked : true,
            autoSave: autoSaveToggle ? autoSaveToggle.checked : true
        };

        storageManager.saveSettings(settings);
        
        if (window.themeManager) {
            themeManager.setTheme(settings.theme);
        }
        if (window.soundManager) {
            soundManager.setVolume(settings.soundVolume);
        }
        
        // Restore button and show success
        setTimeout(() => {
            if (saveBtn) {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
            }
            this.showSuccess('Settings saved successfully!');
            
            // Also show a more prominent notification
            setTimeout(() => {
                this.showNotification('Settings have been saved and applied!', 'success');
            }, 100);
        }, 500);
    }

    loadSettings() {
        const settings = storageManager.loadSettings();
        
        if (settings.theme && window.themeManager) {
            themeManager.setTheme(settings.theme);
        }
        if (settings.soundVolume !== undefined && window.soundManager) {
            soundManager.setVolume(settings.soundVolume);
        }
    }

    showError(message) {
        console.error('Error:', message);
        // Create a temporary error notification
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        // Create a temporary success notification
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification with more prominent appearance
        const colors = {
            error: { bg: '#ff4444', text: '#ffffff', border: '#cc0000' },
            success: { bg: '#00ff00', text: '#000000', border: '#00cc00' },
            info: { bg: '#00aaff', text: '#ffffff', border: '#0088cc' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 1.5rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-weight: 700;
            font-size: 1.1rem;
            transform: translateX(400px);
            transition: transform 0.4s ease;
            max-width: 350px;
            word-wrap: break-word;
            border: 3px solid ${color.border};
            text-align: center;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds for better visibility
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }

    updateGameUI(gameState) {
        if (!gameState) return;

        // Update player info
        const playerName = document.getElementById('player-name');
        const playerScore = document.getElementById('player-score');
        const level = document.getElementById('level');
        const lines = document.getElementById('lines');

        if (playerName) playerName.textContent = gameState.nickname || 'Player';
        if (playerScore) playerScore.textContent = gameState.score || 0;
        if (level) level.textContent = gameState.level || 1;
        if (lines) lines.textContent = gameState.lines || 0;

        // Update multiplayer UI if applicable
        if (gameState.isMultiplayer) {
            const player1Name = document.getElementById('player1-name');
            const player1Score = document.getElementById('player1-score');
            const player1Lines = document.getElementById('player1-lines');
            const player2Name = document.getElementById('player2-name');
            const player2Score = document.getElementById('player2-score');
            const player2Lines = document.getElementById('player2-lines');

            if (player1Name) player1Name.textContent = gameState.player1?.nickname || 'Player 1';
            if (player1Score) player1Score.textContent = gameState.player1?.score || 0;
            if (player1Lines) player1Lines.textContent = gameState.player1?.lines || 0;
            if (player2Name) player2Name.textContent = gameState.player2?.nickname || 'Player 2';
            if (player2Score) player2Score.textContent = gameState.player2?.score || 0;
            if (player2Lines) player2Lines.textContent = gameState.player2?.lines || 0;
        }
    }

    showGameOver(finalScore, gameState = null) {
        const finalScoreElement = document.getElementById('final-score');
        const finalLinesElement = document.getElementById('final-lines');
        const finalLevelElement = document.getElementById('final-level');
        const finalTimeElement = document.getElementById('final-time');
        const overlay = document.getElementById('game-overlay');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = finalScore.toLocaleString();
        }
        
        if (finalLinesElement && gameState) {
            finalLinesElement.textContent = gameState.lines || 0;
        }
        
        if (finalLevelElement && gameState) {
            finalLevelElement.textContent = gameState.level || 1;
        }
        
        if (finalTimeElement && gameState) {
            const minutes = Math.floor((gameState.time || 0) / 60);
            const seconds = (gameState.time || 0) % 60;
            finalTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (overlay) {
            overlay.classList.add('show');
            
            // Force inline styles for visibility
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0, 0, 0, 0.9)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '1000';
            overlay.style.backdropFilter = 'blur(5px)';
            
            // Force a reflow to ensure the display change takes effect
            overlay.offsetHeight;
        }
    }

    hideGameOver() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    bindGameOverEvents() {
        const restartBtn = document.getElementById('restart-btn');
        const menuBtn = document.getElementById('menu-btn');

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideGameOver();
                if (window.gameEngine) {
                    gameEngine.reset();
                    gameEngine.start();
                }
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.hideGameOver();
                this.showScreen('main-menu');
                if (window.gameEngine) {
                    gameEngine.destroy();
                    window.gameEngine = null;
                }
            });
        }
    }
}

// Initialize screen manager
const screenManager = new ScreenManager();
window.screenManager = screenManager; 