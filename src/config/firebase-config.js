// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTzI0j_tjdyn6tKLRKiiJ73TI7f7978yU",
    authDomain: "tetranox.firebaseapp.com",
    databaseURL: "https://tetranox-default-rtdb.firebaseio.com",
    projectId: "tetranox",
    storageBucket: "tetranox.firebasestorage.app",
    messagingSenderId: "1009786172957",
    appId: "1:1009786172957:web:a076c513febd34e567f8f4",
    measurementId: "G-YNPZ7DSWNY"
};

// Initialize Firebase
async function initializeFirebase() {
    try {
        // Check if Firebase SDK is available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }
        
        // Initialize Firebase app
        const app = firebase.initializeApp(firebaseConfig);
        
        // Initialize services
        const database = firebase.database(app);
        const auth = firebase.auth(app);
        
        // Test database connection
        const testRef = database.ref('test');
        await testRef.set({ timestamp: Date.now() });
        await testRef.remove();
        
        // Export to window for global access
        window.FirebaseDB = database;
        window.FirebaseAuth = auth;
        
        return { app, database, auth };
        
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        
        // Create mock Firebase objects for local-only mode
        window.FirebaseDB = createMockDatabase();
        window.FirebaseAuth = createMockAuth();
        
        return { app: null, database: window.FirebaseDB, auth: window.FirebaseAuth };
    }
}

// Mock Firebase Database for local-only mode
function createMockDatabase() {
    return {
        ref: (path) => ({
            set: async (data) => Promise.resolve(),
            push: async (data) => Promise.resolve({ key: 'mock-key' }),
            remove: async () => Promise.resolve(),
            once: async (event) => Promise.resolve({ val: () => null, exists: () => false }),
            on: (event, callback) => {},
            off: (event) => {},
            child: (path) => this,
            orderByChild: (path) => this,
            limitToLast: (limit) => this
        })
    };
}

// Mock Firebase Auth for local-only mode
function createMockAuth() {
    return {
        signInAnonymously: async () => Promise.resolve({ user: { uid: 'mock-user-id' } }),
        onAuthStateChanged: (callback) => callback({ uid: 'mock-user-id' })
    };
}

// Export initialization function
window.initializeFirebase = initializeFirebase; 