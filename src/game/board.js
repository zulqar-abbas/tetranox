// Game Board Class

class Board {
    constructor(width = GAME_CONSTANTS.BOARD_WIDTH, height = GAME_CONSTANTS.BOARD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.grid = Helpers.create2DArray(height, width, 0);
        this.colors = Helpers.create2DArray(height, width, null);
        this.garbageLines = 0;
        this.frozenRows = new Set(); // For freeze line power-up
    }

    // Check if a position is within board bounds
    isWithinBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // Check if a position is empty
    isEmpty(x, y) {
        if (!this.isWithinBounds(x, y)) return false;
        return this.grid[y][x] === 0;
    }

    // Check if a position is occupied
    isOccupied(x, y) {
        if (!this.isWithinBounds(x, y)) return true; // Out of bounds is considered occupied
        return this.grid[y][x] === 1;
    }

    // Check if a tetromino can be placed at its current position
    isValidMove(tetromino) {
        const positions = tetromino.getPositions();
        
        for (const pos of positions) {
            if (this.isOccupied(pos.x, pos.y)) {
                return false;
            }
        }
        
        return true;
    }

    // Place a tetromino on the board
    placeTetromino(tetromino) {
        const positions = tetromino.getPositions();
        
        for (const pos of positions) {
            if (this.isWithinBounds(pos.x, pos.y)) {
                this.grid[pos.y][pos.x] = 1;
                this.colors[pos.y][pos.x] = tetromino.color;
            }
        }
    }

    // Remove a tetromino from the board (for ghost piece)
    removeTetromino(tetromino) {
        const positions = tetromino.getPositions();
        
        for (const pos of positions) {
            if (this.isWithinBounds(pos.x, pos.y)) {
                this.grid[pos.y][pos.x] = 0;
                this.colors[pos.y][pos.x] = null;
            }
        }
    }

    // Clear completed lines
    clearLines() {
        const linesToClear = [];
        
        // Find lines to clear
        for (let row = 0; row < this.grid.length; row++) {
            if (this.grid[row].every(cell => cell !== 0)) {
                linesToClear.push(row);
            }
        }
        
        if (linesToClear.length === 0) {
            return { linesCleared: 0, isTetris: false, lines: [] };
        }
        
        // Clear the lines
        for (const row of linesToClear) {
            this.grid[row] = new Array(this.width).fill(0);
            this.colors[row] = new Array(this.width).fill(null);
        }
        
        // Drop remaining pieces down
        this.dropPieces();
        
        // Check if it's a Tetris (4 lines cleared)
        const isTetris = linesToClear.length === 4;
        
        return {
            linesCleared: linesToClear.length,
            isTetris: isTetris,
            lines: linesToClear
        };
    }

    // Update frozen rows after line clearing
    updateFrozenRowsAfterClear(clearedLines) {
        const newFrozenRows = new Set();
        
        for (const frozenRow of this.frozenRows) {
            let newRow = frozenRow;
            
            // Count how many lines were cleared above this frozen row
            for (const clearedLine of clearedLines) {
                if (clearedLine <= frozenRow) {
                    newRow--;
                }
            }
            
            // Only keep frozen rows that are still valid
            if (newRow >= 0) {
                newFrozenRows.add(newRow);
            }
        }
        
        this.frozenRows = newFrozenRows;
    }

    // Check if a line is full
    isLineFull(row) {
        for (let col = 0; col < this.width; col++) {
            if (this.grid[row][col] === 0) {
                return false;
            }
        }
        return true;
    }

    // Add garbage lines (for multiplayer)
    addGarbageLines(count) {
        for (let i = 0; i < count; i++) {
            this.addGarbageLine();
        }
    }

