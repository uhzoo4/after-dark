// ─────────────────────────────────────────────
// Spotify Developer App Credentials
// Get these from: https://developer.spotify.com/dashboard
// ADD THIS FILE TO .gitignore — never commit secrets
// ─────────────────────────────────────────────

const SPOTIFY_CONFIG = {
  clientId: '137d2af1cab84e97baab285f51486410',
  redirectUri: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5500/taste.html'
    : 'https://after-dark-henna.vercel.app/taste.html',
  scopes: [
    'user-top-read',
    'user-read-recently-played',
    'user-read-private',
    'playlist-read-private'
  ].join(' ')
}

// ─────────────────────────────────────────────
// Firebase Config
// Get these from: https://console.firebase.google.com
// Project settings > Your apps > Firebase SDK snippet
// ─────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyBMIAZK7kxXEN7g6TOxl8tHHbZWamQ-SPg',
  authDomain:        'after-dark-830b3.firebaseapp.com',
  databaseURL:       'https://after-dark-830b3-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:         'after-dark-830b3',
  storageBucket:     'after-dark-830b3.firebasestorage.app',
  messagingSenderId: '741635027035',
  appId:             '1:741635027035:web:b04d407efe4bcebb3a8f7e'
}
