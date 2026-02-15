import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChatRoom, Message } from '../types';

// Create or get existing chat room
export const createChatRoom = async (
  bookId: string,
  bookTitle: string,
  bookImage: string,
  sellerId: string,
  sellerName: string,
  buyerId: string,
  buyerName: string
): Promise<string> => {
  try {
    // Check if chat room already exists
    const q = query(collection(db, 'chatRooms'));
    const snapshot = await getDocs(q);
    
    // Filter in JavaScript
    const existingRoom = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.bookId === bookId && data.buyerId === buyerId;
    });
    
    if (existingRoom) {
      return existingRoom.id;
    }
    
    // Create new chat room
    const chatRoomData = {
      bookId,
      bookTitle,
      bookImage,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      lastMessage: '',
      lastMessageTime: Timestamp.now(),
      unreadCount: {
        [sellerId]: 0,
        [buyerId]: 0
      },
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'chatRooms'), chatRoomData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Get user's chat rooms (NO INDEX NEEDED)
export const getUserChatRooms = (
  userId: string,
  callback: (chatRooms: ChatRoom[]) => void
) => {
  const q = query(
    collection(db, 'chatRooms'),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const allRooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    })) as ChatRoom[];
    
    // Filter in JavaScript
    const userRooms = allRooms.filter(
      room => room.sellerId === userId || room.buyerId === userId
    );
    
    callback(userRooms);
  }, (error) => {
    console.error('Error getting chat rooms:', error);
    callback([]);
  });
};

// Send message
export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  senderName: string,
  text: string,
  receiverId: string
): Promise<void> => {
  try {
    const messageData = {
      chatRoomId,
      senderId,
      senderName,
      text,
      createdAt: Timestamp.now(),
      read: false
    };
    
    await addDoc(collection(db, 'messages'), messageData);
    
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const chatRoomSnap = await getDoc(chatRoomRef);
    
    if (chatRoomSnap.exists()) {
      const currentUnread = chatRoomSnap.data().unreadCount || {};
      
      await updateDoc(chatRoomRef, {
        lastMessage: text,
        lastMessageTime: Timestamp.now(),
        unreadCount: {
          ...currentUnread,
          [receiverId]: (currentUnread[receiverId] || 0) + 1
        }
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a chat room (NO INDEX NEEDED)
export const getChatMessages = (
  chatRoomId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const allMessages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Message[];
    
    // Filter by chatRoomId in JavaScript
    const roomMessages = allMessages.filter(
      msg => msg.chatRoomId === chatRoomId
    );
    
    callback(roomMessages);
  }, (error) => {
    console.error('Error getting messages:', error);
    callback([]);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatRoomId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const chatRoomSnap = await getDoc(chatRoomRef);
    
    if (chatRoomSnap.exists()) {
      const currentUnread = chatRoomSnap.data().unreadCount || {};
      
      await updateDoc(chatRoomRef, {
        unreadCount: {
          ...currentUnread,
          [userId]: 0
        }
      });
    }
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};
