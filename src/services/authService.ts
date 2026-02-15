import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

// Sign up with email
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  location: { lat: number; lng: number; city: string; state: string }
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });

  const userData: User = {
    id: userCredential.user.uid,
    email,
    name,
    location,
    createdAt: new Date(),
    booksListed: 0,
    booksExchanged: 0,
    rating: 0
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userData);
  return userData;
};

// Sign in with email
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};
export const createUserData = async (userData: User): Promise<void> => {
  await setDoc(doc(db, 'users', userData.id), userData);
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
