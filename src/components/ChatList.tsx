import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChatDots } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { getUserChatRooms } from '../services/chatService';
import { ChatRoom } from '../types';

export default function ChatList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const unsubscribe = getUserChatRooms(currentUser.uid, (rooms) => {
      setChatRooms(rooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {chatRooms.length === 0 ? (
        <div className="text-center py-12">
          <BsChatDots className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No messages yet</p>
          <p className="text-gray-400 text-sm mt-2">Start chatting with sellers to see messages here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chatRooms.map((room) => {
            const otherUserId = room.sellerId === currentUser?.uid ? room.buyerId : room.sellerId;
            const otherUserName = room.sellerId === currentUser?.uid ? room.buyerName : room.sellerName;
            const unreadCount = room.unreadCount?.[currentUser?.uid || ''] || 0;

            return (
              <div
                key={room.id}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Book Image */}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {room.bookImage ? (
                      <img src={room.bookImage} alt={room.bookTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{otherUserName}</h3>
                      <span className="text-xs text-gray-500">
                        {room.lastMessageTime?.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{room.bookTitle}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {room.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
