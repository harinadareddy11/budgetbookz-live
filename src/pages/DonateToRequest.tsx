import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  BsUpload, 
  BsX, 
  BsBuilding, 
  BsArrowLeft,
  BsCheckCircle,
  BsHeart
} from 'react-icons/bs';
import { LoadingSpinner, Modal } from '../components';


interface DonationRequest {
  id: string;
  organizationName: string;
  organizationType: string;
  logo: string;
  city: string;
  state: string;
  status: string;
  categories: string[];
}


export default function DonateToRequest() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [request, setRequest] = useState<DonationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);


  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });


  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    bookTitles: '',
    category: '',
    quantity: '',
    condition: '',
    pickupAddress: '',
    city: '',
    state: '',
    pincode: '',
    message: '',
  });


  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (requestId) {
      fetchRequest();
    }
    // Pre-fill user data
    if (userData) {
      setFormData(prev => ({
        ...prev,
        donorName: userData.name || '',
        donorEmail: currentUser.email || '',
        donorPhone: userData.phone || '',
      }));
    }
  }, [requestId, currentUser, userData]);


  const fetchRequest = async () => {
    if (!requestId) return;


    setLoading(true);
    try {
      const docRef = doc(db, 'donationRequests', requestId);
      const docSnap = await getDoc(docRef);


      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as DonationRequest;
        
        // ✅ FIXED: Case-insensitive check for approved status
        if (data.status?.toLowerCase() !== 'approved') {
          navigate('/donation-requests');
          return;
        }


        setRequest(data);
      } else {
        navigate('/donation-requests');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      navigate('/donation-requests');
    } finally {
      setLoading(false);
    }
  };


  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };


  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === 'success') {
      navigate(`/donation-request/${requestId}`);
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      showModal('error', 'Too Many Images', 'You can upload a maximum of 5 images.');
      return;
    }


    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };


  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!currentUser || !requestId) {
      navigate('/login');
      return;
    }


    if (images.length === 0) {
      showModal('error', 'Images Required', 'Please upload at least one image of the books.');
      return;
    }


    setSubmitting(true);


    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const imageRef = ref(storage, `donations/${currentUser.uid}/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }


      // Add donation to Firestore
      await addDoc(collection(db, 'donations'), {
        ...formData,
        images: imageUrls,
        requestId: requestId,
        organizationName: request?.organizationName,
        donorId: currentUser.uid,
        status: 'pending', // pending, accepted, completed
        createdAt: serverTimestamp(),
      });


      // Increment donations count
      await updateDoc(doc(db, 'donationRequests', requestId), {
        donations: increment(1)
      });


      showModal(
        'success',
        'Thank You!',
        `Your donation has been submitted to ${request?.organizationName}. They will contact you soon to arrange pickup.`
      );


      // Reset form
      setFormData({
        donorName: userData?.name || '',
        donorEmail: currentUser.email || '',
        donorPhone: userData?.phone || '',
        bookTitles: '',
        category: '',
        quantity: '',
        condition: '',
        pickupAddress: '',
        city: '',
        state: '',
        pincode: '',
        message: '',
      });
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error submitting donation:', error);
      showModal('error', 'Error', 'Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }


  if (!request) {
    return null;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />


      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/donation-request/${requestId}`)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <BsArrowLeft className="text-xl" />
            <span className="font-semibold">Back to Details</span>
          </button>


          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BsHeart className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Donate Books</h1>
              <p className="text-green-100 mt-1">to {request.organizationName}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-4xl mx-auto px-4 py-10 pb-24">
        {/* Organization Info Card */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            {request.logo ? (
              <img
                src={request.logo}
                alt={request.organizationName}
                className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                <BsBuilding className="text-2xl text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{request.organizationName}</h2>
              <p className="text-sm text-gray-600">{request.organizationType} • {request.city}, {request.state}</p>
            </div>
          </div>
        </div>


        {/* Donation Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation Details</h2>


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.donorPhone}
                    onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Your contact number"
                  />
                </div>
              </div>
            </div>


            {/* Book Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Book Titles / List *</label>
                  <textarea
                    required
                    value={formData.bookTitles}
                    onChange={(e) => setFormData({ ...formData, bookTitles: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    placeholder="List the books you're donating (e.g., 'Class 10 NCERT Math, Physics Guide, etc.')"
                  />
                </div>


                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select category</option>
                      {request.categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Number of books"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                    <select
                      required
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Acceptable">Acceptable</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>


            {/* Book Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Book Images * (Max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 5}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <BsUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload images of the books</p>
                  <p className="text-xs text-gray-500">{images.length}/5 images uploaded</p>
                </label>
              </div>


              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BsX className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Pickup Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <textarea
                    required
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    placeholder="House/Flat number, Street, Area"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                placeholder="Any additional information or preferred pickup time..."
              />
            </div>


            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <BsCheckCircle className="text-xl text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-blue-900 mb-1">What happens next?</p>
                  <p>The organization will review your donation and contact you to arrange a convenient pickup time.</p>
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting Donation...
                </>
              ) : (
                <>
                  <BsHeart />
                  Submit Donation
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
