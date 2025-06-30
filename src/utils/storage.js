// Local Storage Management

class StorageManager {
    constructor() {
        this.storage = window.localStorage;
    }

    // Save data to localStorage
    save(key, data) {
        try {
            this.storage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Load data from localStorage
    load(key, defaultValue = null) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    // Remove item from localStorage
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Clear all localStorage
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Save game settings
    saveSettings(settings) {
        return this.save(GAME_CONSTANTS.STORAGE_KEYS.SETTINGS, settings);
    }

    // Load game settings
    loadSettings() {
        const defaultSettings = {
            theme: 'classic',
            soundVolume: 50,
            showGhostPiece: true,
            enableParticles: true,
            autoSave: true,
            powerupsEnabled: true
        };
        return this.load(GAME_CONSTANTS.STORAGE_KEYS.SETTINGS, defaultSettings);
    }

    // Save high score
    saveHighScore(score, playerName) {
        const highScore = {
            score: score,
            playerName: playerName,
            date: new Date().toISOString(),
            level: Helpers.calculateLevel(Math.floor(score / 100))
        };
        return this.save(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE, highScore);
    }

    // Load high score
    loadHighScore() {
        return this.load(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE, null);
    }

    // Save to local leaderboard
    saveToLocalLeaderboard(score, playerName) {
        const leaderboard = this.loadLocalLeaderboard();
        const newEntry = {
            score: score,
            playerName: playerName,
            date: new Date().toISOString(),
            level: Helpers.calculateLevel(Math.floor(score / 100))
        };
        
        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(10); // Keep only top 10
        
        return this.save(GAME_CONSTANTS.STORAGE_KEYS.LOCAL_LEADERBOARD, leaderboard);
    }

    // Load local leaderboard
    loadLocalLeaderboard() {
        return this.load(GAME_CONSTANTS.STORAGE_KEYS.LOCAL_LEADERBOARD, []);
    }

    // Save game state
    saveGameState(gameState) {
        return this.save(GAME_CONSTANTS.STORAGE_KEYS.GAME_STATE, gameState);
    }

    // Load game state
    loadGameState() {
        return this.load(GAME_CONSTANTS.STORAGE_KEYS.GAME_STATE, null);
    }

    // Clear game state
    clearGameState() {
        return this.remove(GAME_CONSTANTS.STORAGE_KEYS.GAME_STATE);
    }

    // Save achievements
    saveAchievements(achievements) {
        return this.save('tetris_achievements', achievements);
    }

    // Load achievements
    loadAchievements() {
        return this.load('tetris_achievements', []);
    }

    // Add achievement
    addAchievement(achievementId) {
        const achievements = this.loadAchievements();
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            this.saveAchievements(achievements);
            return true;
        }
        return false;
    }

    // Check if achievement is unlocked
    isAchievementUnlocked(achievementId) {
        const achievements = this.loadAchievements();
        return achievements.includes(achievementId);
    }

    // Save multiplayer stats
    saveMultiplayerStats(stats) {
        return this.save('tetris_multiplayer_stats', stats);
    }

    // Load multiplayer stats
    loadMultiplayerStats() {
        const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0
        };
        return this.load('tetris_multiplayer_stats', defaultStats);
    }

    // Update multiplayer stats
    updateMultiplayerStats(gameResult) {
        const stats = this.loadMultiplayerStats();
        stats.gamesPlayed++;
        
        if (gameResult.won) {
            stats.gamesWon++;
        }
        
        stats.totalScore += gameResult.score;
        if (gameResult.score > stats.bestScore) {
            stats.bestScore = gameResult.score;
        }
        
        return this.saveMultiplayerStats(stats);
    }

    // Check if localStorage is available
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            this.storage.setItem(test, test);
            this.storage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get storage usage info
    getStorageInfo() {
        try {
            let totalSize = 0;
            for (let key in this.storage) {
                if (this.storage.hasOwnProperty(key)) {
                    totalSize += this.storage[key].length + key.length;
                }
            }
            return {
                totalSize: totalSize,
                available: this.isAvailable()
            };
        } catch (error) {
            return {
                totalSize: 0,
                available: false
            };
        }
    }
}

// Create global storage instance
const storageManager = new StorageManager();
window.StorageManager = storageManager; 