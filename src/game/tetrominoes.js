// Tetrominoes Class

class Tetromino {
    constructor(type, x = 0, y = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.shape = GAME_CONSTANTS.TETROMINOES[type].shape;
        this.color = GAME_CONSTANTS.TETROMINOES[type].color;
        this.originalShape = Helpers.deepClone(this.shape);
    }

    // Get current shape after rotation
    getCurrentShape() {
        let shape = this.originalShape;
        for (let i = 0; i < this.rotation; i++) {
            shape = Helpers.rotateMatrix(shape);
        }
        return shape;
    }

    // Rotate the piece clockwise
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    // Rotate the piece counter-clockwise
    rotateCounter() {
        this.rotation = (this.rotation - 1 + 4) % 4;
    }

    // Get rotated shape without changing current rotation
    getRotatedShape() {
        let shape = this.originalShape;
        for (let i = 0; i < (this.rotation + 1) % 4; i++) {
            shape = Helpers.rotateMatrix(shape);
        }
        return shape;
    }

    // Move the piece
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // Set position
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // Get all occupied positions
    getPositions() {
        const positions = [];
        const shape = this.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        
        return positions;
    }

    // Check if position is occupied by this piece
    isOccupied(x, y) {
        const shape = this.getCurrentShape();
        const localX = x - this.x;
        const localY = y - this.y;
        
        if (localX < 0 || localX >= shape[0].length || 
            localY < 0 || localY >= shape.length) {
            return false;
        }
        
        return shape[localY][localX] === 1;
    }

    // Clone the tetromino
    clone() {
        const cloned = new Tetromino(this.type, this.x, this.y);
        cloned.rotation = this.rotation;
        return cloned;
    }

    // Get ghost piece (where the piece would land)
    getGhostPiece(board) {
        const ghost = this.clone();
        while (board.isValidMove(ghost)) {
            ghost.y++;
        }
        ghost.y--; // Move back up one step
        return ghost;
    }

    // Check if this is a T-piece (for T-spin detection)
    isTPiece() {
        return this.type === 'T';
    }

    // Get the bounding box of the piece
    getBoundingBox() {
        const shape = this.getCurrentShape();
        return {
            left: this.x,
            right: this.x + shape[0].length - 1,
            top: this.y,
            bottom: this.y + shape.length - 1
        };
    }
}

// Tetromino Factory
class TetrominoFactory {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    // Refill the bag with all tetromino types
    refillBag() {
        const types = Object.keys(GAME_CONSTANTS.TETROMINOES);
        this.bag = Helpers.shuffleArray([...types]);
    }

    // Get next tetromino
    getNext() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        
        const type = this.bag.pop();
        return new Tetromino(type, Math.floor(GAME_CONSTANTS.BOARD_WIDTH / 2) - 1, 0);
    }

    // Peek at next tetromino without removing it
    peekNext() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        
        const type = this.bag[this.bag.length - 1];
        return new Tetromino(type, 0, 0);
    }

    // Get multiple next pieces (for preview)
    getNextPieces(count = 3) {
        const pieces = [];
        for (let i = 0; i < count; i++) {
            pieces.push(this.peekNext());
        }
        return pieces;
    }

    // Reset the factory (for new game)
    reset() {
        this.bag = [];
        this.refillBag();
    }
}

// Tetromino Queue for multiplayer
class TetrominoQueue {
    constructor() {
        this.queue = [];
        this.factory = new TetrominoFactory();
    }

    // Add piece to queue
    addPiece(piece) {
        this.queue.push(piece);
    }

    // Get next piece from queue
    getNext() {
        if (this.queue.length === 0) {
            return this.factory.getNext();
        }
        return this.queue.shift();
    }

    // Peek at next piece
    peekNext() {
        if (this.queue.length === 0) {
            return this.factory.peekNext();
        }
        return this.queue[0];
    }

    // Get queue length
    getLength() {
        return this.queue.length;
    }

    // Clear queue
    clear() {
        this.queue = [];
    }

    // Reset queue
    reset() {
        this.queue = [];
        this.factory.reset();
    }
}

// Export classes
window.Tetromino = Tetromino;
window.TetrominoFactory = TetrominoFactory;
window.TetrominoQueue = TetrominoQueue; 