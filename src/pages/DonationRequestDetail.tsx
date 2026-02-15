import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  BsBuilding, 
  BsGeoAlt, 
  BsEnvelope, 
  BsTelephone, 
  BsGlobe, 
  BsPeople, 
  BsBook,
  BsHeart,
  BsArrowLeft,
  BsCheckCircle
} from 'react-icons/bs';
import { LoadingSpinner } from '../components';

interface DonationRequest {
  id: string;
  organizationName: string;
  organizationType: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  description: string;
  booksNeeded: string;
  categories: string[];
  quantity: string;
  purpose: string;
  beneficiaries: string;
  logo: string;
  status: string;
  views: number;
  donations: number;
  createdAt: any;
}

export default function DonationRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<DonationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewIncremented, setViewIncremented] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const fetchRequest = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'donationRequests', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as DonationRequest;
        
        // Only show approved requests
        if (data.status !== 'approved') {
          navigate('/donation-requests');
          return;
        }

        setRequest(data);

        // Increment view count (only once per session)
        if (!viewIncremented) {
          await updateDoc(docRef, {
            views: increment(1)
          });
          setViewIncremented(true);
        }
      } else {
        navigate('/donation-requests');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading organization details..." fullScreen />;
  }

  if (!request) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/donation-requests')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <BsArrowLeft className="text-xl" />
            <span className="font-semibold">Back to All Requests</span>
          </button>

          <div className="flex items-start gap-6">
            {/* Logo */}
            {request.logo ? (
              <img
                src={request.logo}
                alt={request.organizationName}
                className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                <BsBuilding className="text-4xl text-white" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold mb-3">
                {request.organizationType}
              </span>
              <h1 className="text-4xl font-bold mb-2">{request.organizationName}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <BsGeoAlt />
                  {request.city}, {request.state}
                </span>
                <span className="flex items-center gap-2">
                  <BsHeart />
                  {request.donations || 0} donations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Organization</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{request.description}</p>
            </div>

            {/* Purpose */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How Books Will Be Used</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{request.purpose}</p>
            </div>

            {/* Book Requirements */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Requirements</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Categories Needed:</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {request.booksNeeded && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Specific Books Needed:</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                      {request.booksNeeded}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Quantity Needed</p>
                    <p className="text-xl font-bold text-blue-600">{request.quantity}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Beneficiaries</p>
                    <p className="text-xl font-bold text-green-600">{request.beneficiaries}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <BsCheckCircle className="text-3xl text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-900 mb-2">Verified Organization</h3>
                  <p className="text-sm text-green-700">
                    This organization has been verified by our admin team. Registration number: {request.registrationNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Button */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Help?</h3>
              <button
                onClick={() => navigate(`/donate/${request.id}`)}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <BsHeart />
                Donate Books
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Your donation will directly help {request.beneficiaries}
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${request.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BsEnvelope className="text-xl text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{request.email}</p>
                  </div>
                </a>

                <a
                  href={`tel:${request.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BsTelephone className="text-xl text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{request.phone}</p>
                  </div>
                </a>

                {request.website && (
                  <a
                    href={request.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <BsGlobe className="text-xl text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Website</p>
                      <p className="text-sm font-medium text-blue-600 truncate hover:underline">
                        Visit Website
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Address</h3>
              <div className="flex items-start gap-3">
                <BsGeoAlt className="text-xl text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {request.address}<br />
                    {request.city}, {request.state}<br />
                    {request.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Views</span>
                  <span className="text-2xl font-bold">{request.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Books Donated</span>
                  <span className="text-2xl font-bold">{request.donations || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Organizations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Organizations You Can Help</h2>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Explore more verified organizations seeking book donations</p>
            <button
              onClick={() => navigate('/donation-requests')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
            >
              View All Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
