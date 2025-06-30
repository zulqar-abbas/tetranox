// Power-ups System

class PowerupManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activePowerups = new Map();
        this.powerupCooldowns = new Map();
        this.powerupQueue = [];
        this.maxQueueSize = 3;
    }

    // Add power-up to queue
    addToQueue(powerupType) {
        if (this.powerupQueue.length >= this.maxQueueSize) {
            return false; // Queue is full
        }
        
        this.powerupQueue.push(powerupType);
        return true;
    }

    // Use power-up from queue
    useFromQueue(index) {
        if (index < 0 || index >= this.powerupQueue.length) {
            return false;
        }
        
        const powerupType = this.powerupQueue.splice(index, 1)[0];
        return this.activatePowerup(powerupType);
    }

    // Activate a power-up
    activatePowerup(powerupType) {
        const powerup = GAME_CONSTANTS.POWERUPS[powerupType];
        if (!powerup) return false;

        // Check cooldown
        if (this.powerupCooldowns.has(powerupType)) {
            const cooldownEnd = this.powerupCooldowns.get(powerupType);
            if (Date.now() < cooldownEnd) {
                return false;
            }
        }

        // Apply power-up effect
        switch (powerupType) {
            case 'SLOW_TIME':
                return this.activateSlowTime(powerup);
            case 'BOMB_PIECE':
                return this.activateBombPiece(powerup);
            case 'FREEZE_LINE':
                return this.activateFreezeLine(powerup);
            default:
                return false;
        }
    }

    // Activate slow time power-up
    activateSlowTime(powerup) {
        const endTime = Date.now() + powerup.duration;
        this.activePowerups.set('slow-time', endTime);
        
        // Update game engine drop interval
        this.gameEngine.updateDropInterval();
        
        // Set cooldown
        this.powerupCooldowns.set('SLOW_TIME', Date.now() + 15000); // 15 second cooldown
        
        // Visual effect
        this.showPowerupEffect('Slow Time Activated!', '#00ffff');
        
        return true;
    }

    // Activate bomb piece power-up
    activateBombPiece(powerup) {
        if (!this.gameEngine.currentPiece) return false;
        
        const positions = this.gameEngine.currentPiece.getPositions();
        const clearedBlocks = [];
        
        // Clear blocks around the current piece
        for (const pos of positions) {
            // Clear the piece itself
            if (this.gameEngine.board.isWithinBounds(pos.x, pos.y)) {
                this.gameEngine.board.grid[pos.y][pos.x] = 0;
                this.gameEngine.board.colors[pos.y][pos.x] = null;
                clearedBlocks.push({ x: pos.x, y: pos.y });
            }
            
            // Clear surrounding blocks
            const surrounding = [
                { x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x - 1, y: pos.y - 1 },
                { x: pos.x + 1, y: pos.y - 1 },
                { x: pos.x - 1, y: pos.y + 1 },
                { x: pos.x + 1, y: pos.y + 1 }
            ];
            
            for (const surround of surrounding) {
                if (this.gameEngine.board.isWithinBounds(surround.x, surround.y) &&
                    this.gameEngine.board.grid[surround.y][surround.x] === 1) {
                    this.gameEngine.board.grid[surround.y][surround.x] = 0;
                    this.gameEngine.board.colors[surround.y][surround.x] = null;
                    clearedBlocks.push({ x: surround.x, y: surround.y });
                }
            }
        }
        
        // Add score for cleared blocks
        this.gameEngine.score += clearedBlocks.length * 10;
        
        // Set cooldown
        this.powerupCooldowns.set('BOMB_PIECE', Date.now() + 20000); // 20 second cooldown
        
        // Visual effect
        this.showPowerupEffect(`Bomb cleared ${clearedBlocks.length} blocks!`, '#ff0000');
        
        // Spawn new piece immediately
        this.gameEngine.spawnNewPiece();
        
        return true;
    }

    // Activate freeze line power-up
    activateFreezeLine(powerup) {
        this.gameEngine.board.freezeTopRow();
        
        // Set cooldown
        this.powerupCooldowns.set('FREEZE_LINE', Date.now() + 12000); // 12 second cooldown
        
        // Visual effect
        this.showPowerupEffect('Top row frozen!', '#00ffff');
        
        // Auto-unfreeze after duration
        setTimeout(() => {
            this.gameEngine.board.unfreezeTopRow();
            this.showPowerupEffect('Top row unfrozen!', '#ffff00');
        }, powerup.duration);
        
        return true;
    }

    // Update power-ups
    update(currentTime) {
        // Update active power-ups
        for (const [powerupType, endTime] of this.activePowerups.entries()) {
            if (currentTime > endTime) {
                this.activePowerups.delete(powerupType);
                
                // Update game engine if slow time expired
                if (powerupType === 'slow-time') {
                    this.gameEngine.updateDropInterval();
                }
            }
        }
        
        // Update cooldowns
        for (const [powerupType, cooldownEnd] of this.powerupCooldowns.entries()) {
            if (currentTime > cooldownEnd) {
                this.powerupCooldowns.delete(powerupType);
            }
        }
    }

    // Show power-up effect notification
    showPowerupEffect(message, color = '#ffffff') {
        // Create temporary notification element
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            animation: powerupFadeInOut 2s ease-in-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes powerupFadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    // Get power-up status
    getPowerupStatus(powerupType) {
        const isActive = this.activePowerups.has(powerupType);
        const cooldownEnd = this.powerupCooldowns.get(powerupType);
        const isOnCooldown = cooldownEnd && Date.now() < cooldownEnd;
        
        return {
            isActive,
            isOnCooldown,
            cooldownRemaining: isOnCooldown ? cooldownEnd - Date.now() : 0,
            canUse: !isActive && !isOnCooldown
        };
    }

    // Get all power-up statuses
    getAllPowerupStatuses() {
        const statuses = {};
        for (const powerupType of Object.keys(GAME_CONSTANTS.POWERUPS)) {
            statuses[powerupType] = this.getPowerupStatus(powerupType);
        }
        return statuses;
    }

    // Get queue status
    getQueueStatus() {
        return {
            queue: [...this.powerupQueue],
            maxSize: this.maxQueueSize,
            isFull: this.powerupQueue.length >= this.maxQueueSize
        };
    }

    // Clear all power-ups
    clear() {
        this.activePowerups.clear();
        this.powerupCooldowns.clear();
        this.powerupQueue = [];
    }

    // Get power-up state for serialization
    getState() {
        return {
            activePowerups: Array.from(this.activePowerups.entries()),
            powerupCooldowns: Array.from(this.powerupCooldowns.entries()),
            powerupQueue: [...this.powerupQueue]
        };
    }

    // Set power-up state from serialized data
    setState(state) {
        this.activePowerups = new Map(state.activePowerups || []);
        this.powerupCooldowns = new Map(state.powerupCooldowns || []);
        this.powerupQueue = state.powerupQueue || [];
    }

    // Random power-up generation (for special events)
    generateRandomPowerup() {
        const powerupTypes = Object.keys(GAME_CONSTANTS.POWERUPS);
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        if (this.addToQueue(randomType)) {
            this.showPowerupEffect(`Random power-up: ${GAME_CONSTANTS.POWERUPS[randomType].name}!`, '#ff00ff');
            return randomType;
        }
        
        return null;
    }

    // Check if any power-up is active
    hasActivePowerups() {
        return this.activePowerups.size > 0;
    }

    // Get active power-ups count
    getActivePowerupsCount() {
        return this.activePowerups.size;
    }
}

