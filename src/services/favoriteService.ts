import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
}

// Add book to favorites
export const addToFavorites = async (
  userId: string,
  bookId: string
): Promise<void> => {
  try {
    // Check if already favorited
    const q = query(collection(db, 'favorites'));
    const snapshot = await getDocs(q);
    
    const exists = snapshot.docs.some(doc => {
      const data = doc.data();
      return data.userId === userId && data.bookId === bookId;
    });
    
    if (exists) {
      console.log('Already in favorites');
      return;
    }
    
    await addDoc(collection(db, 'favorites'), {
      userId,
      bookId,
      createdAt: Timestamp.now()
    });
    
    console.log('✅ Added to favorites');
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove from favorites
export const removeFromFavorites = async (
  userId: string,
  bookId: string
): Promise<void> => {
  try {
    const q = query(collection(db, 'favorites'));
    const snapshot = await getDocs(q);
    
    const favoriteDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.userId === userId && data.bookId === bookId;
    });
    
    if (favoriteDoc) {
      await deleteDoc(doc(db, 'favorites', favoriteDoc.id));
      console.log('✅ Removed from favorites');
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Check if book is favorited
export const isFavorited = async (
  userId: string,
  bookId: string
): Promise<boolean> => {
  try {
    const q = query(collection(db, 'favorites'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.some(doc => {
      const data = doc.data();
      return data.userId === userId && data.bookId === bookId;
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Get user's favorite book IDs
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'favorites'));
    const snapshot = await getDocs(q);
    
    const favorites = snapshot.docs
      .filter(doc => doc.data().userId === userId)
      .map(doc => doc.data().bookId);
    
    console.log('📋 User favorites:', favorites);
    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};
