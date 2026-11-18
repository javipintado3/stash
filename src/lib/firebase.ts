import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// The app shows a setup message instead of crashing when the Firebase variables are missing
export const isFirebaseConfigured = Object.values(config).every((value) => Boolean(value))

function createFirebase() {
  const app = initializeApp(config)
  return {
    auth: getAuth(app),
    // The local cache keeps the app usable offline and syncs the pending writes when the connection returns
    db: initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      // Some networks, proxies and extensions block the streaming connection: fall back to long polling when it fails
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    }),
  }
}

export const firebase = isFirebaseConfigured ? createFirebase() : null

// Only call this after checking `isFirebaseConfigured`
export function requireFirebase() {
  if (!firebase) throw new Error('Firebase is not configured')
  return firebase
}
