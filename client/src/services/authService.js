import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  deleteUser as fbDeleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function checkRedirectAuthResult() {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.warn('Error checking redirect auth result:', err);
    return null;
  }
}

export async function registerWithFirebase(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

export async function loginWithFirebase(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutFromFirebase() {
  await fbSignOut(auth);
}

export async function resetPasswordWithFirebase(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function updateFirebaseProfile({ displayName, photoURL }) {
  if (!auth.currentUser) throw new Error('No authenticated user found');
  const updates = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (photoURL !== undefined) updates.photoURL = photoURL;
  await updateProfile(auth.currentUser, updates);
  return auth.currentUser;
}

export async function sendFirebaseEmailVerification() {
  if (!auth.currentUser) throw new Error('No authenticated user found');
  await sendEmailVerification(auth.currentUser);
}

export async function deleteFirebaseUser() {
  if (!auth.currentUser) throw new Error('No authenticated user found');
  await fbDeleteUser(auth.currentUser);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
