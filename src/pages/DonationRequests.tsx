import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { BsBuilding, BsGeoAlt, BsBook, BsHeart, BsSearch, BsFilter, BsPeople, BsBookmark } from 'react-icons/bs';
import { LoadingSpinner } from '../components';


interface DonationRequest {
  id: string;
  organizationName: string;
  organizationType: string;
  logo: string;
  city: string;
  state: string;
  description: string;
  categories: string[];
  quantity: string;
  beneficiaries: string;
  purpose: string;
  views: number;
  donations: number;
  createdAt: any;
  status?: string;
}


export default function DonationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string>('');


  useEffect(() => {
    fetchApprovedRequests();
  }, []);


  const fetchApprovedRequests = async () => {
    setLoading(true);
    setError('');
    console.log('🔍 Starting to fetch approved donation requests...');
    
    try {
      try {
        const q = query(
          collection(db, 'donationRequests'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        
        console.log('📡 Fetching with orderBy...');
        const snapshot = await getDocs(q);
        console.log('✅ Snapshot received:', snapshot.docs.length, 'documents');
        
        const requestsData = snapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() } as DonationRequest;
          console.log('📄 Document:', data.organizationName, 'Status:', data.status);
          return data;
        });
        
        setRequests(requestsData);
        console.log('✅ Total approved requests:', requestsData.length);
        
      } catch (indexError: any) {
        console.warn('⚠️ Index error, trying without orderBy:', indexError.message);
        
        const q = query(
          collection(db, 'donationRequests'),
          where('status', '==', 'approved')
        );
        
        const snapshot = await getDocs(q);
        console.log('✅ Fetched without orderBy:', snapshot.docs.length, 'documents');
        
        const requestsData = snapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() } as DonationRequest;
          console.log('📄 Document:', data.organizationName, 'Status:', data.status);
          return data;
        });
        
        requestsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setRequests(requestsData);
        console.log('✅ Total approved requests (manual sort):', requestsData.length);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching requests:', error);
      setError(`Failed to load donation requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const organizationTypes = [
    'all',
    'NGO',
    'School',
    'Library',
    'Orphanage',
    'Community Center',
    'Children Care',
    'Other'
  ];


  const bookCategories = [
    'all',
    'School Books (Class 1-10)',
    'Intermediate Books (11th-12th)',
    'Graduate Books',
    'Competitive Exam Books',
    'Children Story Books',
    'Novels & Fiction',
    'Educational Resources',
    'Reference Books',
  ];


  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || request.organizationType === selectedType;
    const matchesCategory = selectedCategory === 'all' || 
      request.categories.some(cat => cat === selectedCategory);

    return matchesSearch && matchesType && matchesCategory;
  });


  if (loading) {
    return <LoadingSpinner message="Loading donation requests..." fullScreen />;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Enhanced */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-teal-500 text-white overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl mb-6 shadow-xl">
              <BsHeart className="text-4xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Share Knowledge, <br />Change Lives
            </h1>
            <p className="text-xl text-green-50 max-w-2xl mx-auto">
              Connect with verified organizations seeking books to empower education
            </p>
          </div>

          {/* Stats - Enhanced */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <BsBuilding className="text-3xl mx-auto mb-3 opacity-90" />
              <p className="text-4xl font-bold mb-1">{requests.length}</p>
              <p className="text-sm text-green-100 font-medium">Organizations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <BsBook className="text-3xl mx-auto mb-3 opacity-90" />
              <p className="text-4xl font-bold mb-1">
                {requests.reduce((sum, r) => sum + (r.donations || 0), 0)}
              </p>
              <p className="text-sm text-green-100 font-medium">Books Donated</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <BsGeoAlt className="text-3xl mx-auto mb-3 opacity-90" />
              <p className="text-4xl font-bold mb-1">
                {new Set(requests.map(r => r.city)).size}
              </p>
              <p className="text-sm text-green-100 font-medium">Cities Reached</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 pb-24">
        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-8 shadow-sm">
            <p className="text-yellow-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Search and Filters - Enhanced */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-lg border border-gray-100">
          {/* Search Bar */}
          <div className="relative mb-6">
            <BsSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations, cities, or causes..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none transition-all text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <BsBuilding className="text-green-600" />
                Organization Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all font-medium"
              >
                {organizationTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? '📋 All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <BsBook className="text-green-600" />
                Book Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all font-medium"
              >
                {bookCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '📚 All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Info */}
          {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all') && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BsFilter className="text-lg" />
                <span className="font-semibold">
                  Showing {filteredRequests.length} of {requests.length} organizations
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Requests Grid - Enhanced Cards */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No organizations found</h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              {requests.length === 0 
                ? "No donation requests available at the moment. Check back soon!" 
                : "Try adjusting your filters to see more results."}
            </p>
            {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-xl font-bold text-lg transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/donation-request/${request.id}`)}
                className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-green-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Header with Logo */}
                <div className="relative h-40 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
                  {request.logo ? (
                    <img
                      src={request.logo}
                      alt={request.organizationName}
                      className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <BsBuilding className="text-4xl text-gray-400" />
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl text-xs font-bold text-gray-700 shadow-lg border border-gray-100">
                    {request.organizationType}
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1">
                    <span>✓</span> Verified
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Organization Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                    {request.organizationName}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-medium">
                    <BsGeoAlt className="text-green-600 flex-shrink-0" />
                    <span className="truncate">{request.city}, {request.state}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-5 line-clamp-3 min-h-[4rem]">
                    {request.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {request.categories.slice(0, 2).map((cat, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold border border-purple-100"
                      >
                        {cat.length > 18 ? cat.substring(0, 18) + '...' : cat}
                      </span>
                    ))}
                    {request.categories.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold">
                        +{request.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <BsBook className="text-blue-600" />
                        <p className="text-xs text-blue-900 font-semibold">Quantity Needed</p>
                      </div>
                      <p className="text-lg font-bold text-blue-700">{request.quantity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <BsPeople className="text-green-600" />
                        <p className="text-xs text-green-900 font-semibold">Beneficiaries</p>
                      </div>
                      <p className="text-lg font-bold text-green-700">{request.beneficiaries}</p>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl hover:shadow-2xl font-bold text-base transition-all group-hover:scale-[1.02] flex items-center justify-center gap-2">
                    <BsHeart className="text-lg" />
                    Donate Books
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section - Enhanced */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-12 text-white text-center shadow-2xl">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-6">
              <BsBookmark className="text-3xl" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Are you an organization in need of books?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join our platform and connect with generous donors ready to support your educational mission
            </p>
            <button
              onClick={() => navigate('/request-donation')}
              className="px-10 py-5 bg-white text-purple-600 rounded-2xl hover:bg-purple-50 font-bold text-lg transition-all shadow-2xl hover:shadow-xl hover:scale-105"
            >
              Submit Donation Request →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