    // Add a single garbage line
    addGarbageLine() {
        // Remove bottom line
        this.grid.pop();
        this.colors.pop();
        
        // Add garbage line at top
        const garbageLine = Array(this.width).fill(1);
        const garbageColors = Array(this.width).fill('#666666');
        
        // Leave one random hole
        const holePosition = Math.floor(Math.random() * this.width);
        garbageLine[holePosition] = 0;
        garbageColors[holePosition] = null;
        
        this.grid.unshift(garbageLine);
        this.colors.unshift(garbageColors);
        
        this.garbageLines++;
    }

    // Freeze top row (for freeze line power-up)
    freezeTopRow() {
        this.frozenRows.add(0);
    }

    // Unfreeze top row
    unfreezeTopRow() {
        this.frozenRows.delete(0);
    }

    // Check if top row is frozen
    isTopRowFrozen() {
        return this.frozenRows.has(0);
    }

    // Get board state for serialization
    getState() {
        return {
            grid: Helpers.deepClone(this.grid),
            colors: Helpers.deepClone(this.colors),
            garbageLines: this.garbageLines,
            frozenRows: Array.from(this.frozenRows)
        };
    }

    // Set board state from serialized data
    setState(state) {
        this.grid = Helpers.deepClone(state.grid);
        this.colors = Helpers.deepClone(state.colors);
        this.garbageLines = state.garbageLines || 0;
        this.frozenRows = new Set(state.frozenRows || []);
    }

    // Check if board is full (game over)
    isFull() {
        for (let col = 0; col < this.width; col++) {
            if (this.grid[0][col] === 1) {
                return true;
            }
        }
        return false;
    }

    // Get board height (highest occupied row)
    getBoardHeight() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.grid[row][col] === 1) {
                    return this.height - row;
                }
            }
        }
        return 0;
    }

    // Get number of holes in the board
    getHoleCount() {
        let holes = 0;
        let foundBlock = false;
        
        for (let col = 0; col < this.width; col++) {
            foundBlock = false;
            for (let row = 0; row < this.height; row++) {
                if (this.grid[row][col] === 1) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
        }
        
        return holes;
    }

    // Get bumpiness (height difference between adjacent columns)
    getBumpiness() {
        const heights = [];
        
        for (let col = 0; col < this.width; col++) {
            let height = 0;
            for (let row = 0; row < this.height; row++) {
                if (this.grid[row][col] === 1) {
                    height = this.height - row;
                    break;
                }
            }
            heights.push(height);
        }
        
        let bumpiness = 0;
        for (let i = 1; i < heights.length; i++) {
            bumpiness += Math.abs(heights[i] - heights[i - 1]);
        }
        
        return bumpiness;
    }

    // Clear the entire board
    clear() {
        this.grid = Helpers.create2DArray(this.height, this.width, 0);
        this.colors = Helpers.create2DArray(this.height, this.width, null);
        this.garbageLines = 0;
        this.frozenRows.clear();
    }

    // Get board statistics
    getStats() {
        return {
            height: this.getBoardHeight(),
            holes: this.getHoleCount(),
            bumpiness: this.getBumpiness(),
            garbageLines: this.garbageLines,
            frozenRows: this.frozenRows.size
        };
    }

    // Check for T-spin (simplified detection)
    checkTSpin(tetromino, lastMove) {
        if (!tetromino.isTPiece()) return false;
        
        // Check if the piece was rotated and then dropped
        if (lastMove === 'rotate' && tetromino.y > 0) {
            const positions = tetromino.getPositions();
            let cornerCount = 0;
            
            // Check the four corners around the T-piece
            const corners = [
                { x: tetromino.x - 1, y: tetromino.y - 1 },
                { x: tetromino.x + 3, y: tetromino.y - 1 },
                { x: tetromino.x - 1, y: tetromino.y + 2 },
                { x: tetromino.x + 3, y: tetromino.y + 2 }
            ];
            
            for (const corner of corners) {
                if (this.isOccupied(corner.x, corner.y)) {
                    cornerCount++;
                }
            }
            
            return cornerCount >= 3;
        }
        
        return false;
    }
}

// Export Board class
window.Board = Board; 
 