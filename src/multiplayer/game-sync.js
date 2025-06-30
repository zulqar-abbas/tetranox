class GameSync {
    constructor(gameEngine, roomManager) {
        this.gameEngine = gameEngine;
        this.roomManager = roomManager;
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.syncRate = 100; // Sync every 100ms
        this.opponentState = null;
        this.garbageQueue = [];
        this.init();
    }

    init() {
        this.setupGarbageListener();
        this.startSync();
    }

    setupGarbageListener() {
        if (!this.roomManager.roomRef) return;

        // Listen for garbage lines from opponent
        this.roomManager.roomRef.child('garbage').on('child_added', (snapshot) => {
            const garbage = snapshot.val();
            const sender = snapshot.key;

            // Only process garbage from opponent
            if (sender !== this.roomManager.currentPlayer) {
                this.handleIncomingGarbage(garbage);
            }
        });
    }

    handleIncomingGarbage(garbage) {
        if (garbage.lines > 0) {
            this.garbageQueue.push(garbage.lines);
            this.applyGarbageLines();
        }
    }

    applyGarbageLines() {
        if (this.garbageQueue.length === 0) return;

        const lines = this.garbageQueue.shift();
        
        // Add garbage lines to the bottom of the board
        if (this.gameEngine && this.gameEngine.board) {
            this.gameEngine.board.addGarbageLines(lines);
            
            // Play sound effect
            if (window.soundManager) {
                window.soundManager.playSound('garbage');
            }
            
            // Show visual effect
            if (window.animationsManager) {
                window.animationsManager.showGarbageEffect(lines);
            }
        }
    }

    startSync() {
        this.syncInterval = setInterval(() => {
            this.syncGameState();
        }, this.syncRate);
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    syncGameState() {
        if (!this.gameEngine || !this.roomManager.isInRoom()) return;

        const currentTime = Date.now();
        if (currentTime - this.lastSyncTime < this.syncRate) return;

        const gameState = this.getGameState();
        this.roomManager.updateGameState(gameState);
        this.lastSyncTime = currentTime;
    }

    getGameState() {
        if (!this.gameEngine) return null;

        return {
            score: this.gameEngine.score,
            level: this.gameEngine.level,
            lines: this.gameEngine.lines,
            board: this.gameEngine.board.grid,
            currentPiece: this.gameEngine.currentPiece ? {
                type: this.gameEngine.currentPiece.type,
                x: this.gameEngine.currentPiece.x,
                y: this.gameEngine.currentPiece.y,
                rotation: this.gameEngine.currentPiece.rotation
            } : null,
            nextPiece: this.gameEngine.nextPiece ? {
                type: this.gameEngine.nextPiece.type
            } : null,
            holdPiece: this.gameEngine.holdPiece ? {
                type: this.gameEngine.holdPiece.type
            } : null,
            gameOver: this.gameEngine.gameOver,
            timestamp: Date.now()
        };
    }

    updateMultiplayerState(opponentState) {
        if (!opponentState || !this.gameEngine) return;

        this.opponentState = opponentState;
        this.updateOpponentUI();
    }

    updateOpponentUI() {
        if (!this.opponentState) return;

        // Update opponent's board display
        this.renderOpponentBoard();
        
        // Update opponent's stats
        this.updateOpponentStats();
    }

    renderOpponentBoard() {
        const canvas = document.getElementById('player2-board');
        if (!canvas || !this.opponentState.board) return;

        const ctx = canvas.getContext('2d');
        const board = this.opponentState.board;
        const blockSize = canvas.width / GAME_CONSTANTS.BOARD_WIDTH;
        const boardHeight = canvas.height / blockSize;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw board
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < GAME_CONSTANTS.BOARD_WIDTH; x++) {
                if (y < board.length && x < board[y].length && board[y][x] !== 0) {
                    const color = GAME_CONSTANTS.TETROMINO_COLORS[board[y][x]] || '#000';
                    ctx.fillStyle = color;
                    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
                }
            }
        }

        // Draw current piece if available
        if (this.opponentState.currentPiece) {
            this.drawPiece(ctx, this.opponentState.currentPiece, blockSize);
        }
    }

    drawPiece(ctx, piece, blockSize) {
        if (!piece || !piece.type) return;

        const shape = GAME_CONSTANTS.TETROMINO_SHAPES[piece.type];
        if (!shape) return;

        const color = GAME_CONSTANTS.TETROMINO_COLORS[piece.type];
        ctx.fillStyle = color;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const drawX = (piece.x + x) * blockSize;
                    const drawY = (piece.y + y) * blockSize;
                    ctx.fillRect(drawX, drawY, blockSize, blockSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(drawX, drawY, blockSize, blockSize);
                }
            }
        }
    }

    updateOpponentStats() {
        if (!this.opponentState) return;

        const scoreElement = document.getElementById('player2-score');
        const linesElement = document.getElementById('player2-lines');
        
        if (scoreElement) {
            scoreElement.textContent = this.opponentState.score || 0;
        }
        if (linesElement) {
            linesElement.textContent = this.opponentState.lines || 0;
        }
    }

    sendGarbageLines(lines) {
        if (lines > 0 && this.roomManager) {
            this.roomManager.sendGarbageLines(lines);
        }
    }

    handleLineClear(linesCleared) {
        if (linesCleared >= 2) {
            // Send garbage lines to opponent
            const garbageLines = this.calculateGarbageLines(linesCleared);
            this.sendGarbageLines(garbageLines);
        }
    }

    calculateGarbageLines(linesCleared) {
        // Standard Tetris garbage line calculation
        switch (linesCleared) {
            case 1: return 0; // Single line - no garbage
            case 2: return 1; // Double - 1 garbage line
            case 3: return 2; // Triple - 2 garbage lines
            case 4: return 4; // Tetris - 4 garbage lines
            default: return 0;
        }
    }

    handleGameOver() {
        // Notify opponent that game is over
        if (this.roomManager) {
            this.roomManager.updateGameState({
                gameOver: true,
                finalScore: this.gameEngine.score,
                timestamp: Date.now()
            });
        }

        this.stopSync();
    }

    handleOpponentGameOver() {
        // Handle when opponent's game ends
        if (this.gameEngine && !this.gameEngine.gameOver) {
            // Player wins!
            this.gameEngine.pause();
            this.showVictoryMessage();
        }
    }

    showVictoryMessage() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            const title = overlay.querySelector('#overlay-title');
            const message = overlay.querySelector('#overlay-message');

            if (title) {
                title.textContent = 'Victory!';
            }
            if (message) {
                message.innerHTML = 'Your opponent lost!<br>Final Score: ' + this.gameEngine.score;
            }

            overlay.classList.remove('hidden');
        }
    }

    destroy() {
        this.stopSync();
        this.opponentState = null;
        this.garbageQueue = [];
    }

    // Utility methods for debugging
    getSyncStats() {
        return {
            syncRate: this.syncRate,
            lastSyncTime: this.lastSyncTime,
            opponentState: this.opponentState ? 'connected' : 'disconnected',
            garbageQueueLength: this.garbageQueue.length
        };
    }

    setSyncRate(rate) {
        this.syncRate = rate;
        if (this.syncInterval) {
            this.stopSync();
            this.startSync();
        }
    }
}

// Export for use in game engine
window.GameSync = GameSync; 