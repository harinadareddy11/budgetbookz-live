import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsSend } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage, markMessagesAsRead } from '../services/chatService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, ChatRoom as ChatRoomType } from '../types';

export default function ChatRoom() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || !chatRoomId) {
      navigate('/login');
      return;
    }

    // Fetch chat room details
    const fetchChatRoom = async () => {
      const docRef = doc(db, 'chatRooms', chatRoomId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChatRoom({
          id: docSnap.id,
          ...docSnap.data(),
          lastMessageTime: docSnap.data().lastMessageTime?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate()
        } as ChatRoomType);
      }
      setLoading(false);
    };

    fetchChatRoom();

    // Subscribe to messages
    const unsubscribe = getChatMessages(chatRoomId, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    // Mark messages as read
    markMessagesAsRead(chatRoomId, currentUser.uid);

    return () => unsubscribe();
  }, [chatRoomId, currentUser, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !chatRoom) return;

    const receiverId = chatRoom.sellerId === currentUser.uid 
      ? chatRoom.buyerId 
      : chatRoom.sellerId;

    try {
      await sendMessage(
        chatRoomId!,
        currentUser.uid,
        userData?.name || currentUser.displayName || 'User',
        newMessage.trim(),
        receiverId
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chat not found</p>
      </div>
    );
  }

  const otherUserName = chatRoom.sellerId === currentUser?.uid 
    ? chatRoom.buyerName 
    : chatRoom.sellerName;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/chats')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <BsArrowLeft className="text-xl" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
          <p className="text-sm text-gray-600 truncate">{chatRoom.bookTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser?.uid;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'}`}>
                    {message.createdAt?.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BsSend className="text-xl" />
          </button>
        </div>
      </form>
    </div>
  );
}
