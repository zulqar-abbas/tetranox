# Tetris Game

A modern, feature-rich Tetris game built with vanilla JavaScript, featuring classic gameplay mechanics, modern UI, multiplayer support, and Firebase integration.

## Features

- **Classic Tetris Gameplay**: All standard Tetris mechanics including piece rotation, line clearing, and scoring
- **Modern UI**: Glassmorphism design with smooth animations and responsive layout
- **Multiple Themes**: Classic, neon, retro, and dark themes with customizable colors
- **Power-ups**: Special abilities like slow time, bomb pieces, and freeze lines
- **Achievement System**: Unlock achievements for various gameplay milestones
- **Sound Effects**: Immersive audio with customizable volume
- **Local & Global Leaderboards**: Track your scores locally and compete globally
- **Multiplayer Support**: Real-time multiplayer games with Firebase
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch Controls**: Optimized touch controls for mobile devices
- **Auto-save**: Automatic game state saving and recovery

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase Realtime Database, Firebase Authentication
- **Deployment**: Firebase Hosting
- **Audio**: Web Audio API
- **Graphics**: HTML5 Canvas

## Getting Started

### Prerequisites

- Node.js (for Firebase CLI)
- Firebase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tetris-game
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**
   ```bash
   firebase login
   ```

4. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Realtime Database
   - Set up Authentication (Anonymous auth)
   - Update `src/config/firebase-config.js` with your Firebase credentials

5. **Update Firebase Configuration**
   ```javascript
   // In src/config/firebase-config.js
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       databaseURL: "https://your-project-default-rtdb.firebaseio.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

6. **Update Firebase Project ID**
   ```json
   // In .firebaserc
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

### Local Development

1. **Serve locally**
   ```bash
   # Using Python (if available)
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

2. **Open in browser**
   ```
   http://localhost:8000
   ```

### Deployment to Firebase

1. **Initialize Firebase project**
   ```bash
   firebase init hosting
   ```

2. **Build for production** (if needed)
   ```bash
   # The project is already production-ready
   # No build step required
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

4. **Your game will be live at**
   ```
   https://your-project-id.web.app
   ```

## Firebase Setup

### Database Rules

Set up your Firebase Realtime Database rules:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true
    },
    "rooms": {
      ".read": true,
      ".write": true
    },
    "test": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Authentication

Enable Anonymous Authentication in Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable Anonymous authentication

## Game Controls

### Keyboard Controls
- **Arrow Keys / WASD**: Move pieces
- **Space**: Hard drop
- **C / Shift**: Hold piece
- **R**: Restart game
- **Escape**: Pause/Resume
- **1, 2, 3**: Activate power-ups

### Touch Controls (Mobile)
- **Tap**: Rotate piece
- **Swipe Left/Right**: Move piece
- **Swipe Down**: Hard drop
- **Long Press**: Hold piece

## Project Structure

```
tetris-game/
├── index.html                 # Main HTML file
├── src/
│   ├── app.js                 # Main application entry point
│   ├── config/
│   │   └── firebase-config.js # Firebase configuration
│   ├── game/
│   │   ├── game-engine.js     # Core game logic
│   │   ├── board.js           # Game board management
│   │   ├── tetromino.js       # Tetromino pieces
│   │   └── constants.js       # Game constants
│   ├── ui/
│   │   ├── screen-manager.js  # Screen navigation
│   │   ├── leaderboard.js     # Leaderboard management
│   │   ├── themes.js          # Theme management
│   │   ├── animations.js      # Animation system
│   │   ├── sound.js           # Audio management
│   │   ├── achievements.js    # Achievement system
│   │   ├── storage.js         # Local storage
│   │   └── room-manager.js    # Multiplayer rooms
│   └── assets/
│       ├── sounds/            # Audio files
│       └── images/            # Image assets
├── styles/
│   ├── main.css               # Main stylesheet
│   ├── themes.css             # Theme styles
│   └── responsive.css         # Responsive design
├── firebase.json              # Firebase hosting config
├── .firebaserc               # Firebase project config
└── README.md                 # This file
```

## Customization

### Adding New Themes

1. Add theme definition in `src/ui/themes.js`
2. Add corresponding CSS in `styles/themes.css`
3. Update theme selector in HTML

### Adding New Power-ups

1. Define power-up in `src/game/constants.js`
2. Implement logic in `src/game/game-engine.js`
3. Add UI elements in HTML
4. Update CSS styling

### Adding New Achievements

1. Define achievement in `src/ui/achievements.js`
2. Add trigger logic in appropriate game events
3. Add achievement UI elements

## Performance Optimization

The game includes several performance optimizations:

- **Canvas Optimization**: Efficient rendering with proper buffer management
- **Animation Throttling**: Reduced motion support and performance mode
- **Asset Preloading**: Critical assets loaded upfront
- **Memory Management**: Proper cleanup of event listeners and timers
- **Responsive Design**: Optimized for different screen sizes

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the Firebase documentation for backend issues
- Review browser console for debugging information

## Changelog

### Version 1.0.0
- Initial release
- Classic Tetris gameplay
- Modern UI with glassmorphism design
- Firebase integration for multiplayer and leaderboards
- Multiple themes and customization options
- Achievement system
- Responsive design for all devices 