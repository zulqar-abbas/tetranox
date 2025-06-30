// Achievements System

class AchievementManager {
    constructor() {
        this.achievements = GAME_CONSTANTS.ACHIEVEMENTS;
        this.unlockedAchievements = storageManager.loadAchievements();
        this.toastElement = document.getElementById('achievement-toast');
        this.toastTitle = document.getElementById('achievement-title');
        this.toastDesc = document.getElementById('achievement-desc');
        this.toastIcon = document.querySelector('.achievement-icon');
    }

    // Check if achievement is unlocked
    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    }

    // Unlock an achievement
    unlock(achievementId) {
        if (!this.isUnlocked(achievementId)) {
            this.unlockedAchievements.push(achievementId);
            storageManager.saveAchievements(this.unlockedAchievements);
            this.showToast(achievementId);
            return true;
        }
        return false;
    }

    // Show achievement toast notification
    showToast(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        this.toastTitle.textContent = achievement.name;
        this.toastDesc.textContent = achievement.description;
        this.toastIcon.textContent = achievement.icon;

        this.toastElement.classList.remove('hidden');
        this.toastElement.classList.add('show');

        // Auto hide after 3 seconds
        setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    // Hide achievement toast
    hideToast() {
        this.toastElement.classList.remove('show');
        setTimeout(() => {
            this.toastElement.classList.add('hidden');
        }, 300);
    }

    // Check for line clearing achievements
    checkLineClearingAchievements(linesCleared, isTetris, consecutiveTetris) {
        // First Tetris achievement
        if (isTetris && linesCleared === 4) {
            this.unlock('FIRST_TETRIS');
        }

        // Back to Back Tetris achievement
        if (consecutiveTetris >= 2) {
            this.unlock('BACK_TO_BACK');
        }
    }

    // Check for T-Spin achievement
    checkTSpinAchievement() {
        this.unlock('T_SPIN_MASTER');
    }

    // Check for level achievements
    checkLevelAchievements(level) {
        if (level >= 10) {
            this.unlock('SPEED_DEMON');
        }
    }

    // Check for survival achievement
    checkSurvivalAchievement(gameTime) {
        if (gameTime >= 300) { // 5 minutes
            this.unlock('SURVIVOR');
        }
    }

    // Get all achievements
    getAllAchievements() {
        return Object.keys(this.achievements).map(key => ({
            id: key,
            ...this.achievements[key],
            unlocked: this.isUnlocked(key)
        }));
    }

    // Get unlocked achievements count
    getUnlockedCount() {
        return this.unlockedAchievements.length;
    }

    // Get total achievements count
    getTotalCount() {
        return Object.keys(this.achievements).length;
    }

    // Get achievement progress percentage
    getProgressPercentage() {
        return Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100);
    }

    // Reset all achievements (for testing)
    resetAchievements() {
        this.unlockedAchievements = [];
        storageManager.saveAchievements(this.unlockedAchievements);
    }

    // Export achievements data
    exportAchievements() {
        return {
            unlocked: this.unlockedAchievements,
            total: this.getTotalCount(),
            progress: this.getProgressPercentage()
        };
    }

    // Import achievements data
    importAchievements(data) {
        if (data && data.unlocked && Array.isArray(data.unlocked)) {
            this.unlockedAchievements = data.unlocked;
            storageManager.saveAchievements(this.unlockedAchievements);
            return true;
        }
        return false;
    }
}

// Create global achievement manager instance
const achievementManager = new AchievementManager();
window.AchievementManager = achievementManager; 