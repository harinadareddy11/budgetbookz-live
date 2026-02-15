import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Book, SellBookFormData, UserBookStats } from '../types';

// Upload book images to Firebase Storage
export const uploadBookImages = async (images: File[]): Promise<string[]> => {
  const uploadPromises = images.map(async (image) => {
    const storageRef = ref(storage, `books/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  });
  
  return Promise.all(uploadPromises);
};

// Calculate suggested price based on condition
export const calculateSuggestedPrice = (
  originalPrice: number, 
  condition: string
): number => {
  const multipliers = {
    'New': 0.85,
    'Like New': 0.70,
    'Good': 0.50,
    'Acceptable': 0.30
  };
  return Math.round(originalPrice * (multipliers[condition as keyof typeof multipliers] || 0.5));
};

// Create new book listing
export const createBook = async (
  formData: SellBookFormData,
  imageUrls: string[],
  userId: string,
  userName: string,
  userLocation: { lat: number; lng: number; city: string; state: string }
): Promise<string> => {
  const suggestedPrice = calculateSuggestedPrice(
    parseFloat(formData.originalPrice),
    formData.condition
  );

  const bookData = {
    sellerId: userId,
    sellerName: userName,
    sellerPhone: formData.contact,
    showPhoneNumber: formData.showPhoneNumber || false,
    title: formData.title,
    author: formData.author,
    genre: formData.genre,
    category: formData.category,
    syllabus: formData.syllabus,
    class: formData.class || '',
    subject: formData.subject || '',
    condition: formData.condition,
    originalPrice: parseFloat(formData.originalPrice),
    sellingPrice: parseFloat(formData.sellingPrice),
    suggestedPrice,
    description: formData.description,
    images: imageUrls,
    location: userLocation,
    status: 'available',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    views: 0
  };

  const docRef = await addDoc(collection(db, 'books'), bookData);
  return docRef.id;
};

// Get all books (with optional filters) - FIXED VERSION
export const getBooks = async (filters?: {
  category?: string;
  syllabus?: string;
  condition?: string;
  maxPrice?: number;
  class?: string;
}): Promise<Book[]> => {
  try {
    console.log('🔍 Fetching books with filters:', filters);
    
    // Simple query - just get all books sorted by date
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    console.log('📦 Raw docs fetched:', querySnapshot.size);
    
    let books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Book[];

    console.log('📚 All books before filtering:', books);

    // Filter in JavaScript
    books = books.filter(book => book.status === 'available');
    
    if (filters?.category) {
      books = books.filter(book => book.category === filters.category);
      console.log(`After category filter (${filters.category}):`, books.length);
    }
    
    if (filters?.syllabus) {
      books = books.filter(book => book.syllabus === filters.syllabus);
      console.log(`After syllabus filter (${filters.syllabus}):`, books.length);
    }

    if (filters?.condition) {
      books = books.filter(book => book.condition === filters.condition);
    }

    if (filters?.class) {
      books = books.filter(book => book.class === filters.class);
    }

    if (filters?.maxPrice) {
      books = books.filter(book => book.sellingPrice <= filters.maxPrice!);
    }

    console.log('✅ Final books to display:', books.length);
    return books;
  } catch (error) {
    console.error('❌ Error in getBooks:', error);
    return [];
  }
};

// Mark book as sold
export const markBookAsSold = async (bookId: string): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await updateDoc(docRef, {
    status: 'sold',
    updatedAt: Timestamp.now()
  });
};

// Mark book as available
export const markBookAsAvailable = async (bookId: string): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await updateDoc(docRef, {
    status: 'available',
    updatedAt: Timestamp.now()
  });
};

// Get user book statistics
export const getUserBookStats = async (userId: string): Promise<UserBookStats> => {
  const books = await getUserBooks(userId);
  
  return {
    totalBooks: books.length,
    availableBooks: books.filter(b => b.status === 'available').length,
    soldBooks: books.filter(b => b.status === 'sold').length,
    totalViews: books.reduce((sum, book) => sum + (book.views || 0), 0)
  };
};

// Get single book by ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      } as Book;
    }
    return null;
  } catch (error) {
    console.error('Error getting book:', error);
    return null;
  }
};

// Get user's listed books
export const getUserBooks = async (userId: string): Promise<Book[]> => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const allBooks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Book[];

    // Filter by userId in JavaScript
    return allBooks.filter(book => book.sellerId === userId);
  } catch (error) {
    console.error('Error getting user books:', error);
    return [];
  }
};

// Update book
export const updateBook = async (
  bookId: string,
  updates: Partial<Book>
): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Delete book
export const deleteBook = async (bookId: string): Promise<void> => {
  const docRef = doc(db, 'books', bookId);
  await deleteDoc(docRef);
};

// Increment book views
export const incrementBookViews = async (bookId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        views: (docSnap.data().views || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};
