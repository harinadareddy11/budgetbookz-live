import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';
import { getUserData } from '../services/authService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create or get user data from Firestore
      const existingUserData = await getUserData(user.uid);
      
      if (!existingUserData) {
        // Create new user in Firestore (you'll need to get location)
        const newUserData: User = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          location: {
            lat: 0,
            lng: 0,
            city: 'Unknown',
            state: 'Unknown'
          },
          createdAt: new Date(),
          booksListed: 0,
          booksExchanged: 0,
          rating: 0
        };
        
        // Save to Firestore using authService
        // You'll implement this in authService.ts
        setUserData(newUserData);
      } else {
        setUserData(existingUserData);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
