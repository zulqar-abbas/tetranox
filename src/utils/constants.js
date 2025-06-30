// Game Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino Shapes
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff7f00'
    }
};

// Game Settings
const GAME_SETTINGS = {
    INITIAL_DROP_INTERVAL: 1000, // milliseconds
    SOFT_DROP_INTERVAL: 50,
    HARD_DROP_INTERVAL: 10,
    LEVEL_UP_LINES: 10,
    SPEED_INCREASE_FACTOR: 0.9,
    MIN_DROP_INTERVAL: 50
};

// Scoring System
const SCORING = {
    SINGLE_LINE: 100,
    DOUBLE_LINE: 300,
    TRIPLE_LINE: 500,
    TETRIS: 800,
    T_SPIN: 400,
    SOFT_DROP: 1,
    HARD_DROP: 2
};

// Power-ups
const POWERUPS = {
    SLOW_TIME: {
        name: 'Slow Time',
        icon: '⏰',
        duration: 5000,
        effect: 'Reduces fall speed temporarily'
    },
    BOMB_PIECE: {
        name: 'Bomb Piece',
        icon: '💣',
        effect: 'Clears surrounding blocks'
    },
    FREEZE_LINE: {
        name: 'Freeze Line',
        icon: '❄️',
        duration: 3000,
        effect: 'Locks the top row temporarily'
    }
};

// Achievements
const ACHIEVEMENTS = {
    FIRST_TETRIS: {
        id: 'first_tetris',
        name: 'First Tetris!',
        description: 'Clear 4 lines at once',
        icon: '🏆'
    },
    BACK_TO_BACK: {
        id: 'back_to_back',
        name: 'Back to Back',
        description: 'Clear Tetris twice in a row',
        icon: '🔥'
    },
    T_SPIN_MASTER: {
        id: 't_spin_master',
        name: 'T-Spin Master',
        description: 'Perform a T-Spin',
        icon: '💫'
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Reach level 10',
        icon: '⚡'
    },
    SURVIVOR: {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive 5 minutes',
        icon: '🛡️'
    }
};

// Colors for themes
const THEME_COLORS = {
    classic: {
        background: '#1a1a1a',
        board: '#000000',
        grid: '#333333',
        text: '#ffffff',
        accent: '#00ff00'
    },
    retro: {
        background: '#2d2d2d',
        board: '#000000',
        grid: '#444444',
        text: '#ffffff',
        accent: '#ff6b6b'
    },
    neon: {
        background: '#0a0a0a',
        board: '#000000',
        grid: '#1a1a1a',
        text: '#00ffff',
        accent: '#ff00ff'
    },
    dark: {
        background: '#000000',
        board: '#111111',
        grid: '#222222',
        text: '#ffffff',
        accent: '#4CAF50'
    }
};

// Multiplayer settings
const MULTIPLAYER = {
    ROOM_CODE_LENGTH: 6,
    GARBAGE_LINES_PER_CLEAR: 2,
    MAX_CHAT_MESSAGES: 50,
    GAME_TIMEOUT: 300000 // 5 minutes
};

// Local storage keys
const STORAGE_KEYS = {
    SETTINGS: 'tetris_settings',
    HIGH_SCORE: 'tetris_high_score',
    LOCAL_LEADERBOARD: 'tetris_local_leaderboard',
    GAME_STATE: 'tetris_game_state'
};

// Export constants
window.GAME_CONSTANTS = {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    BLOCK_SIZE,
    TETROMINOES,
    GAME_SETTINGS,
    SCORING,
    POWERUPS,
    ACHIEVEMENTS,
    THEME_COLORS,
    MULTIPLAYER,
    STORAGE_KEYS
}; 