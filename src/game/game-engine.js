// Game Engine Class

class GameEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            difficulty: 'medium',
            powerupsEnabled: true,
            showGhostPiece: true,
            ...options
        };

        // Game state
        this.board = new Board();
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.factory = new TetrominoFactory();
        
        // Game stats
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = GAME_CONSTANTS.GAME_SETTINGS.INITIAL_DROP_INTERVAL;
        this.lastDropTime = 0;
        this.gameTime = 0;
        this.startTime = Date.now();
        
        // Game status
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.consecutiveTetris = 0;
        this.lastMove = null;
        
        // Power-ups
        this.activePowerups = new Map();
        this.powerupCooldowns = new Map();
        
        // Line clearing animations
        this.lineClearAnimations = [];
        this.animationStartTime = 0;
        this.animationDuration = 500; // 500ms animation
        
        // Particle effects
        this.particles = [];
        
        // Score popups
        this.scorePopups = [];
        
        // Callbacks
        this.onScoreUpdate = null;
        this.onLevelUpdate = null;
        this.onLinesUpdate = null;
        this.onGameOver = null;
        this.onPiecePlaced = null;
        this.onLinesCleared = null;
        
        // Initialize
        this.init();
    }

    // Initialize the game
    init() {
        this.spawnNewPiece();
        this.updateDropInterval();
    }

    // Start the game
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isGameOver = false;
        this.startTime = Date.now();
        this.lastDropTime = Date.now();
        this.gameLoop();
    }

    // Pause the game
    pause() {
        this.isPaused = true;
    }

    // Resume the game
    resume() {
        this.isPaused = false;
    }

    // Toggle pause
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    // Stop the game
    stop() {
        this.isRunning = false;
        this.isGameOver = true;
    }

    // Destroy the game engine
    destroy() {
        this.stop();
        // Clean up any event listeners or timers if needed
    }

    // Main game loop
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.startTime) / 1000);

        // Update line clearing animations
        this.updateLineClearAnimations();
        
        // Update particles
        this.updateParticles();
        
        // Update score popups
        this.updateScorePopups();

        // Handle piece dropping (only if no line clearing animation is active)
        if (this.lineClearAnimations.length === 0) {
            if (currentTime - this.lastDropTime > this.dropInterval) {
                this.dropPiece();
                this.lastDropTime = currentTime;
            }
        }

        // Update power-ups
        this.updatePowerups(currentTime);

        // Render
        this.render();

        // Continue loop only if game is not over
        if (!this.isGameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // Spawn a new piece
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.factory.getNext();
        this.nextPiece = this.factory.getNext();
        
        // Reset hold ability
        this.canHold = true;
        
        // Check for game over
        if (!this.board.isValidMove(this.currentPiece)) {
            console.log('Game Over: Cannot place new piece at spawn position');
            try {
                this.gameOver();
            } catch (error) {
                console.error('Error in gameOver():', error);
            }
            return;
        }
        
        // Update drop interval based on level
        this.updateDropInterval();
    }

    // Move piece left
    moveLeft() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return false;
        
        const originalX = this.currentPiece.x;
        this.currentPiece.move(-1, 0);
        
        if (!this.board.isValidMove(this.currentPiece)) {
            this.currentPiece.x = originalX;
            return false;
        }
        
        this.lastMove = 'move';
        return true;
    }

    // Move piece right
    moveRight() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return false;
        
        const originalX = this.currentPiece.x;
        this.currentPiece.move(1, 0);
        
        if (!this.board.isValidMove(this.currentPiece)) {
            this.currentPiece.x = originalX;
            return false;
        }
        
        this.lastMove = 'move';
        return true;
    }

    // Move piece down (soft drop)
    moveDown() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return false;
        
        const originalY = this.currentPiece.y;
        this.currentPiece.move(0, 1);
        
        if (!this.board.isValidMove(this.currentPiece)) {
            this.currentPiece.y = originalY;
            this.placePiece();
            return false;
        }
        
        this.score += GAME_CONSTANTS.SCORING.SOFT_DROP;
        this.lastMove = 'drop';
        return true;
    }

    // Hard drop
    hardDrop() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return false;
        
        let dropDistance = 0;
        while (this.board.isValidMove(this.currentPiece)) {
            this.currentPiece.move(0, 1);
            dropDistance++;
        }
        
        this.currentPiece.move(0, -1); // Move back up one step
        this.score += dropDistance * GAME_CONSTANTS.SCORING.HARD_DROP;
        
        this.placePiece();
        this.lastMove = 'hardDrop';
        return true;
    }

    // Rotate piece clockwise
    rotate() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return false;
        
        const originalRotation = this.currentPiece.rotation;
        this.currentPiece.rotate();
        
        if (!this.board.isValidMove(this.currentPiece)) {
            // Try wall kicks
            if (!this.tryWallKicks()) {
                this.currentPiece.rotation = originalRotation;
                return false;
            }
        }
        
        this.lastMove = 'rotate';
        return true;
    }

    // Try wall kicks for rotation
    tryWallKicks() {
        const kicks = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: 1, y: -1 }
        ];
        
        for (const kick of kicks) {
            this.currentPiece.move(kick.x, kick.y);
            if (this.board.isValidMove(this.currentPiece)) {
                return true;
            }
            this.currentPiece.move(-kick.x, -kick.y);
        }
        
        return false;
    }

    // Hold piece
    hold() {
        if (!this.isRunning || this.isPaused || this.isGameOver || !this.canHold) return false;
        
        if (this.heldPiece === null) {
            this.heldPiece = new Tetromino(this.currentPiece.type, 0, 0);
            this.spawnNewPiece();
        } else {
            const temp = this.heldPiece;
            this.heldPiece = new Tetromino(this.currentPiece.type, 0, 0);
            this.currentPiece = new Tetromino(temp.type, 
                Math.floor(GAME_CONSTANTS.BOARD_WIDTH / 2) - 1, 0);
        }
        
        this.canHold = false;
        return true;
    }

    // Drop piece automatically
    dropPiece() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return;
        
        const originalY = this.currentPiece.y;
        this.currentPiece.move(0, 1);
        
        if (!this.board.isValidMove(this.currentPiece)) {
            this.currentPiece.y = originalY;
            this.placePiece();
        }
    }

    // Place piece on board
    placePiece() {
        this.board.placeTetromino(this.currentPiece);
        
        // Check for bomb piece effect
        if (this.activePowerups.has('bomb-piece')) {
            this.activateBombEffect();
            this.activePowerups.delete('bomb-piece');
        }
        
        // Check for T-spin
        const isTSpin = this.board.checkTSpin(this.currentPiece, this.lastMove);
        if (isTSpin) {
            this.score += GAME_CONSTANTS.SCORING.T_SPIN;
            achievementManager.checkTSpinAchievement();
        }
        
        // Clear lines
        const clearResult = this.board.clearLines();
        if (clearResult.linesCleared > 0) {
            this.handleLinesCleared(clearResult);
        }
        
        // Spawn new piece
        this.spawnNewPiece();
        
        // Call callback
        if (this.onPiecePlaced) {
            this.onPiecePlaced(this.currentPiece);
        }
    }

    // Activate bomb effect
    activateBombEffect() {
        const positions = this.currentPiece.getPositions();
        let clearedBlocks = 0;
        
        for (const pos of positions) {
            // Clear 3x3 area around each block
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const x = pos.x + dx;
                    const y = pos.y + dy;
                    
                    if (this.board.isWithinBounds(x, y) && this.board.isOccupied(x, y)) {
                        this.board.grid[y][x] = 0;
                        this.board.colors[y][x] = null;
                        clearedBlocks++;
                    }
                }
            }
        }
        
        // Add score for cleared blocks
        this.score += clearedBlocks * 10;
    }

    // Handle lines cleared
    handleLinesCleared(clearResult) {
        const { linesCleared, isTetris, lines } = clearResult;
        
        if (linesCleared > 0) {
            // Start line clearing animation
            this.startLineClearAnimation(lines);
            
            // Update lines and level
            this.lines += linesCleared;
            const newLevel = Helpers.calculateLevel(this.lines);
            if (newLevel > this.level) {
                this.level = newLevel;
                this.updateDropInterval();
                if (this.onLevelUpdate) this.onLevelUpdate(this.level);
                achievementManager.checkLevelAchievements(this.level);
            }
            
            // Calculate score
            let lineScore = 0;
            switch (linesCleared) {
                case 1:
                    lineScore = GAME_CONSTANTS.SCORING.SINGLE_LINE;
                    this.consecutiveTetris = 0;
                    break;
                case 2:
                    lineScore = GAME_CONSTANTS.SCORING.DOUBLE_LINE;
                    this.consecutiveTetris = 0;
                    break;
                case 3:
                    lineScore = GAME_CONSTANTS.SCORING.TRIPLE_LINE;
                    this.consecutiveTetris = 0;
                    break;
                case 4:
                    lineScore = GAME_CONSTANTS.SCORING.TETRIS;
                    this.consecutiveTetris++;
                    break;
            }
            
            // Apply level multiplier
            lineScore *= this.level;
            this.score += lineScore;
            
            // Create score popup
            this.createScorePopup(lineScore, linesCleared);
            
            // Play sound effect
            this.playLineClearSound(linesCleared);
            
            // Check achievements
            achievementManager.checkLineClearingAchievements(linesCleared, isTetris, this.consecutiveTetris);
            
            // Call callbacks
            if (this.onLinesCleared) this.onLinesCleared(clearResult);
            if (this.onScoreUpdate) this.onScoreUpdate(this.score);
            if (this.onLinesUpdate) this.onLinesUpdate(this.lines);
        }
    }

    // Update drop interval based on level
    updateDropInterval() {
        this.dropInterval = Helpers.calculateDropInterval(this.level);
        
        // Apply slow time power-up
        if (this.activePowerups.has('slow-time')) {
            this.dropInterval *= 2;
        }
    }

    // Game over
    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        
        // Trigger game over animation
        if (window.animationManager) {
            animationManager.triggerAnimation('gameOver', {
                score: this.score
            });
        }
        
        // Show game over screen
        if (window.screenManager) {
            try {
                screenManager.showGameOver(this.score, {
                    score: this.score,
                    level: this.level,
                    lines: this.lines,
                    time: this.gameTime
                });
            } catch (error) {
                console.error('Error in screenManager.showGameOver():', error);
            }
        } else {
            // Retry after a delay in case screenManager is still loading
            setTimeout(() => {
                if (window.screenManager) {
                    try {
                        screenManager.showGameOver(this.score, {
                            score: this.score,
                            level: this.level,
                            lines: this.lines,
                            time: this.gameTime
                        });
                    } catch (error) {
                        console.error('Error in delayed screenManager.showGameOver():', error);
                    }
                } else {
                    // Fallback: show overlay directly
                    this.showGameOverDirectly();
                }
            }, 500);
        }
        
        // Play game over sound
        if (window.soundManager) {
            soundManager.playSound('game-over');
        }
        
        // Submit score to leaderboard
        if (window.leaderboardManager) {
            leaderboardManager.submitScore(this.score, {
                level: this.level,
                lines: this.lines,
                time: this.gameTime
            });
        }
    }

    // Reset game
    reset() {
        this.board.clear();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = GAME_CONSTANTS.GAME_SETTINGS.INITIAL_DROP_INTERVAL;
        this.gameTime = 0;
        this.consecutiveTetris = 0;
        this.heldPiece = null;
        this.canHold = true;
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.activePowerups.clear();
        this.powerupCooldowns.clear();
        this.factory.reset();
        this.init();
    }

    // Render the game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
            
            // Draw ghost piece
            if (this.options.showGhostPiece) {
                const ghost = this.currentPiece.getGhostPiece(this.board);
                this.drawGhostPiece(ghost);
            }
        }
        
        // Draw frozen rows indicator
        this.drawFrozenRowsIndicator();
        
        // Draw line clearing animations
        this.drawLineClearAnimations();
        
        // Draw particles
        this.drawParticles();
        
        // Draw score popups
        this.drawScorePopups();
        
        // Update UI elements
        this.updateUI();
    }

    // Draw the board
    drawBoard() {
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        
        for (let row = 0; row < this.board.height; row++) {
            for (let col = 0; col < this.board.width; col++) {
                const x = col * blockSize;
                const y = row * blockSize;
                
                if (this.board.grid[row][col] === 1) {
                    const color = this.board.colors[row][col] || '#666666';
                    this.drawBlock(x, y, color);
                } else {
                    // Draw grid lines
                    this.ctx.strokeStyle = '#333333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }

    // Draw a piece
    drawPiece(piece) {
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        const shape = piece.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = (piece.x + col) * blockSize;
                    const y = (piece.y + row) * blockSize;
                    this.drawBlock(x, y, piece.color);
                }
            }
        }
    }

    // Draw ghost piece
    drawGhostPiece(ghost) {
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        const shape = ghost.getCurrentShape();
        
        this.ctx.globalAlpha = 0.3;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = (ghost.x + col) * blockSize;
                    const y = (ghost.y + row) * blockSize;
                    this.drawBlock(x, y, ghost.color);
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    // Draw a single block
    drawBlock(x, y, color) {
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        
        // Fill
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, blockSize, blockSize);
        
        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, blockSize, blockSize);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x + 2, y + 2, blockSize - 4, 4);
        this.ctx.fillRect(x + 2, y + 2, 4, blockSize - 4);
    }

    // Draw frozen rows indicator
    drawFrozenRowsIndicator() {
        if (this.board.isTopRowFrozen()) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, GAME_CONSTANTS.BLOCK_SIZE);
        }
    }

    // Power-up methods
    activatePowerup(powerupType) {
        if (!this.options.powerupsEnabled || !this.powerups[powerupType] || !this.powerups[powerupType].available) {
            return false;
        }
        
        const powerup = this.powerups[powerupType];
        powerup.available = false;
        powerup.cooldown = powerup.maxCooldown;
        
        // Trigger power-up animation
        if (window.animationManager) {
            const powerupElement = document.getElementById(`${powerupType}-powerup`);
            animationManager.triggerAnimation('powerupActivated', {
                powerup: powerupType,
                element: powerupElement
            });
        }
        
        // Apply power-up effect
        switch (powerupType) {
            case 'bomb':
                this.activateBombPowerup();
                break;
            case 'slow':
                this.activateSlowPowerup();
                break;
            case 'clear':
                this.activateClearPowerup();
                break;
        }
        
        // Play sound effect
        if (window.soundManager) {
            soundManager.playSound('powerup');
        }
        
        // Update UI
        this.updateUI();
        
        return true;
    }

    // Update power-ups
    updatePowerups(currentTime) {
        for (const [powerupType, endTime] of this.activePowerups.entries()) {
            if (currentTime > endTime) {
                this.activePowerups.delete(powerupType);
                if (powerupType === 'slow-time') {
                    this.updateDropInterval();
                }
            }
        }
    }

    // Get game state
    getState() {
        return {
            board: this.board.getState(),
            currentPiece: this.currentPiece ? {
                type: this.currentPiece.type,
                x: this.currentPiece.x,
                y: this.currentPiece.y,
                rotation: this.currentPiece.rotation
            } : null,
            nextPiece: this.nextPiece ? {
                type: this.nextPiece.type
            } : null,
            heldPiece: this.heldPiece ? {
                type: this.heldPiece.type
            } : null,
            score: this.score,
            lines: this.lines,
            level: this.level,
            gameTime: this.gameTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver
        };
    }

    // Set game state
    setState(state) {
        this.board.setState(state.board);
        this.currentPiece = state.currentPiece ? new Tetromino(
            state.currentPiece.type,
            state.currentPiece.x,
            state.currentPiece.y
        ) : null;
        this.nextPiece = state.nextPiece ? new Tetromino(state.nextPiece.type, 0, 0) : null;
        this.heldPiece = state.heldPiece ? new Tetromino(state.heldPiece.type, 0, 0) : null;
        this.score = state.score || 0;
        this.lines = state.lines || 0;
        this.level = state.level || 1;
        this.gameTime = state.gameTime || 0;
        this.isRunning = state.isRunning || false;
        this.isPaused = state.isPaused || false;
        this.isGameOver = state.isGameOver || false;
        
        this.updateDropInterval();
    }

    // Update UI elements
    updateUI() {
        // Update next piece display
        this.updateNextPieceDisplay();
        
        // Update hold piece display
        this.updateHoldPieceDisplay();
        
        // Update game stats
        this.updateGameStats();
        
        // Update power-up displays
        this.updatePowerupDisplays();
    }

    // Update next piece display
    updateNextPieceDisplay() {
        const nextCanvas = document.getElementById('next-canvas');
        if (!nextCanvas || !this.nextPiece) return;
        
        const ctx = nextCanvas.getContext('2d');
        ctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        // Fixed block size for next piece display
        const blockSize = 20;
        const shape = this.nextPiece.getCurrentShape();
        
        // Center the piece
        const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    this.drawBlockOnCanvas(ctx, x, y, blockSize, this.nextPiece.color);
                }
            }
        }
    }

    // Update hold piece display
    updateHoldPieceDisplay() {
        const holdCanvas = document.getElementById('hold-canvas');
        if (!holdCanvas) return;
        
        const ctx = holdCanvas.getContext('2d');
        ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
        
        if (this.heldPiece) {
            // Fixed block size for hold piece display
            const blockSize = 20;
            const shape = this.heldPiece.getCurrentShape();
            
            // Center the piece
            const offsetX = (holdCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (holdCanvas.height - shape.length * blockSize) / 2;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const x = offsetX + col * blockSize;
                        const y = offsetY + row * blockSize;
                        this.drawBlockOnCanvas(ctx, x, y, blockSize, this.heldPiece.color);
                    }
                }
            }
        }
        
        // Show if hold is available
        if (!this.canHold) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
        }
    }

    // Update game stats
    updateGameStats() {
        const scoreElement = document.getElementById('player-score');
        const levelElement = document.getElementById('level');
        const linesElement = document.getElementById('lines');
        
        if (scoreElement) scoreElement.textContent = this.score.toLocaleString();
        if (levelElement) levelElement.textContent = this.level;
        if (linesElement) linesElement.textContent = this.lines;
    }

    // Update power-up displays
    updatePowerupDisplays() {
        const powerupElements = document.querySelectorAll('.powerup');
        powerupElements.forEach(element => {
            const powerupType = element.dataset.powerup;
            if (powerupType) {
                // Map HTML data attributes to game constants
                const gamePowerupType = this.mapPowerupType(powerupType);
                const cooldownEnd = this.powerupCooldowns.get(gamePowerupType);
                const isOnCooldown = cooldownEnd && Date.now() < cooldownEnd;
                
                element.classList.toggle('cooldown', isOnCooldown);
                element.classList.toggle('available', !isOnCooldown && this.options.powerupsEnabled);
                
                if (isOnCooldown) {
                    const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
                    const cooldownElement = element.querySelector('.powerup-cooldown');
                    if (cooldownElement) {
                        cooldownElement.textContent = `${remaining}s`;
                    }
                } else {
                    const cooldownElement = element.querySelector('.powerup-cooldown');
                    if (cooldownElement) {
                        cooldownElement.textContent = '';
                    }
                }
            }
        });
    }

    // Map HTML powerup types to game constants
    mapPowerupType(htmlType) {
        const mapping = {
            'slow-time': 'SLOW_TIME',
            'bomb-piece': 'BOMB_PIECE',
            'freeze-line': 'FREEZE_LINE'
        };
        return mapping[htmlType] || htmlType;
    }

    // Draw block on a specific canvas
    drawBlockOnCanvas(ctx, x, y, blockSize, color) {
        // Fill
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, blockSize, blockSize);
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + 1, y + 1, blockSize - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, blockSize - 2);
    }

    // Start line clearing animation
    startLineClearAnimation(lines) {
        this.lineClearAnimations = lines.map(row => ({
            row: row,
            startTime: Date.now(),
            phase: 'flash' // flash -> fade -> complete
        }));
        this.animationStartTime = Date.now();
        
        // Create particles for each cleared line
        lines.forEach(row => {
            this.createLineClearParticles(row);
        });
    }

    // Create particles for line clearing effect
    createLineClearParticles(row) {
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        const y = row * blockSize;
        
        for (let col = 0; col < GAME_CONSTANTS.BOARD_WIDTH; col++) {
            const x = col * blockSize;
            
            // Create multiple particles per block
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    x: x + Math.random() * blockSize,
                    y: y + Math.random() * blockSize,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4 - 2,
                    life: 1.0,
                    decay: 0.02,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`
                });
            }
        }
    }

    // Update particles
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= particle.decay;
            
            return particle.life > 0;
        });
    }

    // Draw particles
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
            this.ctx.restore();
        });
    }

    // Update line clearing animations
    updateLineClearAnimations() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.animationStartTime;
        
        if (elapsed > this.animationDuration) {
            this.lineClearAnimations = [];
            return;
        }
        
        // Update animation phases
        this.lineClearAnimations.forEach(animation => {
            const animationElapsed = currentTime - animation.startTime;
            
            if (animationElapsed < 200) {
                animation.phase = 'flash';
            } else if (animationElapsed < 400) {
                animation.phase = 'fade';
            } else {
                animation.phase = 'complete';
            }
        });
    }

    // Draw line clearing animations
    drawLineClearAnimations() {
        if (this.lineClearAnimations.length === 0) return;
        
        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        
        this.lineClearAnimations.forEach(animation => {
            const y = animation.row * blockSize;
            
            switch (animation.phase) {
                case 'flash':
                    // Flash the line white
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.fillRect(0, y, this.canvas.width, blockSize);
                    break;
                    
                case 'fade':
                    // Fade the line out
                    const fadeProgress = (Date.now() - animation.startTime - 200) / 200;
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - fadeProgress)})`;
                    this.ctx.fillRect(0, y, this.canvas.width, blockSize);
                    break;
            }
        });
    }

    // Create score popup
    createScorePopup(score, linesCleared) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.scorePopups.push({
            text: `+${score.toLocaleString()}`,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: Math.random() * (this.canvas.height - 100) + 50,
            color: color,
            life: 1.0,
            decay: 0.02,
            vy: -1
        });
    }

    // Update score popups
    updateScorePopups() {
        this.scorePopups = this.scorePopups.filter(popup => {
            popup.y += popup.vy;
            popup.life -= popup.decay;
            return popup.life > 0;
        });
    }

    // Draw score popups
    drawScorePopups() {
        this.scorePopups.forEach(popup => {
            this.ctx.save();
            this.ctx.globalAlpha = popup.life;
            this.ctx.fillStyle = popup.color;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(popup.text, popup.x, popup.y);
            this.ctx.restore();
        });
    }

    // Play sound effect
    playLineClearSound(linesCleared) {
        if (window.soundManager) {
            switch (linesCleared) {
                case 1:
                    window.soundManager.playSound('line-clear');
                    break;
                case 2:
                    window.soundManager.playSound('double-clear');
                    break;
                case 3:
                    window.soundManager.playSound('triple-clear');
                    break;
                case 4:
                    window.soundManager.playSound('tetris-clear');
                    break;
            }
        }
    }

    updateScore(points) {
        this.score += points;
        this.lines += Math.floor(points / 100);
        
        // Check for level up
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropSpeed = Math.max(50, 1000 - (this.level - 1) * 50);
            
            // Trigger level up animation
            if (window.animationManager) {
                const levelElement = document.getElementById('level');
                animationManager.triggerAnimation('levelUp', {
                    level: this.level,
                    element: levelElement
                });
            }
        }
        
        // Update UI
        this.updateUI();
        
        // Trigger score update animation
        if (window.animationManager) {
            const scoreElement = document.getElementById('player-score');
            animationManager.triggerAnimation('scoreUpdate', {
                score: points,
                element: scoreElement
            });
        }
    }

    clearLines() {
        const linesToClear = [];
        
        // Find lines to clear
        for (let row = 0; row < this.board.grid.length; row++) {
            if (this.board.grid[row].every(cell => cell !== 0)) {
                linesToClear.push(row);
            }
        }
        
        if (linesToClear.length === 0) return 0;
        
        // Calculate score based on lines cleared
        const lineScores = [0, 100, 300, 500, 800];
        const score = lineScores[linesToClear.length] * this.level;
        
        // Create new grid without cleared lines
        const newGrid = [];
        for (let row = 0; row < this.board.grid.length; row++) {
            if (!linesToClear.includes(row)) {
                newGrid.push([...this.board.grid[row]]);
            }
        }
        
        // Add empty lines at the top
        while (newGrid.length < this.board.grid.length) {
            newGrid.unshift(new Array(this.board.grid[0].length).fill(0));
        }
        
        this.board.grid = newGrid;
        
        // Update score
        this.updateScore(score);
        
        // Trigger line clear animation
        if (window.animationManager) {
            animationManager.triggerAnimation('lineClear', {
                lines: linesToClear.length,
                score: score
            });
        }
        
        // Play sound effect
        if (window.soundManager) {
            soundManager.playSound('line-clear');
        }
        
        return linesToClear.length;
    }

    showGameOverDirectly() {
        const finalScoreElement = document.getElementById('final-score');
        const finalLinesElement = document.getElementById('final-lines');
        const finalLevelElement = document.getElementById('final-level');
        const finalTimeElement = document.getElementById('final-time');
        const overlay = document.getElementById('game-overlay');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score.toLocaleString();
        }
        
        if (finalLinesElement) {
            finalLinesElement.textContent = this.lines || 0;
        }
        
        if (finalLevelElement) {
            finalLevelElement.textContent = this.level || 1;
        }
        
        if (finalTimeElement) {
            const minutes = Math.floor((this.gameTime || 0) / 60);
            const seconds = (this.gameTime || 0) % 60;
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
            
            // Bind restart and menu buttons directly
            this.bindGameOverButtonsDirectly();
        }
    }
    
    bindGameOverButtonsDirectly() {
        const restartBtn = document.getElementById('restart-btn');
        const menuBtn = document.getElementById('menu-btn');

        if (restartBtn) {
            restartBtn.onclick = () => {
                this.hideGameOverDirectly();
                this.reset();
                this.start();
            };
        }

        if (menuBtn) {
            menuBtn.onclick = () => {
                this.hideGameOverDirectly();
                // Try to go back to main menu
                if (window.screenManager) {
                    screenManager.showScreen('main-menu');
                } else {
                    // Fallback: reload the page
                    window.location.reload();
                }
                this.destroy();
            };
        }
    }
    
    hideGameOverDirectly() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.style.display = 'none';
        }
    }
}

// Export GameEngine class
window.GameEngine = GameEngine; 