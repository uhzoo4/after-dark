// ─────────────────────────────────────────────
// Firebase Configuration
// ADD TO .gitignore — never commit
// Fill in values from Firebase Console:
// console.firebase.google.com > Project Settings > Your apps
// ─────────────────────────────────────────────

// Firebase is loaded via CDN in taste.html only
// This file just holds the config object

const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG)
const db          = firebase.database(firebaseApp)
