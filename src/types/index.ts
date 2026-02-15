// User Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  photoURL?: string; 
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  createdAt: Date;
  booksListed: number;
  booksExchanged: number;
  rating: number;
}

// Book Types
export interface Book {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  showPhoneNumber: boolean; 
  title: string;
  author: string;
  genre?: string; // Optional - for story books
   category:
    | 'school'
    | 'intermediate'
    | 'graduate'
    | 'competitive'
    | 'novel'
    | 'comics'
    | 'fiction'
    | 'business'
    | 'self-help'
    | 'non-fiction'
    | 'other';
  syllabus?: 'cbse' | 'state' | 'icse' | 'other'; // Optional - only for academic books
  class?: string; // Optional - only for academic books
  subject?: string; // Optional - only for academic books
  condition: 'New' | 'Like New' | 'Good' | 'Acceptable';
  originalPrice: number;
  sellingPrice: number;
  suggestedPrice: number;
  description: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  status: 'available' | 'sold' | 'exchanged' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

// Exchange Types
export interface Exchange {
  id: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  requestedBookId: string;
  offeredBookId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  bookTitle: string;
  author?: string;
  class?: string;
  subject?: string;
  maxPrice?: number;
  condition?: string[];
  createdAt: Date;
  notified: boolean;
}

// Form Data Types
export interface SellBookFormData {
  title: string;
  author: string;
  genre?: string; // Optional - for story books
  category: string;
  syllabus?: string; // Optional - only for academic books
  class?: string; // Optional - only for academic books
  subject?: string; // Optional - only for academic books
  condition: string;
  originalPrice: string;
  sellingPrice: string;
  description: string;
  contact: string;
  city: string;
  state: string;
  pincode?: string;
  showPhoneNumber: boolean;
}

// Chat/Message Types
export interface ChatRoom {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

// User Book Stats
export interface UserBookStats {
  totalBooks: number;
  availableBooks: number;
  soldBooks: number;
  totalViews: number;
}

// Favorites (for compatibility)
export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
}
