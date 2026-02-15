import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { 
  BsClipboardCheck, 
  BsBook, 
  BsPeople, 
  BsGift,
  BsArrowRepeat,
  BsBoxArrowRight,
  BsChevronRight,
  BsShieldCheck
} from 'react-icons/bs';
import { LoadingSpinner } from '../../components';

const ADMIN_EMAILS = ['admin@budgetbookz.com', 'harinadareddy11.1@gmail.com'];

interface Stats {
  pendingRequests: number;
  approvedRequests: number;
  totalBooks: number;
  totalUsers: number;
  totalDonations: number;
  totalExchanges: number;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    pendingRequests: 0,
    approvedRequests: 0,
    totalBooks: 0,
    totalUsers: 0,
    totalDonations: 0,
    totalExchanges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    
    if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
      alert('Access denied.');
      navigate('/');
      return;
    }

    fetchStats();
  }, [currentUser, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch donation requests
      const requestsSnap = await getDocs(collection(db, 'donationRequests'));
      const pendingRequests = requestsSnap.docs.filter(doc => doc.data().status === 'pending').length;
      const approvedRequests = requestsSnap.docs.filter(doc => doc.data().status === 'approved').length;

      // Fetch books
      const booksSnap = await getDocs(collection(db, 'books'));
      const totalBooks = booksSnap.size;

      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;

      // Fetch donations
      const donationsSnap = await getDocs(collection(db, 'donations'));
      const totalDonations = donationsSnap.size;

      // Fetch exchanges
      const exchangesSnap = await getDocs(collection(db, 'exchangeBooks'));
      const totalExchanges = exchangesSnap.size;

      setStats({
        pendingRequests,
        approvedRequests,
        totalBooks,
        totalUsers,
        totalDonations,
        totalExchanges,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." fullScreen />;
  }

  const menuItems = [
    {
      title: 'Donation Requests',
      description: 'Review and verify organizations',
      icon: BsClipboardCheck,
      color: 'from-blue-500 to-blue-600',
      route: '/admin/donation-requests',
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : null,
      badgeColor: 'bg-red-500'
    },
    {
      title: 'All Books',
      description: 'View all listed books',
      icon: BsBook,
      color: 'from-green-500 to-green-600',
      route: '/admin/books',
      stat: stats.totalBooks
    },
    {
      title: 'Users',
      description: 'View all registered users',
      icon: BsPeople,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/users',
      stat: stats.totalUsers
    },
    {
      title: 'Donations',
      description: 'View all donations',
      icon: BsGift,
      color: 'from-orange-500 to-orange-600',
      route: '/admin/donations',
      stat: stats.totalDonations
    },
    {
      title: 'Exchange Books',
      description: 'View exchange listings',
      icon: BsArrowRepeat,
      color: 'from-pink-500 to-pink-600',
      route: '/admin/exchanges',
      stat: stats.totalExchanges
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BsShieldCheck className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-red-100">Welcome, {currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <BsBoxArrowRight />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.pendingRequests}</p>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.approvedRequests}</p>
            <p className="text-sm text-gray-600">Approved Requests</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-blue-600 mb-1">{stats.totalBooks}</p>
            <p className="text-sm text-gray-600">Total Books</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-purple-600 mb-1">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-orange-600 mb-1">{stats.totalDonations}</p>
            <p className="text-sm text-gray-600">Total Donations</p>
          </div>
        </div>

        {/* Management Menu */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Management</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => navigate(item.route)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                        {item.badge && (
                          <span className={`${item.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      {item.stat !== undefined && (
                        <p className="text-sm font-semibold text-gray-700">Total: {item.stat}</p>
                      )}
                    </div>
                    <BsChevronRight className="text-xl text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="text-blue-100 mb-4">
            Access documentation or contact support for admin panel assistance.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
          >
            View Main Site
          </button>
        </div>
      </div>
    </div>
  );
}
