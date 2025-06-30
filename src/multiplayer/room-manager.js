class RoomManager {
    constructor() {
        this.currentRoom = null;
        this.currentPlayer = null;
        this.roomRef = null;
        this.playersRef = null;
        this.chatRef = null;
        this.gameRef = null;
        this.isHost = false;
        this.init();
    }

    init() {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.warn('Firebase not available - multiplayer features disabled');
            return;
        }
        
        try {
            // Use the properly initialized Firebase app
            if (window.FirebaseDB) {
                this.roomsRef = window.FirebaseDB.ref('rooms');
                this.chatRef = window.FirebaseDB.ref('chat');
            } else {
                // Fallback to direct firebase usage if window.FirebaseDB is not available
                this.roomsRef = firebase.database().ref('rooms');
                this.chatRef = firebase.database().ref('chat');
            }
        } catch (error) {
            console.error('Failed to initialize Firebase references:', error);
            console.warn('Multiplayer features will be disabled');
        }
    }

    async createRoom(nickname) {
        if (!this.roomsRef) {
            throw new Error('Firebase not available - multiplayer features disabled');
        }
        
        try {
            // Generate room code
            const roomCode = this.generateRoomCode();
            
            // Create room data
            const roomData = {
                code: roomCode,
                host: nickname,
                status: 'waiting',
                createdAt: Date.now(),
                maxPlayers: 2,
                gameSettings: {
                    difficulty: 'medium',
                    powerupsEnabled: true
                }
            };

            // Create room in Firebase
            const roomRef = this.roomsRef.child(roomCode);
            await roomRef.set(roomData);

            // Add host as first player
            const playerData = {
                nickname: nickname,
                joinedAt: Date.now(),
                isHost: true,
                isReady: true
            };

            await roomRef.child('players').child(nickname).set(playerData);

            // Set up room listeners
            this.setupRoomListeners(roomCode);
            
            // Store current room info
            this.currentRoom = roomCode;
            this.currentPlayer = nickname;
            this.isHost = true;
            this.roomRef = roomRef;

            return roomCode;
        } catch (error) {
            console.error('Error creating room:', error);
            throw new Error('Failed to create room: ' + error.message);
        }
    }

    async joinRoom(roomCode, nickname) {
        if (!this.roomsRef) {
            throw new Error('Firebase not available - multiplayer features disabled');
        }
        
        try {
            const roomRef = this.roomsRef.child(roomCode);
            const roomSnapshot = await roomRef.once('value');
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const roomData = roomSnapshot.val();
            
            if (roomData.status !== 'waiting') {
                throw new Error('Game already in progress');
            }

            // Check if player already exists
            const playersSnapshot = await roomRef.child('players').once('value');
            const players = playersSnapshot.val() || {};
            
            if (players[nickname]) {
                throw new Error('Nickname already taken in this room');
            }

            if (Object.keys(players).length >= roomData.maxPlayers) {
                throw new Error('Room is full');
            }

            // Add player to room
            const playerData = {
                nickname: nickname,
                joinedAt: Date.now(),
                isHost: false,
                isReady: true
            };

            await roomRef.child('players').child(nickname).set(playerData);

            // Set up room listeners
            this.setupRoomListeners(roomCode);
            
            // Store current room info
            this.currentRoom = roomCode;
            this.currentPlayer = nickname;
            this.isHost = false;
            this.roomRef = roomRef;

            // Notify host that player joined
            this.sendChatMessage(`${nickname} joined the room!`);

        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    setupRoomListeners(roomCode) {
        const roomRef = this.roomsRef.child(roomCode);
        
        // Listen for room status changes
        roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            this.handleRoomStatusChange(status);
        });

        // Listen for player changes
        roomRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val() || {};
            this.handlePlayersChange(players);
        });

        // Listen for chat messages
        roomRef.child('chat').on('child_added', (snapshot) => {
            const message = snapshot.val();
            this.handleChatMessage(message);
        });

        // Listen for game state changes
        roomRef.child('game').on('value', (snapshot) => {
            const gameState = snapshot.val();
            this.handleGameStateChange(gameState);
        });
    }

    handleRoomStatusChange(status) {
        switch (status) {
            case 'waiting':
                this.updateRoomUI('waiting');
                break;
            case 'starting':
                this.updateRoomUI('starting');
                break;
            case 'playing':
                this.startMultiplayerGame();
                break;
            case 'finished':
                this.handleGameEnd();
                break;
        }
    }

    handlePlayersChange(players) {
        const playerList = Object.values(players);
        const playerCount = playerList.length;

        // Update UI with player info
        this.updatePlayersUI(playerList);

        // Auto-start if both players are ready
        if (playerCount === 2 && this.isHost) {
            const allReady = playerList.every(p => p.isReady);
            if (allReady) {
                this.startGame();
            }
        }
    }

    handleChatMessage(message) {
        // Add message to chat UI
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.innerHTML = `
                <span class="chat-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                <span class="chat-nickname">${message.nickname}:</span>
                <span class="chat-text">${message.text}</span>
            `;
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    handleGameStateChange(gameState) {
        if (gameState && window.gameEngine) {
            window.gameEngine.updateFromMultiplayer(gameState);
        }
    }

    updateRoomUI(status) {
        const statusElement = document.getElementById('room-status');
        const startButton = document.getElementById('start-game-btn');
        
        if (statusElement) {
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        if (startButton) {
            startButton.style.display = this.isHost && status === 'waiting' ? 'block' : 'none';
        }
    }

    updatePlayersUI(players) {
        const playerList = document.getElementById('player-list');
        if (!playerList) return;

        playerList.innerHTML = '';
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <span class="player-name">${player.nickname}</span>
                <span class="player-status">${player.isReady ? 'Ready' : 'Not Ready'}</span>
                ${player.isHost ? '<span class="host-badge">Host</span>' : ''}
            `;
            playerList.appendChild(playerElement);
        });
    }

    async startGame() {
        if (!this.isHost) return;

        try {
            // Update room status
            await this.roomRef.child('status').set('starting');
            
            // Wait 3 seconds for countdown
            setTimeout(async () => {
                await this.roomRef.child('status').set('playing');
            }, 3000);

        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    startMultiplayerGame() {
        // Initialize multiplayer game engine
        const canvas = document.getElementById('game-board');
        if (canvas) {
            window.gameEngine = new GameEngine(canvas, {
                isMultiplayer: true,
                roomCode: this.currentRoom,
                playerName: this.currentPlayer,
                isHost: this.isHost
            });
        }

        // Show game screen
        if (window.screenManager) {
            window.screenManager.showScreen('game');
        }
    }

    handleGameEnd() {
        // Handle game end logic
        if (window.gameEngine) {
            window.gameEngine.endMultiplayerGame();
        }
    }

    sendChatMessage(text) {
        if (!this.currentRoom || !this.currentPlayer) return;

        const message = {
            nickname: this.currentPlayer,
            text: text,
            timestamp: Date.now()
        };

        this.roomRef.child('chat').push(message);
    }

    updateGameState(gameState) {
        if (this.roomRef) {
            this.roomRef.child('game').child(this.currentPlayer).set(gameState);
        }
    }

    sendGarbageLines(lines) {
        if (this.roomRef && lines > 0) {
            this.roomRef.child('garbage').child(this.currentPlayer).set({
                lines: lines,
                timestamp: Date.now()
            });
        }
    }

    async leaveRoom() {
        if (!this.currentRoom || !this.currentPlayer) return;

        try {
            // Remove player from room
            await this.roomRef.child('players').child(this.currentPlayer).remove();

            // If host leaves, delete the room
            if (this.isHost) {
                await this.roomRef.remove();
            }

            // Clean up listeners
            this.cleanupRoomListeners();

            // Reset state
            this.resetState();

            // Return to main menu
            if (window.screenManager) {
                window.screenManager.showScreen('main-menu');
            }

        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    async cancelRoom() {
        if (this.isHost && this.roomRef) {
            await this.roomRef.remove();
        }
        this.resetState();
    }

    cleanupRoomListeners() {
        if (this.roomRef) {
            this.roomRef.off();
        }
    }

    resetState() {
        this.currentRoom = null;
        this.currentPlayer = null;
        this.roomRef = null;
        this.isHost = false;
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    getRoomInfo() {
        return {
            code: this.currentRoom,
            player: this.currentPlayer,
            isHost: this.isHost
        };
    }

    isInRoom() {
        return this.currentRoom !== null;
    }
}

// Initialize room manager
const roomManager = new RoomManager();
window.roomManager = roomManager; 