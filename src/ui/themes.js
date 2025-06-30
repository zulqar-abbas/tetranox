// Theme Management System

class ThemeManager {
    constructor() {
        this.currentTheme = 'classic';
        this.themes = {
            classic: {
                name: 'Classic',
                description: 'The original Tetris look',
                colors: {
                    primary: '#00ff00',
                    secondary: '#00cc00',
                    background: '#1a1a1a',
                    board: '#000000',
                    text: '#ffffff'
                }
            },
            retro: {
                name: 'Retro Pixel',
                description: '8-bit pixel art style',
                colors: {
                    primary: '#ff6b6b',
                    secondary: '#ee5a52',
                    background: '#2d2d2d',
                    board: '#000000',
                    text: '#ffffff'
                }
            },
            neon: {
                name: 'Neon Glow',
                description: 'Cyberpunk neon aesthetic',
                colors: {
                    primary: '#ff00ff',
                    secondary: '#cc00cc',
                    background: '#0a0a0a',
                    board: '#000000',
                    text: '#00ffff'
                }
            },
            dark: {
                name: 'Dark Mode',
                description: 'Minimal dark theme',
                colors: {
                    primary: '#4CAF50',
                    secondary: '#45a049',
                    background: '#000000',
                    board: '#111111',
                    text: '#ffffff'
                }
            }
        };
        
        this.init();
    }

    // Initialize theme manager
    init() {
        // Load saved theme
        const savedTheme = window.StorageManager.loadSettings().theme;
        if (savedTheme && this.themes[savedTheme]) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('classic');
        }

