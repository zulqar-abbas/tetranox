// Animation Utilities - Optimized for Performance

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.particles = [];
        this.isEnabled = true;
        this.performanceMode = false;
        this.maxFloatingBlocks = 18; // Increased from 6 to 18 for more floating shapes
        this.maxParticles = 50; // Limit particle count
        this.animationFrameId = null;
        this.lastUpdate = 0;
        this.updateInterval = 16; // ~60fps
        this.init();
    }

    init() {
        // Check for reduced motion preference
        this.checkReducedMotion();
        
        // Check device performance
        this.checkPerformance();
        
        // Initialize animation library
        this.initializeAnimations();
    }

    // Check for reduced motion preference
    checkReducedMotion() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            console.log('Reduced motion preference detected - animations disabled');
        }
    }

    // Check device performance
    checkPerformance() {
        // Simple performance check based on hardware concurrency
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            this.performanceMode = true;
            this.maxParticles = 25; // Reduce particle count on slower devices
            this.maxFloatingBlocks = 9; // Reduce floating blocks
            console.log('Performance mode enabled for slower device');
        }
    }

    // Initialize animation library
    initializeAnimations() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Start background animations after a short delay
        setTimeout(() => {
            this.startBackgroundAnimations();
        }, 1000);
    }

    setupEventListeners() {
        // Listen for score updates
        document.addEventListener('scoreUpdate', (e) => {
            this.animateScoreUpdate(e.detail.score, e.detail.element);
        });

        // Listen for level ups
        document.addEventListener('levelUp', (e) => {
            this.animateLevelUp(e.detail.level, e.detail.element);
        });

        // Listen for line clears
        document.addEventListener('lineClear', (e) => {
            this.animateLineClear(e.detail.lines, e.detail.score);
        });

        // Listen for power-up activations
        document.addEventListener('powerupActivated', (e) => {
            this.animatePowerupActivation(e.detail.powerup, e.detail.element);
        });

        // Listen for game over
        document.addEventListener('gameOver', (e) => {
            this.animateGameOver(e.detail.score);
        });
    }

    startBackgroundAnimations() {
        // Create floating tetris blocks on all screens with reduced count
        this.createFloatingTetrisBlocks();
        
        // Start optimized particle system
        this.startParticleSystem();
    }

    createFloatingTetrisBlocks() {
        // Create floating blocks for all screens with reduced count
        const screens = ['main-menu', 'single-player-setup', 'multiplayer-setup', 'leaderboard-screen', 'settings-screen'];
        
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                this.createFloatingTetrisBlocksForScreen(screen);
            }
        });
    }

    createFloatingTetrisBlocksForScreen(screen) {
        // Create different tetris block shapes with actual tetris piece layouts
        const blockShapes = [
            { 
                type: 'I', 
                color: '#00ffff', 
                width: 80, 
                height: 20,
                shape: [[1, 1, 1, 1]]
            },
            { 
                type: 'O', 
                color: '#ffff00', 
                width: 40, 
                height: 40,
                shape: [[1, 1], [1, 1]]
            },
            { 
                type: 'T', 
                color: '#800080', 
                width: 60, 
                height: 40,
                shape: [[0, 1, 0], [1, 1, 1]]
            },
            { 
                type: 'S', 
                color: '#00ff00', 
                width: 60, 
                height: 40,
                shape: [[0, 1, 1], [1, 1, 0]]
            },
            { 
                type: 'Z', 
                color: '#ff0000', 
                width: 60, 
                height: 40,
                shape: [[1, 1, 0], [0, 1, 1]]
            },
            { 
                type: 'J', 
                color: '#0000ff', 
                width: 60, 
                height: 40,
                shape: [[1, 0, 0], [1, 1, 1]]
            },
            { 
                type: 'L', 
                color: '#ffa500', 
                width: 60, 
                height: 40,
                shape: [[0, 0, 1], [1, 1, 1]]
            }
        ];

        // Create fewer blocks for better performance
        const blockCount = screen.id === 'main-menu' ? this.maxFloatingBlocks : 3;
        
        for (let i = 0; i < blockCount; i++) {
            setTimeout(() => {
                const shape = blockShapes[i % blockShapes.length];
                this.createFloatingTetrisBlock(shape, screen);
            }, i * 2000); // Increased delay for better performance
        }
    }

    createFloatingTetrisBlock(shape, screen) {
        const tetrisBlock = document.createElement('div');
        tetrisBlock.className = 'floating-tetris-block';
        
        // Create the actual tetris shape using CSS grid
        let shapeHTML = '';
        const blockSize = 10; // Slightly larger for more visibility
        const rows = shape.shape.length;
        const cols = shape.shape[0].length;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (shape.shape[row][col]) {
                    shapeHTML += `<div class=\"tetris-block\" style=\"background: #00ff00; border: 1px solid #00ff00;\"></div>`;
                } else {
                    shapeHTML += '<div class=\"tetris-block empty\"></div>';
                }
            }
        }
        
        tetrisBlock.innerHTML = shapeHTML;
        tetrisBlock.style.cssText = `
            position: absolute;
            display: grid;
            grid-template-columns: repeat(${cols}, ${blockSize}px);
            grid-template-rows: repeat(${rows}, ${blockSize}px);
            gap: 1px;
            opacity: 0.22; /* Increased for brightness */
            pointer-events: none;
            z-index: 1;
            animation: floatTetrisBlock 30s linear infinite;
            filter: drop-shadow(0 0 16px #00ff00) drop-shadow(0 0 32px #00ff00) drop-shadow(0 0 48px #00ff00);
        `;

        // Random position
        tetrisBlock.style.left = Math.random() * 100 + '%';
        tetrisBlock.style.top = Math.random() * 100 + '%';

        screen.appendChild(tetrisBlock);

        // Remove after animation
        setTimeout(() => {
            if (tetrisBlock.parentNode) {
                tetrisBlock.parentNode.removeChild(tetrisBlock);
            }
        }, 30000);
    }

    startParticleSystem() {
        // Create particles less frequently for better performance
        setInterval(() => {
            if (this.particles.length < this.maxParticles) {
                this.createParticle();
            }
        }, 5000); // Increased interval
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: particleFloat 12s linear infinite;
        `;

        // Random position and delay
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 12 + 's';

        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 12000);
    }

    animateScoreUpdate(score, element) {
        if (!element || !this.isEnabled) return;

        // Add score update class
        element.classList.add('score-update');
        
        // Create floating score text
        this.createFloatingScore(score, element);

        // Remove class after animation
        setTimeout(() => {
            element.classList.remove('score-update');
        }, 500);
    }

    createFloatingScore(score, element) {
        const rect = element.getBoundingClientRect();
        const floatingScore = document.createElement('div');
        floatingScore.textContent = `+${score}`;
        floatingScore.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            color: #ffff00;
            font-weight: bold;
            font-size: 1rem;
            pointer-events: none;
            z-index: 10000;
            animation: floatingScore 1s ease-out forwards;
        `;

        document.body.appendChild(floatingScore);

        setTimeout(() => {
            if (floatingScore.parentNode) {
                floatingScore.parentNode.removeChild(floatingScore);
            }
        }, 1000);
    }

    animateLevelUp(level, element) {
        if (!element || !this.isEnabled) return;

        // Add level up class
        element.classList.add('level-up');

        // Create level up effect
        this.createLevelUpEffect(level, element);

        // Remove class after animation
        setTimeout(() => {
            element.classList.remove('level-up');
        }, 1000);
    }

    createLevelUpEffect(level, element) {
        const rect = element.getBoundingClientRect();
        const levelUpEffect = document.createElement('div');
        levelUpEffect.textContent = `LEVEL ${level}!`;
        levelUpEffect.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            color: #00ff00;
            font-weight: bold;
            font-size: 1.2rem;
            text-shadow: 0 0 5px #00ff00;
            pointer-events: none;
            z-index: 10000;
            animation: levelUpEffect 2s ease-out forwards;
        `;

        document.body.appendChild(levelUpEffect);

        setTimeout(() => {
            if (levelUpEffect.parentNode) {
                levelUpEffect.parentNode.removeChild(levelUpEffect);
            }
        }, 2000);
    }

    animateLineClear(lines, score) {
        if (!this.isEnabled) return;
        
        // Create line clear particles with reduced count
        this.createLineClearParticles(lines);

        // Animate game board
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.style.animation = 'lineClearFlash 0.5s ease-out';
            setTimeout(() => {
                gameBoard.style.animation = '';
            }, 500);
        }
    }

    createLineClearParticles(lines) {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        const rect = gameBoard.getBoundingClientRect();
        const colors = ['#ffff00', '#00ff00', '#ff6b6b', '#4ecdc4'];

        // Reduced particle count for better performance
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 3px;
                    height: 3px;
                    background: ${colors[i % colors.length]};
                    border-radius: 50%;
                    left: ${rect.left + Math.random() * rect.width}px;
                    top: ${rect.top + Math.random() * rect.height}px;
                    pointer-events: none;
                    z-index: 10000;
                    animation: lineClearParticle 1s ease-out forwards;
                `;

                document.body.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    animatePowerupActivation(powerup, element) {
        if (!element || !this.isEnabled) return;

        // Add active class
        element.classList.add('active');

        // Create power-up effect
        this.createPowerupEffect(powerup, element);

        // Remove active class after animation
        setTimeout(() => {
            element.classList.remove('active');
        }, 500);
    }

    createPowerupEffect(powerup, element) {
        const rect = element.getBoundingClientRect();
        const effect = document.createElement('div');
        effect.textContent = powerup.toUpperCase();
        effect.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            color: var(--accent-primary);
            font-weight: bold;
            font-size: 0.9rem;
            text-shadow: 0 0 5px var(--accent-primary);
            pointer-events: none;
            z-index: 10000;
            animation: powerupEffect 1s ease-out forwards;
        `;

        document.body.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }

    animateGameOver(score) {
        if (!this.isEnabled) return;
        
        // Create game over particles with reduced count
        this.createGameOverParticles();

        // Animate final score
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            this.animateFinalScore(score, finalScoreElement);
        }
    }

    createGameOverParticles() {
        // Reduced particle count for better performance
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 2px;
                    height: 2px;
                    background: #ff6b6b;
                    border-radius: 50%;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    pointer-events: none;
                    z-index: 10000;
                    animation: gameOverParticle 2s ease-out forwards;
                `;

                document.body.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 200);
        }
    }

    animateFinalScore(score, element) {
        let currentScore = 0;
        const increment = score / 30; // Reduced steps for better performance
        const interval = setInterval(() => {
            currentScore += increment;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(interval);
            }
            element.textContent = Math.floor(currentScore).toLocaleString();
        }, 30);
    }

    // Utility method to trigger animations
    triggerAnimation(type, data) {
        if (!this.isEnabled) return;
        const event = new CustomEvent(type, { detail: data });
        document.dispatchEvent(event);
    }

    // Enable/disable animations
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearAll();
        }
    }

    // Create particle effect with performance limits
    createParticles(x, y, count = 5, color = '#00ff00', type = 'explosion') {
        if (!this.isEnabled || this.particles.length >= this.maxParticles) return;

        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        for (let i = 0; i < actualCount; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4, // Reduced velocity
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02, // Faster decay
                size: Math.random() * 3 + 1, // Smaller particles
                color: color,
                type: type
            };
            this.particles.push(particle);
        }
    }

    // Create line clear effect with performance optimization
    createLineClearEffect(y, width) {
        if (!this.isEnabled) return;

        const blockSize = GAME_CONSTANTS.BLOCK_SIZE;
        const startX = 0;
        const endX = width * blockSize;

        // Create flash effect
        this.createFlash(startX, y * blockSize, endX, blockSize);

        // Create fewer particles along the line
        for (let x = 0; x < width; x += 2) { // Skip every other block
            this.createParticles(
                x * blockSize + blockSize / 2,
                y * blockSize + blockSize / 2,
                2, // Reduced particle count
                '#ffff00',
                'sparkle'
            );
        }
    }

    // Create flash effect
    createFlash(x, y, width, height) {
        if (!this.isEnabled) return;

        const flash = {
            x: x,
            y: y,
            width: width,
            height: height,
            life: 1.0,
            decay: 0.1, // Faster decay
            type: 'flash'
        };
        this.animations.push(flash);
    }

    // Create score popup
    createScorePopup(x, y, score, color = '#00ff00') {
        if (!this.isEnabled) return;

        const popup = {
            x: x,
            y: y,
            text: `+${score}`,
            color: color,
            life: 1.0,
            decay: 0.03, // Faster decay
            vy: -1.5, // Slower movement
            type: 'score'
        };
        this.animations.push(popup);
    }

    // Create level up effect with reduced intensity
    createLevelUpEffect() {
        if (!this.isEnabled) return;

        // Create screen flash
        this.createFlash(0, 0, window.innerWidth, window.innerHeight);

        // Create fewer particles across screen
        for (let i = 0; i < 20; i++) { // Reduced from 50
            this.createParticles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                1,
                '#00ff00',
                'levelup'
            );
        }
    }

    // Create game over effect with reduced intensity
    createGameOverEffect() {
        if (!this.isEnabled) return;

        // Create red flash
        this.createFlash(0, 0, window.innerWidth, window.innerHeight, '#ff0000');

        // Create fewer falling particles
        for (let i = 0; i < 30; i++) { // Reduced from 100
            const particle = {
                x: Math.random() * window.innerWidth,
                y: -10,
                vx: (Math.random() - 0.5) * 2, // Reduced velocity
                vy: Math.random() * 2 + 1, // Reduced velocity
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2, // Smaller particles
                color: '#ff0000',
                type: 'falling'
            };
            this.particles.push(particle);
        }
    }

    // Create power-up effect with reduced intensity
    createPowerupEffect(x, y, powerupType) {
        if (!this.isEnabled) return;

        const colors = {
            'SLOW_TIME': '#00ffff',
            'BOMB_PIECE': '#ff0000',
            'FREEZE_LINE': '#00ffff'
        };

        const color = colors[powerupType] || '#00ff00';
        this.createParticles(x, y, 10, color, 'powerup'); // Reduced from 20
    }

    // Create achievement effect with reduced intensity
    createAchievementEffect() {
        if (!this.isEnabled) return;

        // Create fewer golden particles
        for (let i = 0; i < 15; i++) { // Reduced from 30
            this.createParticles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                1,
                '#ffd700',
                'achievement'
            );
        }
    }

    // Update all animations with performance optimization
    update(timestamp) {
        if (!this.isEnabled) return;

        // Throttle updates for better performance
        if (timestamp - this.lastUpdate < this.updateInterval) {
            return;
        }
        this.lastUpdate = timestamp;

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;

            // Apply gravity to falling particles
            if (particle.type === 'falling') {
                particle.vy += 0.05; // Reduced gravity
            }

            return particle.life > 0;
        });

        // Update animations
        this.animations = this.animations.filter(animation => {
            animation.life -= animation.decay;

            // Update score popups
            if (animation.type === 'score') {
                animation.y += animation.vy;
            }

            return animation.life > 0;
        });
    }

    // Render all animations with performance optimization
    render(ctx) {
        if (!this.isEnabled) return;

        // Render particles
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;

            switch (particle.type) {
                case 'sparkle':
                    this.renderSparkle(ctx, particle);
                    break;
                case 'levelup':
                    this.renderStar(ctx, particle);
                    break;
                case 'achievement':
                    this.renderStar(ctx, particle);
                    break;
                default:
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
            }
            ctx.restore();
        });

        // Render animations
        this.animations.forEach(animation => {
            ctx.save();
            ctx.globalAlpha = animation.life;

            switch (animation.type) {
                case 'flash':
                    this.renderFlash(ctx, animation);
                    break;
                case 'score':
                    this.renderScorePopup(ctx, animation);
                    break;
            }
            ctx.restore();
        });
    }

    // Render sparkle particle
    renderSparkle(ctx, particle) {
        const size = particle.size;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1; // Reduced line width

        // Draw cross
        ctx.beginPath();
        ctx.moveTo(particle.x - size, particle.y);
        ctx.lineTo(particle.x + size, particle.y);
        ctx.moveTo(particle.x, particle.y - size);
        ctx.lineTo(particle.x, particle.y + size);
        ctx.stroke();

        // Draw diagonal lines
        ctx.beginPath();
        ctx.moveTo(particle.x - size * 0.7, particle.y - size * 0.7);
        ctx.lineTo(particle.x + size * 0.7, particle.y + size * 0.7);
        ctx.moveTo(particle.x - size * 0.7, particle.y + size * 0.7);
        ctx.lineTo(particle.x + size * 0.7, particle.y - size * 0.7);
        ctx.stroke();
    }

    // Render star particle
    renderStar(ctx, particle) {
        const size = particle.size;
        ctx.fillStyle = particle.color;

        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const x = particle.x + Math.cos(angle) * size;
            const y = particle.y + Math.sin(angle) * size;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    // Render flash effect
    renderFlash(ctx, flash) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(flash.x, flash.y, flash.width, flash.height);
    }

    // Render score popup
    renderScorePopup(ctx, popup) {
        ctx.fillStyle = popup.color;
        ctx.font = 'bold 20px Arial'; // Reduced font size
        ctx.textAlign = 'center';
        ctx.fillText(popup.text, popup.x, popup.y);
    }

    // Clear all animations
    clearAll() {
        this.particles = [];
        this.animations = [];
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // Get animation count
    getCount() {
        return this.particles.length + this.animations.length;
    }

    // Performance monitoring
    getPerformanceStats() {
        return {
            particles: this.particles.length,
            animations: this.animations.length,
            total: this.getCount(),
            maxParticles: this.maxParticles,
            enabled: this.isEnabled
        };
    }
}