// Power-up UI Manager
class PowerupUIManager {
    constructor(powerupManager) {
        this.powerupManager = powerupManager;
        this.container = document.getElementById('powerups-container');
        this.powerupElements = {};
        this.init();
    }

    // Initialize power-up UI
    init() {
        this.createPowerupElements();
        this.updateDisplay();
    }

    // Create power-up UI elements
    createPowerupElements() {
        const powerupGrid = this.container.querySelector('.powerup-grid');
        powerupGrid.innerHTML = '';
        
        for (const [powerupType, powerup] of Object.entries(GAME_CONSTANTS.POWERUPS)) {
            const element = document.createElement('div');
            element.className = 'powerup';
            element.dataset.powerup = powerupType;
            element.innerHTML = `
                <span class="powerup-icon">${powerup.icon}</span>
                <span class="powerup-name">${powerup.name}</span>
                <div class="powerup-cooldown"></div>
            `;
            
            element.addEventListener('click', () => {
                this.onPowerupClick(powerupType);
            });
            
            powerupGrid.appendChild(element);
            this.powerupElements[powerupType] = element;
        }
    }

    // Handle power-up click
    onPowerupClick(powerupType) {
        const status = this.powerupManager.getPowerupStatus(powerupType);
        
        if (status.canUse) {
            this.powerupManager.activatePowerup(powerupType);
            this.updateDisplay();
        } else if (status.isOnCooldown) {
            this.showCooldownMessage(powerupType, status.cooldownRemaining);
        }
    }

