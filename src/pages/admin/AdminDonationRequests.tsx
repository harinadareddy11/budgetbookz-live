import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BsCheckCircle, BsXCircle, BsEye, BsClock, BsBuilding, BsFileEarmarkText, BsX, BsArrowLeft } from 'react-icons/bs';
import { LoadingSpinner, ConfirmModal } from '../../components';

const ADMIN_EMAILS = [
  'admin@budgetbookz.com',
  'harinadareddy11.1@gmail.com'  // Your admin email
];

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
  documents: string[];
  userId: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  views: number;
  donations: number;
  rejectionReason?: string;
}

// Detail Modal Component
interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DonationRequest | null;
  onApprove: (request: DonationRequest) => void;
  onReject: (request: DonationRequest) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, request, onApprove, onReject }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BsX className="text-3xl" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Logo and Basic Info */}
          <div className="flex gap-6 mb-6 pb-6 border-b border-gray-200">
            {request.logo ? (
              <img src={request.logo} alt="Logo" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                <BsBuilding className="text-3xl text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{request.organizationName}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  {request.organizationType}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  request.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Reg. No: {request.registrationNumber}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-900">{request.email}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{request.phone}</p>
              </div>
              {request.website && (
                <div className="md:col-span-2">
                  <p className="text-gray-600 mb-1">Website</p>
                  <a href={request.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {request.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Address</h4>
            <p className="text-gray-700 text-sm">
              {request.address}, {request.city}, {request.state} - {request.pincode}
            </p>
          </div>

          {/* About Organization */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">About Organization</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{request.description}</p>
          </div>

          {/* Book Requirements */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Book Requirements</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm mb-2">Categories Needed:</p>
                <div className="flex flex-wrap gap-2">
                  {request.categories.map((cat, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Quantity Needed</p>
                  <p className="font-medium text-gray-900">{request.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Beneficiaries</p>
                  <p className="font-medium text-gray-900">{request.beneficiaries}</p>
                </div>
              </div>
              {request.booksNeeded && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Specific Books</p>
                  <p className="text-gray-700 text-sm">{request.booksNeeded}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm mb-1">Purpose</p>
                <p className="text-gray-700 text-sm leading-relaxed">{request.purpose}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Verification Documents</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {request.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors"
                >
                  <BsFileEarmarkText className="text-xl text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Document {index + 1}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="font-bold text-red-900 mb-2">Rejection Reason</h4>
              <p className="text-red-700 text-sm">{request.rejectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onReject(request)}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <BsXCircle />
                Reject
              </button>
              <button
                onClick={() => onApprove(request)}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <BsCheckCircle />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDonationRequests() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    
    // Check if email is in admin list
    if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }
    
    fetchRequests();
  }, [currentUser, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'donationRequests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationRequest[];
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      await updateDoc(doc(db, 'donationRequests', selectedRequest.id), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: currentUser?.uid,
      });
      
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? { ...r, status: 'approved' as const } : r
      ));
      setShowApproveModal(false);
      setShowDetailModal(false);
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request.');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      await updateDoc(doc(db, 'donationRequests', selectedRequest.id), {
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: currentUser?.uid,
      });
      
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? { ...r, status: 'rejected' as const, rejectionReason } : r
      ));
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      alert('Request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request.');
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return <LoadingSpinner message="Loading requests..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Approve Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Request"
        message={`Are you sure you want to approve "${selectedRequest?.organizationName}"? This organization will be visible to all donors.`}
        confirmText="Approve"
        type="success"
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        onConfirm={handleReject}
        title="Reject Request"
        message={`Please provide a reason for rejecting "${selectedRequest?.organizationName}":`}
        confirmText="Reject"
        type="danger"
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
        />
      </ConfirmModal>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        request={selectedRequest}
        onApprove={(req) => {
          setSelectedRequest(req);
          setShowApproveModal(true);
        }}
        onReject={(req) => {
          setSelectedRequest(req);
          setShowRejectModal(true);
        }}
      />

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation Requests - Admin</h1>
          <p className="text-gray-600">Review and verify organization donation requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
            <p className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BsClock className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {filter !== 'all' && filter} requests</h3>
            <p className="text-gray-600">There are no donation requests to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-5"
              >
                <div className="flex gap-4">
                  {/* Logo */}
                  {request.logo ? (
                    <img
                      src={request.logo}
                      alt={request.organizationName}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                      <BsBuilding className="text-3xl text-gray-400" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{request.organizationName}</h3>
                        <p className="text-sm text-gray-600">{request.organizationType} • {request.city}, {request.state}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                        {request.categories.length} categories
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                        {request.quantity}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                        {request.beneficiaries}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors border border-blue-200 flex items-center gap-1.5"
                      >
                        <BsEye />
                        View Details
                      </button>

                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveModal(true);
                            }}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-semibold transition-colors border border-green-200 flex items-center gap-1.5"
                          >
                            <BsCheckCircle />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-semibold transition-colors border border-red-200 flex items-center gap-1.5"
                          >
                            <BsXCircle />
                            Reject
                          </button>
                        </>
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
