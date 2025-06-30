class LeaderboardManager {
    constructor() {
        this.localScores = [];
        this.globalScores = [];
        this.isLoading = false;
        this.firebaseAvailable = false;
        this.userId = null;
        this.init();
    }

    async init() {
        // Check Firebase SDK first
        this.checkFirebaseSDK();
        
        // Check Firebase availability
        this.firebaseAvailable = typeof firebase !== 'undefined' && window.FirebaseDB;
        
        if (this.firebaseAvailable) {
            await this.initializeFirebase();
            
            // After initialization, check if we still have Firebase available
            if (!this.userId) {
                this.firebaseAvailable = false;
            }
        }
        
        this.loadLocalScores();
        this.bindEvents();
        
        // Migrate existing scores if needed
        if (this.firebaseAvailable) {
            await this.migrateExistingScores();
        }
    }

    async initializeFirebase() {
        try {
            // Initialize Firebase Auth
            const auth = window.FirebaseAuth;
            
            if (auth) {
                // Try to sign in anonymously, but fall back to local user if it fails
                try {
                    const userCredential = await auth.signInAnonymously();
                    this.userId = userCredential.user.uid;
                } catch (authError) {
                    // Generate a local user ID for this session
                    this.userId = 'local-user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                }
            } else {
                this.firebaseAvailable = false;
                return;
            }
            
            // Set up real-time listeners for global scores
            this.setupRealtimeListeners();
            
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            
            // If it's an auth configuration error, try to continue without auth
            if (error.code === 'auth/configuration-not-found') {
                this.userId = 'local-user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                
                // Set up real-time listeners for global scores
                this.setupRealtimeListeners();
            } else {
                this.firebaseAvailable = false;
            }
        }
    }

    setupRealtimeListeners() {
        if (!this.firebaseAvailable) {
            return;
        }

        const database = window.FirebaseDB;
        
        // Listen for global leaderboard changes
        const globalScoresRef = database.ref('leaderboard/global');
        
        globalScoresRef.on('value', (snapshot) => {
            this.globalScores = [];
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const score = childSnapshot.val();
                    score.id = childSnapshot.key;
                    this.globalScores.push(score);
                });
                
                // Sort by score (highest first)
                this.globalScores.sort((a, b) => b.score - a.score);
            }
            
            this.renderGlobalLeaderboard();
        });

        // Listen for user's local scores
        if (this.userId) {
            const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
            
            userScoresRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    this.localScores = snapshot.val();
                } else {
                    this.localScores = [];
                }
                this.renderLocalLeaderboard();
            });
        }
        
        // Load initial data
        this.loadGlobalScores();
    }

    bindEvents() {
        // Tab switching using data-tab attributes
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-leaderboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshLeaderboards();
            });
        }

        // Test Firebase button
        const testFirebaseBtn = document.getElementById('test-firebase');
        if (testFirebaseBtn) {
            testFirebaseBtn.addEventListener('click', async () => {
                await this.runFirebaseTests();
            });
        }
        
        // Refresh leaderboards when leaderboard screen is shown
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        if (leaderboardScreen) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (leaderboardScreen.classList.contains('active')) {
                            this.refreshLeaderboards();
                        }
                    }
                });
            });
            
            observer.observe(leaderboardScreen, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabName}-content`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Load appropriate data
        if (tabName === 'local') {
            this.loadLocalScores();
        } else {
            this.loadGlobalScores();
        }
    }

    async loadLocalScores() {
        if (this.firebaseAvailable && this.userId) {
            try {
                const database = window.FirebaseDB;
                const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
                const snapshot = await userScoresRef.once('value');
                
                if (snapshot.exists()) {
                    this.localScores = snapshot.val();
                } else {
                    // Try to load from localStorage as fallback
                    this.loadLocalScoresFromStorage();
                }
            } catch (error) {
                console.error('Error loading local scores from Firebase:', error);
                this.loadLocalScoresFromStorage();
            }
        } else {
            this.loadLocalScoresFromStorage();
        }
        
        this.renderLocalLeaderboard();
    }

    loadLocalScoresFromStorage() {
        const stored = localStorage.getItem('tetris_local_scores');
        if (stored) {
            try {
                this.localScores = JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing local scores from localStorage:', error);
                this.localScores = [];
            }
        } else {
            this.localScores = [];
        }
    }

    async syncLocalScoresToFirebase() {
        if (!this.firebaseAvailable || !this.userId) return;
        
        try {
            const database = window.FirebaseDB;
            const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
            await userScoresRef.set(this.localScores);
        } catch (error) {
            console.error('Error syncing local scores to Firebase:', error);
        }
    }

    async migrateExistingScores() {
        const stored = localStorage.getItem('tetris_local_scores');
        if (stored && this.firebaseAvailable && this.userId) {
            try {
                const scores = JSON.parse(stored);
                const database = window.FirebaseDB;
                const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
                await userScoresRef.set(scores);
                
                // Clear localStorage after successful migration
                localStorage.removeItem('tetris_local_scores');
            } catch (error) {
                console.error('Error migrating existing scores:', error);
            }
        }
    }

    async loadGlobalScores() {
        if (this.firebaseAvailable) {
            try {
                const database = window.FirebaseDB;
                const globalScoresRef = database.ref('leaderboard/global');
                const snapshot = await globalScoresRef.once('value');
                
                this.globalScores = [];
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const score = childSnapshot.val();
                        score.id = childSnapshot.key;
                        this.globalScores.push(score);
                    });
                    
                    // Sort by score (highest first)
                    this.globalScores.sort((a, b) => b.score - a.score);
                }
            } catch (error) {
                console.error('Error loading global scores:', error);
                this.globalScores = [];
            }
        } else {
            this.globalScores = [];
        }
        
        this.renderGlobalLeaderboard();
    }

    loadLeaderboards() {
        this.loadLocalScores();
        this.loadGlobalScores();
    }

    renderLocalLeaderboard() {
        const container = document.getElementById('local-leaderboard');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.localScores || this.localScores.length === 0) {
            container.innerHTML = '<p class="no-scores">No local scores yet. Play a game to get started!</p>';
            return;
        }
        
        this.localScores.forEach((score, index) => {
            const scoreElement = this.createScoreElement(score, index + 1);
            container.appendChild(scoreElement);
        });
    }

    renderGlobalLeaderboard() {
        const container = document.getElementById('global-leaderboard');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.globalScores || this.globalScores.length === 0) {
            container.innerHTML = '<p class="no-scores">No global scores yet. Be the first to submit a score!</p>';
            return;
        }
        
        this.globalScores.forEach((score, index) => {
            const scoreElement = this.createScoreElement(score, index + 1);
            container.appendChild(scoreElement);
        });
    }

    createScoreElement(score, rank) {
        const element = document.createElement('div');
        element.className = 'leaderboard-entry';
        
        const medalIcon = this.getMedalIcon(rank);
        const formattedScore = this.formatScore(score.score);
        const formattedDate = this.formatDate(score.timestamp);
        
        element.innerHTML = `
            <div class="rank">
                ${medalIcon}
                <span>#${rank}</span>
            </div>
            <div class="player-info">
                <div class="player-name">${score.playerName}</div>
                <div class="score-details">
                    Level ${score.level} • ${score.lines} lines • ${formattedDate}
                </div>
            </div>
            <div class="score">${formattedScore}</div>
        `;
        
        return element;
    }

    getMedalIcon(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '';
        }
    }

    formatScore(score) {
        return score.toLocaleString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    showLoadingState() {
        this.isLoading = true;
        const containers = document.querySelectorAll('#local-leaderboard, #global-leaderboard');
        containers.forEach(container => {
            container.innerHTML = '<div class="loading">Loading scores...</div>';
        });
    }

    hideLoadingState() {
        this.isLoading = false;
    }

    showError(message) {
        console.error('Leaderboard error:', message);
    }

    async submitScore(score, playerName, level = 1, lines = 0) {
        const scoreData = {
            score: score,
            playerName: playerName,
            level: level,
            lines: lines,
            timestamp: Date.now()
        };
        
        // Save local score
        await this.saveLocalScore(scoreData);
        
        // Save global score
        await this.saveGlobalScore(scoreData);
    }

    async saveLocalScore(scoreData) {
        // Add to local scores array
        if (!this.localScores) {
            this.localScores = [];
        }
        
        this.localScores.push(scoreData);
        
        // Sort by score (highest first) and keep only top 50
        this.localScores.sort((a, b) => b.score - a.score);
        this.localScores = this.localScores.slice(0, 50);
        
        // Save to localStorage
        localStorage.setItem('tetris_local_scores', JSON.stringify(this.localScores));
        
        // Save to Firebase if available
        if (this.firebaseAvailable && this.userId) {
            try {
                const database = window.FirebaseDB;
                const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
                await userScoresRef.set(this.localScores);
            } catch (error) {
                console.error('Error saving local score to Firebase:', error);
            }
        }
        
        // Update display
        this.renderLocalLeaderboard();
    }

    async saveGlobalScore(scoreData) {
        if (!this.firebaseAvailable) return;
        
        try {
            const database = window.FirebaseDB;
            const globalScoresRef = database.ref('leaderboard/global');
            
            // Add user ID to score data
            const scoreWithUser = {
                ...scoreData,
                userId: this.userId
            };
            
            // Push to global scores
            await globalScoresRef.push(scoreWithUser);
            
            // Clean up old scores to keep leaderboard manageable
            await this.cleanupOldGlobalScores();
            
        } catch (error) {
            console.error('Error saving global score:', error);
        }
    }

    async cleanupOldGlobalScores() {
        if (!this.firebaseAvailable) return;
        
        try {
            const database = window.FirebaseDB;
            const globalScoresRef = database.ref('leaderboard/global');
            const snapshot = await globalScoresRef.once('value');
            
            if (snapshot.exists()) {
                const scores = [];
                snapshot.forEach((childSnapshot) => {
                    const score = childSnapshot.val();
                    score.id = childSnapshot.key;
                    scores.push(score);
                });
                
                // Keep only top 100 scores
                if (scores.length > 100) {
                    scores.sort((a, b) => b.score - a.score);
                    const scoresToKeep = scores.slice(0, 100);
                    
                    // Remove old scores
                    const scoresToRemove = scores.slice(100);
                    for (const score of scoresToRemove) {
                        await globalScoresRef.child(score.id).remove();
                    }
                }
            }
        } catch (error) {
            console.error('Error cleaning up old scores:', error);
        }
    }

    getPlayerRank(score) {
        return this.globalScores.findIndex(s => s.score === score) + 1;
    }

    getTopScore() {
        return this.globalScores.length > 0 ? this.globalScores[0].score : 0;
    }

    getAverageScore() {
        if (this.globalScores.length === 0) return 0;
        const total = this.globalScores.reduce((sum, score) => sum + score.score, 0);
        return Math.round(total / this.globalScores.length);
    }

    getPlayerStats(playerName) {
        const playerScores = this.globalScores.filter(score => score.playerName === playerName);
        if (playerScores.length === 0) return null;
        
        const totalScore = playerScores.reduce((sum, score) => sum + score.score, 0);
        const averageScore = Math.round(totalScore / playerScores.length);
        const topScore = Math.max(...playerScores.map(score => score.score));
        
        return {
            totalGames: playerScores.length,
            totalScore: totalScore,
            averageScore: averageScore,
            topScore: topScore
        };
    }

    async clearLocalScores() {
        this.localScores = [];
        localStorage.removeItem('tetris_local_scores');
        
        if (this.firebaseAvailable && this.userId) {
            try {
                const database = window.FirebaseDB;
                const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
                await userScoresRef.remove();
            } catch (error) {
                console.error('Error clearing local scores from Firebase:', error);
            }
        }
        
        this.renderLocalLeaderboard();
    }

    async clearGlobalScores() {
        if (!this.firebaseAvailable) return;
        
        try {
            const database = window.FirebaseDB;
            const globalScoresRef = database.ref('leaderboard/global');
            await globalScoresRef.remove();
            this.globalScores = [];
            this.renderGlobalLeaderboard();
        } catch (error) {
            console.error('Error clearing global scores:', error);
        }
    }

    async migrateLocalScoresToFirebase() {
        const stored = localStorage.getItem('tetris_local_scores');
        if (stored && this.firebaseAvailable && this.userId) {
            try {
                const scores = JSON.parse(stored);
                const database = window.FirebaseDB;
                const userScoresRef = database.ref(`leaderboard/local/${this.userId}`);
                await userScoresRef.set(scores);
                
                // Clear localStorage after successful migration
                localStorage.removeItem('tetris_local_scores');
                
            } catch (error) {
                console.error('Error migrating local scores to Firebase:', error);
            }
        }
    }

    async getLeaderboardStats() {
        const stats = {
            totalGlobalScores: this.globalScores.length,
            totalLocalScores: this.localScores ? this.localScores.length : 0,
            topGlobalScore: this.getTopScore(),
            averageGlobalScore: this.getAverageScore(),
            firebaseAvailable: this.firebaseAvailable
        };
        
        return stats;
    }

    getAverageScoreFromArray(scores) {
        if (scores.length === 0) return 0;
        const total = scores.reduce((sum, score) => sum + score.score, 0);
        return Math.round(total / scores.length);
    }

    async exportLocalScores() {
        const dataStr = JSON.stringify(this.localScores, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tetris-scores-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    async importLocalScores(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const scores = JSON.parse(e.target.result);
                    this.localScores = scores;
                    localStorage.setItem('tetris_local_scores', JSON.stringify(scores));
                    this.renderLocalLeaderboard();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    async checkFirebaseRules() {
        if (!this.firebaseAvailable) return;
        
        try {
            const database = window.FirebaseDB;
            const testRef = database.ref('test_write_permission');
            
            const testData = {
                test: true,
                timestamp: Date.now()
            };
            
            await testRef.set(testData);
            await testRef.remove();
            
        } catch (error) {
            console.error('Firebase write permission test failed:', error);
        }
    }

    async testFirebaseConnection() {
        if (!this.firebaseAvailable) return;
        
        try {
            const database = window.FirebaseDB;
            const testRef = database.ref('connection_test');
            
            const testData = {
                test: true,
                timestamp: Date.now(),
                userId: this.userId
            };
            
            await testRef.set(testData);
            const snapshot = await testRef.once('value');
            const readData = snapshot.val();
            await testRef.remove();
            
        } catch (error) {
            console.error('Firebase connection test failed:', error);
        }
    }

    async runFirebaseTests() {
        if (!this.firebaseAvailable) {
            return;
        }
        
        // Test 1: Connection
        await this.testFirebaseConnection();
        
        // Test 2: Score submission
        const testScore = {
            score: 999999,
            playerName: 'Test Player',
            level: 10,
            lines: 100,
            timestamp: Date.now()
        };
        
        await this.submitScore(testScore.score, testScore.playerName, testScore.level, testScore.lines);
        
        // Test 3: Load leaderboards
        this.loadLeaderboards();
        
        // Test 4: Manual score addition
        const manualScore = {
            score: 888888,
            playerName: 'Manual Test',
            level: 8,
            lines: 80,
            timestamp: Date.now()
        };
        
        await this.saveLocalScore(manualScore);
        await this.saveGlobalScore(manualScore);
    }

    checkFirebaseSDK() {
        const firebaseScripts = document.querySelectorAll('script[src*="firebase"]');
        
        if (firebaseScripts.length === 0) {
            return;
        }
        
        if (typeof firebase !== 'undefined') {
            // Firebase SDK is available
        } else {
            // Firebase SDK not found
        }
    }

    refreshLeaderboards() {
        this.loadLeaderboards();
    }
}

// Initialize leaderboard manager
const leaderboardManager = new LeaderboardManager();
window.leaderboardManager = leaderboardManager; 
window.leaderboardManager = leaderboardManager; 