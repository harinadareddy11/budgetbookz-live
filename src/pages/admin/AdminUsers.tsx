import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsPerson, BsPhone, BsEnvelope, BsCalendar, BsGeoAlt, BsBook, BsArrowRepeat } from 'react-icons/bs';
import { LoadingSpinner } from '../../components';

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  location?: {
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  booksListed?: number;
  booksExchanged?: number;
  createdAt?: any;
  rating?: number;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      usersData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search) ||
      user.phoneNumber?.includes(search) ||
      user.location?.city?.toLowerCase().includes(search) ||
      user.location?.state?.toLowerCase().includes(search)
    );
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationString = (location: any) => {
    if (!location) return 'Unknown';
    const parts = [];
    if (location.city && location.city !== 'Unknown') parts.push(location.city);
    if (location.state && location.state !== 'Unknown') parts.push(location.state);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <BsArrowLeft />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-600 mt-1">Manage registered users</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 mb-1">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {users.filter(u => u.email).length}
            </p>
            <p className="text-sm text-gray-600">Email Users</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-3xl font-bold text-green-600 mb-1">
              {users.reduce((sum, u) => sum + (u.booksListed || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Books Listed</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-3xl font-bold text-purple-600 mb-1">
              {users.reduce((sum, u) => sum + (u.booksExchanged || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Books Exchanged</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BsPerson className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try a different search term' : 'No users have registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {user.name || 'Unnamed User'}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {user.id.substring(0, 12)}...</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BsEnvelope className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}

                  {(user.phone || user.phoneNumber) && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BsPhone className="text-gray-400 flex-shrink-0" />
                      <span>{user.phone || user.phoneNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <BsGeoAlt className="text-gray-400 flex-shrink-0" />
                    <span>{getLocationString(user.location)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <BsCalendar className="text-gray-400 flex-shrink-0" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-sm">
                      <BsBook className="text-blue-500" />
                      <span className="font-semibold text-gray-900">{user.booksListed || 0}</span>
                      <span className="text-gray-500">Listed</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <BsArrowRepeat className="text-green-500" />
                      <span className="font-semibold text-gray-900">{user.booksExchanged || 0}</span>
                      <span className="text-gray-500">Exchanged</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm && filteredUsers.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
