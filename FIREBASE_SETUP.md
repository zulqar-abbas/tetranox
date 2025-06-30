# Firebase Setup Guide for Tetris Game

This guide will help you set up Firebase for the Tetris game's multiplayer and leaderboard features.

## Prerequisites

1. A Google account
2. Basic knowledge of web development

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "tetris-game")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Realtime Database

1. In your Firebase project console, click on "Realtime Database" in the left sidebar
2. Click "Create database"
3. Choose a location for your database (select the closest to your users)
4. Start in test mode (you can secure it later)
5. Click "Done"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "tetris-web")
6. Copy the configuration object

## Step 4: Update Firebase Configuration

1. Open `src/config/firebase-config.js` in your project
2. Replace the existing configuration with your own:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};
```

**Important**: Make sure to include the `databaseURL` field with your Realtime Database URL.

## Step 5: Set Up Database Rules (Optional but Recommended)

1. In your Firebase console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the default rules with these more secure rules:

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
    "chat": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Click "Publish"

## Step 6: Test Your Setup

1. Start your local server: `python3 -m http.server 8000`
2. Open your browser and go to `http://localhost:8000`
3. Open the browser's developer console (F12)
4. Look for these messages:
   - "Firebase initialized successfully"
   - "Firebase Realtime Database connected successfully"

## Troubleshooting

### Common Issues:

1. **"Firebase not available" error**
   - Make sure you've included the Firebase SDK in your HTML
   - Check that the Firebase configuration is correct

2. **"Database URL not configured" error**
   - Ensure you've added the `databaseURL` field to your configuration
   - The URL should look like: `https://your-project-default-rtdb.firebaseio.com`

3. **"Permission denied" error**
   - Check your database rules in the Firebase console
   - Make sure they allow read/write access

4. **"Network error"**
   - Check your internet connection
   - Ensure your Firebase project is in the correct region

### Local-Only Mode

If you can't set up Firebase right now, the game will run in local-only mode:
- Single-player features will work normally
- Multiplayer features will be disabled
- Leaderboards will only show local scores
- You'll see warnings in the console about Firebase not being available

## Security Considerations

For production use, consider implementing proper authentication and more restrictive database rules:

1. **Enable Authentication**: Add user sign-in to your app
2. **Restrict Database Access**: Only allow authenticated users to write data
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Validation**: Validate data on the server side

## Next Steps

Once Firebase is set up:

1. **Deploy to Firebase Hosting** (optional):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

2. **Enable Analytics** (optional):
   - Go to your Firebase console
   - Enable Google Analytics for better insights

3. **Monitor Usage**:
   - Check the Firebase console regularly
   - Monitor database usage and costs

## Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Look at the browser console for error messages
3. Verify your configuration matches the Firebase console
4. Ensure your database rules allow the necessary operations

## Configuration Example

Here's a complete example of what your `firebase-config.js` should look like:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC-example-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-EXAMPLE123",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};

// Initialize Firebase with error handling
try {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const auth = firebase.auth();
    
    // Test connection
    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('Firebase Realtime Database connected successfully');
        } else {
            console.warn('Firebase Realtime Database connection failed');
        }
    });
    
    window.FirebaseDB = database;
    window.FirebaseAuth = auth;
    
} catch (error) {
    console.error('Firebase initialization failed:', error);
    // Fallback to local-only mode
}
```

Replace all the placeholder values with your actual Firebase project configuration. 