// Screen transition animations
class ScreenTransition {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'flex';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    static slideIn(element, direction = 'left', duration = 300) {
        const startX = direction === 'left' ? -100 : direction === 'right' ? 100 : 0;
        const startY = direction === 'up' ? -100 : direction === 'down' ? 100 : 0;
        
        element.style.transform = `translate(${startX}%, ${startY}%)`;
        element.style.display = 'flex';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const t = Math.min(progress / duration, 1);
            
            const currentX = startX * (1 - t);
            const currentY = startY * (1 - t);
            
            element.style.transform = `translate(${currentX}%, ${currentY}%)`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static slideOut(element, direction = 'right', duration = 300) {
        const endX = direction === 'left' ? -100 : direction === 'right' ? 100 : 0;
        const endY = direction === 'up' ? -100 : direction === 'down' ? 100 : 0;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const t = Math.min(progress / duration, 1);
            
            const currentX = endX * t;
            const currentY = endY * t;
            
            element.style.transform = `translate(${currentX}%, ${currentY}%)`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Button animation effects
class ButtonEffects {
    static addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    static addHoverEffect(button) {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// Text animation effects
class TextEffects {
    static typewriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }

    static glitch(element, duration = 2000) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const glitch = () => {
            let glitchedText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.1) {
                    glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    glitchedText += originalText[i];
                }
            }
            element.textContent = glitchedText;
        };
        
        const interval = setInterval(glitch, 50);
        setTimeout(() => {
            clearInterval(interval);
            element.textContent = originalText;
        }, duration);
    }

