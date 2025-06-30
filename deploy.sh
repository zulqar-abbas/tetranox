#!/bin/bash

# Tetris Game Deployment Script
echo "🎮 Deploying Tetris Game to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run:"
    echo "firebase init hosting"
    exit 1
fi

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo "❌ .firebaserc not found. Please configure your Firebase project."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your game should be live at: https://$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4).web.app"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 