import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth'
import { useSyncExternalStore } from 'react'
import { connectStore } from '../store/useAppStore.ts'
import { deleteAllUserData } from './cloud.ts'
import { firebase, requireFirebase } from './firebase.ts'

type AuthState = { status: 'loading' | 'signedOut' | 'signedIn'; user: User | null }

// The session lives outside React so the components can read it without `useEffect`
let state: AuthState = { status: firebase ? 'loading' : 'signedOut', user: null }
const listeners = new Set<() => void>()

if (firebase) {
  onAuthStateChanged(firebase.auth, (user) => {
    state = user ? { status: 'signedIn', user } : { status: 'signedOut', user: null }
    connectStore(user?.uid ?? null)
    listeners.forEach((listener) => listener())
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state)
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(requireFirebase().auth, email, password)
}

export async function signUp(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(requireFirebase().auth, email, password)
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(requireFirebase().auth, email)
}

// Firebase asks for a recent sign in before changing the password, so the current one is checked first
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = requireFirebase().auth.currentUser
  if (!user?.email) throw new Error('No signed in user')
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
  await updatePassword(user, newPassword)
}

// Checks the password first, then removes the data (the rules need the session) and finally the account itself
export async function deleteAccount(password: string): Promise<void> {
  const user = requireFirebase().auth.currentUser
  if (!user?.email) throw new Error('No signed in user')
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
  await deleteAllUserData(user.uid)
  await deleteUser(user)
}

export function signOutUser(): Promise<void> {
  return signOut(requireFirebase().auth)
}

// Turns a Firebase error into a message the user can understand
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.'
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
    case 'auth/network-request-failed':
      return 'Sin conexión. Comprueba tu internet.'
    case 'auth/operation-not-allowed':
      return 'Esta acción no está permitida en este momento.'
    default:
      return 'Algo ha salido mal. Inténtalo de nuevo.'
  }
}
