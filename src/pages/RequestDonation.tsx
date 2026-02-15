import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { BsUpload, BsX, BsBuilding, BsShield } from 'react-icons/bs';
import { Modal, LoadingSpinner } from '../components';

export default function RequestDonation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
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
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    booksNeeded: '',
    categories: [] as string[],
    quantity: '',
    purpose: '',
    beneficiaries: '',
  });

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === 'success') {
      navigate('/');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + documents.length > 5) {
      showModal('error', 'Too Many Documents', 'You can upload a maximum of 5 documents.');
      return;
    }

    setDocuments([...documents, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
    setDocumentPreviews(documentPreviews.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (documents.length === 0) {
      showModal('error', 'Documents Required', 'Please upload registration/proof documents.');
      return;
    }

    if (formData.categories.length === 0) {
      showModal('error', 'Categories Required', 'Please select at least one book category.');
      return;
    }

    setLoading(true);

    try {
      // Upload logo
      let logoUrl = '';
      if (logo) {
        const logoRef = ref(storage, `organizations/${currentUser.uid}/logo_${Date.now()}`);
        await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Upload documents
      const documentUrls: string[] = [];
      for (const doc of documents) {
        const docRef = ref(storage, `organizations/${currentUser.uid}/docs/${Date.now()}_${doc.name}`);
        await uploadBytes(docRef, doc);
        const url = await getDownloadURL(docRef);
        documentUrls.push(url);
      }

      // Add request to Firestore
      await addDoc(collection(db, 'donationRequests'), {
        ...formData,
        logo: logoUrl,
        documents: documentUrls,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        views: 0,
        donations: 0,
      });

      showModal(
        'success',
        'Request Submitted!',
        'Your donation request has been submitted for admin verification. You will be notified once approved.'
      );
      
      // Reset form
      setFormData({
        organizationName: '',
        organizationType: '',
        registrationNumber: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        description: '',
        booksNeeded: '',
        categories: [],
        quantity: '',
        purpose: '',
        beneficiaries: '',
      });
      setDocuments([]);
      setDocumentPreviews([]);
      setLogo(null);
      setLogoPreview('');
    } catch (error) {
      console.error('Error submitting request:', error);
      showModal('error', 'Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'School Books (Class 1-10)',
    'Intermediate Books (11th-12th)',
    'Graduate Books',
    'Competitive Exam Books',
    'Children Story Books',
    'Novels & Fiction',
    'Educational Resources',
    'Reference Books',
  ];

  if (loading) {
    return <LoadingSpinner message="Submitting your request..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BsBuilding className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Request Book Donations</h1>
              <p className="text-blue-100 mt-2">For Schools, NGOs, Libraries & Non-Profits</p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6 flex items-start gap-3">
            <BsShield className="text-2xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Admin Verification Required</h3>
              <p className="text-sm text-blue-100">
                All organizations are verified by our admin team to ensure legitimacy and prevent misuse. 
                Only approved organizations will be visible to donors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 pb-24">
        {/* Process Steps */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-blue-600">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Submit Request</h3>
              <p className="text-sm text-gray-600">Fill the form with your organization details and book requirements</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-purple-600">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Admin Verification</h3>
              <p className="text-sm text-gray-600">Our team verifies your organization and documents</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-green-600">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Receive Donations</h3>
              <p className="text-sm text-gray-600">Once approved, donors can see your request and donate books</p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Logo (Optional)</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogo(null);
                        setLogoPreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <BsX className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="logo-upload" className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                    <BsUpload className="text-2xl text-gray-400" />
                  </label>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <div>
                  <p className="text-sm text-gray-600">Upload your organization logo</p>
                  <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type *</label>
                  <select
                    required
                    value={formData.organizationType}
                    onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select type</option>
                    <option value="NGO">NGO</option>
                    <option value="School">School</option>
                    <option value="Library">Library</option>
                    <option value="Orphanage">Orphanage</option>
                    <option value="Community Center">Community Center</option>
                    <option value="Children Care">Children Care Centre</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Government registration number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="contact@organization.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Contact number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="https://www.organization.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    placeholder="Street, Area, Landmarks"
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

            {/* About Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Your Organization *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                placeholder="Tell us about your organization's mission, activities, and impact..."
              />
            </div>

            {/* Book Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Book Categories Needed * (Select all that apply)</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                          formData.categories.includes(category)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Books Needed (Optional)</label>
                  <textarea
                    value={formData.booksNeeded}
                    onChange={(e) => setFormData({ ...formData, booksNeeded: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    placeholder="List specific book titles or subjects you need (e.g., 'Class 10 NCERT Mathematics, Physics textbooks')"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Approximate Quantity Needed *</label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g., 100-200 books"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beneficiaries *</label>
                    <input
                      type="text"
                      required
                      value={formData.beneficiaries}
                      onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g., 50 students"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose / How books will be used *</label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    placeholder="Explain how the donated books will help your organization and beneficiaries..."
                  />
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Documents * (Registration certificate, Tax exemption, ID proof - Max 5 files)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleDocumentChange}
                  className="hidden"
                  id="document-upload"
                  disabled={documents.length >= 5}
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <BsUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload documents</p>
                  <p className="text-xs text-gray-500">PDF or Images • {documents.length}/5 files uploaded</p>
                </label>
              </div>

              {/* Document Previews */}
              {documentPreviews.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <BsX className="text-2xl" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> By submitting this request, you confirm that all information provided is accurate and your organization is legitimate. 
                False information may result in permanent ban from the platform.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting Request...
                </span>
              ) : (
                'Submit Donation Request'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
