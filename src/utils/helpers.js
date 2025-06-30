// Utility Helper Functions

// Generate random room code
function generateRoomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Deep clone an object
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// Rotate a 2D array (matrix) clockwise
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            rotated[j][rows - 1 - i] = matrix[i][j];
        }
    }
    return rotated;
}

// Check if two positions are equal
function positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

// Calculate distance between two points
function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

// Format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format score with commas
function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Create a 2D array filled with a value
function create2DArray(rows, cols, fillValue = 0) {
    return Array(rows).fill().map(() => Array(cols).fill(fillValue));
}

// Check if arrays are equal
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate level from lines cleared
function calculateLevel(lines) {
    return Math.floor(lines / GAME_CONSTANTS.GAME_SETTINGS.LEVEL_UP_LINES) + 1;
}

// Calculate drop interval based on level
function calculateDropInterval(level) {
    const interval = GAME_CONSTANTS.GAME_SETTINGS.INITIAL_DROP_INTERVAL * 
                    Math.pow(GAME_CONSTANTS.GAME_SETTINGS.SPEED_INCREASE_FACTOR, level - 1);
    return Math.max(interval, GAME_CONSTANTS.GAME_SETTINGS.MIN_DROP_INTERVAL);
}

// Validate room code format
function isValidRoomCode(code) {
    return /^[A-Z0-9]{6}$/.test(code);
}

// Sanitize user input
function sanitizeInput(input, maxLength = 15) {
    return input.trim().substring(0, maxLength).replace(/[<>]/g, '');
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get touch coordinates from event
function getTouchCoordinates(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
        x: touch.clientX,
        y: touch.clientY
    };
}

// Export helper functions
window.Helpers = {
    generateRoomCode,
    deepClone,
    rotateMatrix,
    positionsEqual,
    distance,
    formatTime,
    formatScore,
    debounce,
    throttle,
    isInViewport,
    create2DArray,
    arraysEqual,
    getRandomElement,
    shuffleArray,
    calculateLevel,
    calculateDropInterval,
    isValidRoomCode,
    sanitizeInput,
    generateId,
    isMobile,
    getTouchCoordinates
}; 