        // Add theme toggle event listener
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.cycleTheme();
            });
        }

        // Add theme selector event listener
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
    }

    // Set theme
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme '${themeName}' not found, using default`);
            themeName = 'classic';
        }
        
        this.currentTheme = themeName;
        
        // Remove all theme classes
        document.body.classList.remove(...Object.keys(this.themes));
        
        // Add new theme class
        document.body.classList.add(themeName);
        
        // Update CSS custom properties
        this.updateCSSVariables(themeName);
        
        // Save theme preference
        if (window.storageManager) {
            storageManager.save('theme', themeName);
        }
        
        // Trigger theme change event
        this.triggerThemeChange(themeName);
    }

    // Update CSS variables for theme
    updateCSSVariables(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        const root = document.documentElement;
        root.style.setProperty('--accent-primary', theme.colors.primary);
        root.style.setProperty('--accent-secondary', theme.colors.secondary);
        root.style.setProperty('--bg-primary', theme.colors.background);
        root.style.setProperty('--text-primary', theme.colors.text);
        root.style.setProperty('--board-bg', theme.colors.board);
    }

    // Trigger theme change event
    triggerThemeChange(themeName) {
        // Dispatch custom event
        const event = new CustomEvent('themechange', {
            detail: {
                theme: themeName,
                themeData: this.themes[themeName]
            }
        });
        document.dispatchEvent(event);
        
        // Log theme change
        console.log(`Theme changed to: ${themeName}`);
    }

    // Cycle through themes
    cycleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.setTheme(themeNames[nextIndex]);
    }

    // Apply theme-specific effects
    applyThemeEffects(themeName) {
        const theme = this.themes[themeName];
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--accent-primary', theme.colors.primary);
        document.documentElement.style.setProperty('--accent-secondary', theme.colors.secondary);
        document.documentElement.style.setProperty('--bg-primary', theme.colors.background);
        document.documentElement.style.setProperty('--text-primary', theme.colors.text);
        
        // Apply theme-specific animations
        this.applyThemeAnimations(themeName);
        
        // Update UI elements
        this.updateUIElements(themeName);
    }

    // Apply theme-specific animations
    applyThemeAnimations(themeName) {
        const gameTitle = document.querySelector('.game-title');
        if (!gameTitle) return;
        
        // Remove existing animations
        gameTitle.style.animation = '';
        
        switch (themeName) {
            case 'neon':
                gameTitle.style.animation = 'neonPulse 2s ease-in-out infinite';
                break;
            case 'retro':
                gameTitle.style.animation = 'retroGlitch 3s infinite';
                break;
            case 'classic':
                gameTitle.style.animation = 'glow 2s ease-in-out infinite alternate';
                break;
            case 'dark':
                gameTitle.style.animation = 'pulse 2s infinite';
                break;
        }
    }

    // Update UI elements for theme
    updateUIElements(themeName) {
        const theme = this.themes[themeName];
        
        // Update game title
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            gameTitle.style.color = theme.colors.primary;
        }
        
        // Update buttons
        const buttons = document.querySelectorAll('.btn.primary');
        buttons.forEach(button => {
            button.style.background = `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
        });
        
        // Update power-up elements
        const powerups = document.querySelectorAll('.powerup');
        powerups.forEach(powerup => {
            powerup.style.borderColor = theme.colors.primary;
        });
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Get theme data
    getTheme(themeName) {
        return this.themes[themeName] || null;
    }

    // Get all themes
    getAllThemes() {
        return this.themes;
    }

    // Check if theme is available
    isThemeAvailable(themeName) {
        return this.themes.hasOwnProperty(themeName);
    }

    // Get theme color
    getThemeColor(colorName) {
        const theme = this.themes[this.currentTheme];
        return theme ? theme.colors[colorName] : null;
    }

    // Create custom theme
    createCustomTheme(name, colors) {
        if (this.themes[name]) {
            console.warn(`Theme "${name}" already exists`);
            return false;
        }
        
        this.themes[name] = {
            name: name,
            description: 'Custom theme',
            colors: {
                primary: colors.primary || '#00ff00',
                secondary: colors.secondary || '#00cc00',
                background: colors.background || '#1a1a1a',
                board: colors.board || '#000000',
                text: colors.text || '#ffffff'
            }
        };
        
        return true;
    }

    // Remove custom theme
    removeCustomTheme(themeName) {
        if (themeName === 'classic' || themeName === 'retro' || 
            themeName === 'neon' || themeName === 'dark') {
            console.warn('Cannot remove built-in themes');
            return false;
        }
        
        if (this.themes[themeName]) {
            delete this.themes[themeName];
            
            // If current theme was removed, switch to classic
            if (this.currentTheme === themeName) {
                this.setTheme('classic');
            }
            
            return true;
        }
        
        return false;
    }

    // Export theme data
    exportTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return null;
        
        return {
            name: themeName,
            ...theme
        };
    }

    // Import theme data
    importTheme(themeData) {
        if (!themeData || !themeData.name || !themeData.colors) {
            console.error('Invalid theme data');
            return false;
        }
        
        return this.createCustomTheme(themeData.name, themeData.colors);
    }

    // Get theme preview HTML
    getThemePreview(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return '';
        
        return `
            <div class="theme-preview" style="
                background: ${theme.colors.background};
                color: ${theme.colors.text};
                padding: 1rem;
                border-radius: 8px;
                border: 2px solid ${theme.colors.primary};
            ">
                <h3 style="color: ${theme.colors.primary};">${theme.name}</h3>
                <p>${theme.description}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <div style="
                        width: 20px;
                        height: 20px;
                        background: ${theme.colors.primary};
                        border-radius: 4px;
                    "></div>
                    <div style="
                        width: 20px;
                        height: 20px;
                        background: ${theme.colors.secondary};
                        border-radius: 4px;
                    "></div>
                </div>
            </div>
        `;
    }

    // Update theme selector options
    updateThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        if (!themeSelector) return;
        
        // Clear existing options
        themeSelector.innerHTML = '';
        
        // Add theme options
        Object.keys(this.themes).forEach(themeName => {
            const theme = this.themes[themeName];
            const option = document.createElement('option');
            option.value = themeName;
            option.textContent = theme.name;
            themeSelector.appendChild(option);
        });
        
        // Set current theme
        themeSelector.value = this.currentTheme;
    }

    // Apply theme to specific element
    applyThemeToElement(element, themeName) {
        const theme = this.themes[themeName];
        if (!theme || !element) return;
        
        element.style.setProperty('--accent-primary', theme.colors.primary);
        element.style.setProperty('--accent-secondary', theme.colors.secondary);
        element.style.setProperty('--bg-primary', theme.colors.background);
        element.style.setProperty('--text-primary', theme.colors.text);
    }

    // Reset to default theme
    resetToDefault() {
        this.setTheme('classic');
    }

    // Get theme statistics
    getThemeStats() {
        return {
            total: Object.keys(this.themes).length,
            builtIn: 4,
            custom: Object.keys(this.themes).length - 4,
            current: this.currentTheme
        };
    }
}

// Theme-specific utilities
class ThemeUtils {
    // Generate complementary color
    static getComplementaryColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const complementaryR = (255 - r).toString(16).padStart(2, '0');
        const complementaryG = (255 - g).toString(16).padStart(2, '0');
        const complementaryB = (255 - b).toString(16).padStart(2, '0');
        
        return `#${complementaryR}${complementaryG}${complementaryB}`;
    }

    // Generate analogous colors
    static getAnalogousColors(hexColor, count = 3) {
        const hsl = this.hexToHsl(hexColor);
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            const hue = (hsl.h + (i * 30)) % 360;
            const color = this.hslToHex(hue, hsl.s, hsl.l);
            colors.push(color);
        }
        
        return colors;
    }

    // Convert hex to HSL
    static hexToHsl(hex) {
        const hexColor = hex.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16) / 255;
        const g = parseInt(hexColor.substr(2, 2), 16) / 255;
        const b = parseInt(hexColor.substr(4, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // Convert HSL to hex
    static hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Check if color is light or dark
    static isLightColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }

    // Generate accessible text color
    static getAccessibleTextColor(backgroundColor) {
        return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
    }
}

// Export theme classes
window.ThemeManager = ThemeManager;
window.ThemeUtils = ThemeUtils;

// Initialize theme manager
const themeManager = new ThemeManager();
window.themeManager = themeManager; 