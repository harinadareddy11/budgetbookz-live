import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BsBell, BsCheckCircle, BsXCircle, BsArrowLeft, BsEnvelope, BsEnvelopeOpen } from 'react-icons/bs';
import { LoadingSpinner } from '../components';


interface Notification {
  id: string;
  userId: string;
  type: 'request_approved' | 'request_rejected' | 'donation_received';
  title: string;
  message: string;
  requestId?: string;
  requestName?: string;
  rejectionReason?: string;
  read: boolean;
  createdAt: any;
}


export default function Notifications() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');


  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [currentUser]);


  const fetchNotifications = async () => {
    if (!currentUser) return;


    setLoading(true);
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };


  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;


  const unreadCount = notifications.filter(n => !n.read).length;


  if (loading) {
    return <LoadingSpinner message="Loading notifications..." fullScreen />;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <BsArrowLeft />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BsBell className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>


            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-semibold text-sm transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>


      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>


        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BsBell className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "We'll notify you when there are updates about your requests."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  if (notification.requestId) {
                    navigate(`/donation-request/${notification.requestId}`);
                  }
                }}
                className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  notification.read
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-blue-200 bg-blue-50/30 hover:border-blue-300 shadow-md'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'request_approved'
                      ? 'bg-green-100'
                      : notification.type === 'request_rejected'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    {notification.type === 'request_approved' ? (
                      <BsCheckCircle className="text-2xl text-green-600" />
                    ) : notification.type === 'request_rejected' ? (
                      <BsXCircle className="text-2xl text-red-600" />
                    ) : (
                      <BsEnvelope className="text-2xl text-blue-600" />
                    )}
                  </div>


                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>


                    {notification.requestName && (
                      <div className="inline-block px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold mb-3">
                        {notification.requestName}
                      </div>
                    )}


                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {notification.createdAt?.toDate?.().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.requestId && (
                        <button className="text-blue-600 hover:text-blue-700 font-semibold">
                          View Request →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
