import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsArrowRepeat, BsHeart, BsUpload, BsJournal, BsAward, BsTrophy, BsBookHalf, BsCardText, BsStars, BsBuilding, BsArrowRight, BsCheckCircle, BsBell } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';


export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time listener for unread notifications
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [currentUser]);


  const menuItems = [
    {
      id: 'buy',
      title: 'Buy Books',
      icon: BsBook,
      description: 'Browse and purchase books',
      color: 'bg-blue-500',
      path: '/categories'
    },
    {
      id: 'sell',
      title: 'Sell Books',
      icon: BsUpload,
      description: 'List your books for sale',
      color: 'bg-green-500',
      path: '/sell'
    },
    {
      id: 'exchange',
      title: 'Exchange Books',
      icon: BsArrowRepeat,
      description: 'Swap books with others',
      color: 'bg-orange-500',
      path: '/exchange'
    },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm p-6 mb-6 max-w-6xl mx-auto mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userData?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {userData?.name || currentUser?.displayName || 'User'}!
              </h2>
              <p className="text-gray-600">What would you like to do today?</p>
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <BsBell className="text-2xl text-gray-600 group-hover:text-orange-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>


      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Notification Banner (if there are unread notifications) */}
        {unreadCount > 0 && (
          <div 
            onClick={() => navigate('/notifications')}
            className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <BsBell className="text-xl" />
                </div>
                <div>
                  <p className="font-bold">You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''}</p>
                  <p className="text-sm text-blue-100">Click to view updates</p>
                </div>
              </div>
              <BsArrowRight className="text-2xl" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.color} p-3 rounded-lg shadow-sm`}>
                    <item.icon className="text-2xl text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>


        {/* Book Donations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📚 Book Donations</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              NEW
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donate Books Card */}
            <button
              onClick={() => navigate('/donation-requests')}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BsHeart className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Donate Books</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Help schools, NGOs, and libraries by donating your books
                  </p>
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                    <span>Browse Organizations</span>
                    <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>


            {/* Request Donation Card (For Organizations) */}
            <button
              onClick={() => navigate('/request-donation')}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BsBuilding className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Request Donation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Are you an organization? Request books for your cause
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                    <span>Submit Request</span>
                    <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          </div>


          {/* Info Banner */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <BsCheckCircle className="text-xl text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-green-900">All organizations are verified.</span>
              <span className="ml-1">Our admin team ensures every donation request is legitimate.</span>
            </div>
          </div>
        </div>


        {/* Browse Books */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Books</h3>
          
          {/* Academic Books */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Academic Books</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* School */}
              <button
                onClick={() => navigate('/categories/school/syllabus')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BsBook className="text-xl text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">School</h3>
                    <p className="text-xs text-gray-500">Class 1-10</p>
                  </div>
                </div>
              </button>


              {/* Intermediate */}
              <button
                onClick={() => navigate('/categories/intermediate/syllabus')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BsJournal className="text-xl text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">Intermediate</h3>
                    <p className="text-xs text-gray-500">11th & 12th</p>
                  </div>
                </div>
              </button>


              {/* Graduate */}
              <button
                onClick={() => navigate('/categories/graduate/syllabus')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BsAward className="text-xl text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">Graduate</h3>
                    <p className="text-xs text-gray-500">College</p>
                  </div>
                </div>
              </button>


              {/* Competitive */}
              <button
                onClick={() => navigate('/all-books?category=competitive')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <BsTrophy className="text-xl text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">Competitive</h3>
                    <p className="text-xs text-gray-500">JEE, NEET</p>
                  </div>
                </div>
              </button>
            </div>
          </div>


          {/* Story Books */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Story Books</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/all-books?category=novel')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BsBookHalf className="text-xl text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Novels</h3>
                </div>
              </button>


              <button
                onClick={() => navigate('/all-books?category=comics')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BsCardText className="text-xl text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Comics</h3>
                </div>
              </button>


              <button
                onClick={() => navigate('/all-books?category=fiction')}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BsStars className="text-xl text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Fiction</h3>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