    // Show cooldown message
    showCooldownMessage(powerupType, cooldownRemaining) {
        const seconds = Math.ceil(cooldownRemaining / 1000);
        const message = `${GAME_CONSTANTS.POWERUPS[powerupType].name} on cooldown: ${seconds}s`;
        
        // Create temporary message
        const messageEl = document.createElement('div');
        messageEl.className = 'cooldown-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: absolute;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 100;
        `;
        
        const powerupEl = this.powerupElements[powerupType];
        powerupEl.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 2000);
    }

    // Update power-up display
    updateDisplay() {
        const statuses = this.powerupManager.getAllPowerupStatuses();
        
        for (const [powerupType, status] of Object.entries(statuses)) {
            const element = this.powerupElements[powerupType];
            if (!element) continue;
            
            // Update visual state
            element.classList.toggle('active', status.isActive);
            element.classList.toggle('cooldown', status.isOnCooldown);
            element.classList.toggle('available', status.canUse);
            
            // Update cooldown display
            const cooldownEl = element.querySelector('.powerup-cooldown');
            if (status.isOnCooldown) {
                const seconds = Math.ceil(status.cooldownRemaining / 1000);
                cooldownEl.textContent = `${seconds}s`;
                cooldownEl.style.display = 'block';
            } else {
                cooldownEl.style.display = 'none';
            }
        }
        
        // Update queue display
        this.updateQueueDisplay();
    }

    // Update queue display
    updateQueueDisplay() {
        const queueStatus = this.powerupManager.getQueueStatus();
        
        // Create or update queue indicator
        let queueIndicator = this.container.querySelector('.powerup-queue');
        if (!queueIndicator) {
            queueIndicator = document.createElement('div');
            queueIndicator.className = 'powerup-queue';
            this.container.appendChild(queueIndicator);
        }
        
        if (queueStatus.queue.length > 0) {
            queueIndicator.innerHTML = `
                <h4>Power-up Queue (${queueStatus.queue.length}/${queueStatus.maxSize})</h4>
                <div class="queue-items">
                    ${queueStatus.queue.map((powerupType, index) => `
                        <div class="queue-item" onclick="powerupManager.useFromQueue(${index})">
                            <span class="queue-icon">${GAME_CONSTANTS.POWERUPS[powerupType].icon}</span>
                            <span class="queue-name">${GAME_CONSTANTS.POWERUPS[powerupType].name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            queueIndicator.style.display = 'block';
        } else {
            queueIndicator.style.display = 'none';
        }
    }

    // Start update loop
    startUpdateLoop() {
        setInterval(() => {
            this.updateDisplay();
        }, 100);
    }
}

// Export classes
window.PowerupManager = PowerupManager;
window.PowerupUIManager = PowerupUIManager; 