    static pulse(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out infinite`;
    }
}

// Export animation classes
window.AnimationManager = AnimationManager;
window.ScreenTransition = ScreenTransition;
window.ButtonEffects = ButtonEffects;
window.TextEffects = TextEffects;

// Add CSS animations - Optimized for Performance
const style = document.createElement('style');
style.textContent = `
    @keyframes floatTetrisBlock {
        0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.08;
        }
        90% {
            opacity: 0.08;
        }
        100% {
            transform: translateY(-100px) translateX(100px) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 0.4;
        }
        90% {
            opacity: 0.4;
        }
        100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
        }
    }

    @keyframes floatingScore {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-30px) scale(1.2);
            opacity: 0;
        }
    }

    @keyframes levelUpEffect {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translateY(-40px) scale(1);
            opacity: 0;
        }
    }

    @keyframes lineClearParticle {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0) translateY(-30px);
            opacity: 0;
        }
    }

    @keyframes powerupEffect {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-15px) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translateY(-30px) scale(1);
            opacity: 0;
        }
    }

    @keyframes gameOverParticle {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0) translateY(-50px);
            opacity: 0;
        }
    }

    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }

    /* Optimized animations for better performance */
    .score-update {
        animation: scoreUpdate 0.4s ease-out;
    }

    @keyframes scoreUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); color: #ffff00; }
        100% { transform: scale(1); }
    }

    .level-up {
        animation: levelUp 0.8s ease-out;
    }

    @keyframes levelUp {
        0% { transform: scale(1); }
        25% { transform: scale(1.2); color: #00ff00; }
        50% { transform: scale(1.1); color: #ffff00; }
        75% { transform: scale(1.15); color: #00ff00; }
        100% { transform: scale(1); }
    }

    .lineClearFlash {
        animation: lineClearFlash 0.4s ease-out;
    }

    @keyframes lineClearFlash {
        0% { filter: brightness(1); }
        50% { filter: brightness(1.5); }
        100% { filter: brightness(1); }
    }

    /* Reduced complexity animations */
    .powerup.available {
        animation: powerupGlow 4s ease-in-out infinite;
    }

    @keyframes powerupGlow {
        0%, 100% { 
            box-shadow: 0 0 3px var(--accent-primary);
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 0 6px var(--accent-primary);
            transform: scale(1.01);
        }
    }

    .powerup.active {
        animation: powerupActivate 0.3s ease-out;
    }

    @keyframes powerupActivate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    /* Simplified button animations */
    .menu-btn:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }

    .menu-btn:active {
        transform: translateY(0);
    }

    /* Optimized control key animations */
    .control-key {
        animation: controlKeyPulse 4s ease-in-out infinite;
    }

    @keyframes controlKeyPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    /* Reduced stagger delays */
    .control-group:nth-child(1) .control-key { animation-delay: 0s; }
    .control-group:nth-child(2) .control-key { animation-delay: 0.8s; }
    .control-group:nth-child(3) .control-key { animation-delay: 1.6s; }
    .control-group:nth-child(4) .control-key { animation-delay: 2.4s; }
    .control-group:nth-child(5) .control-key { animation-delay: 3.2s; }

    /* Simplified overlay animations */
    .game-overlay {
        animation: overlayFadeIn 0.3s ease-out;
    }

    @keyframes overlayFadeIn {
        from {
            opacity: 0;
            backdrop-filter: blur(0px);
        }
        to {
            opacity: 1;
            backdrop-filter: blur(3px);
        }
    }

    .overlay-content {
        animation: overlayContentSlideIn 0.5s ease-out 0.1s both;
    }

    @keyframes overlayContentSlideIn {
        from {
            transform: translateY(-30px) scale(0.95);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }

    /* Optimized achievement animations */
    .achievement-toast {
        animation: achievementSlideIn 0.4s ease-out;
    }

    @keyframes achievementSlideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Simplified loading animations */
    .loading-spinner {
        animation: spin 1.5s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-title {
        animation: loadingTitleGlow 3s ease-in-out infinite alternate;
    }

    @keyframes loadingTitleGlow {
        from { 
            text-shadow: 0 0 15px var(--accent-primary);
            transform: scale(1);
        }
        to { 
            text-shadow: 0 0 20px var(--accent-primary);
            transform: scale(1.02);
        }
    }

    /* Performance-friendly toggle animations */
    .toggle-switch:checked {
        animation: toggleOn 0.2s ease-out;
    }

    @keyframes toggleOn {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    /* Simplified slider animations */
    input[type="range"]:hover {
        transform: scale(1.02);
    }

    input[type="range"]:hover::-webkit-slider-thumb {
        transform: scale(1.1);
        box-shadow: 0 0 5px var(--accent-primary);
    }

    /* Reduced badge animations */
    .achievement-badge {
        animation: badgeGlow 4s ease-in-out infinite;
    }

    @keyframes badgeGlow {
        0%, 100% { 
            box-shadow: 0 0 5px var(--accent-primary);
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 0 10px var(--accent-primary);
            transform: scale(1.02);
        }
    }

    /* Simplified leaderboard animations */
    .leaderboard-row:hover {
        transform: translateX(5px);
        transition: transform 0.2s ease;
    }

    .leaderboard-row:nth-child(1) {
        animation: goldGlow 3s ease-in-out infinite;
    }

    .leaderboard-row:nth-child(2) {
        animation: silverGlow 3s ease-in-out infinite 1s;
    }

    .leaderboard-row:nth-child(3) {
        animation: bronzeGlow 3s ease-in-out infinite 2s;
    }

    @keyframes goldGlow {
        0%, 100% { box-shadow: 0 0 5px #ffd700; }
        50% { box-shadow: 0 0 10px #ffd700; }
    }

    @keyframes silverGlow {
        0%, 100% { box-shadow: 0 0 5px #c0c0c0; }
        50% { box-shadow: 0 0 10px #c0c0c0; }
    }

    @keyframes bronzeGlow {
        0%, 100% { box-shadow: 0 0 5px #cd7f32; }
        50% { box-shadow: 0 0 10px #cd7f32; }
    }

    /* Simplified chat animations */
    .chat-message {
        animation: messageSlideIn 0.2s ease-out;
    }

    @keyframes messageSlideIn {
        from {
            transform: translateX(-50px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Reduced code pulse animation */
    .room-code-display {
        animation: codePulse 3s ease-in-out infinite;
    }

    @keyframes codePulse {
        0%, 100% { 
            transform: scale(1);
            text-shadow: 0 0 5px var(--accent-primary);
        }
        50% { 
            transform: scale(1.02);
            text-shadow: 0 0 8px var(--accent-primary);
        }
    }

    /* Simplified progress animation */
    .loading-progress {
        animation: progressFill 3s ease-in-out infinite;
    }

    @keyframes progressFill {
        0% { width: 0%; }
        50% { width: 100%; }
        100% { width: 0%; }
    }

    /* Reduced message bounce */
    .error-message,
    .success-message {
        animation: messageBounce 0.3s ease-out;
    }

    @keyframes messageBounce {
        0% { transform: scale(0.9); opacity: 0; }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
    }

    /* Simplified hover effects */
    .interactive-element {
        transition: all 0.2s ease;
    }

    .interactive-element:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }

    /* Reduced focus effects */
    .interactive-element:focus {
        outline: 1px solid var(--accent-primary);
        outline-offset: 1px;
        transform: scale(1.01);
    }
`;
document.head.appendChild(style);

// Initialize animation manager
const animationManager = new AnimationManager();
window.animationManager = animationManager; 