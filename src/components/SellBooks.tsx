import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCamera, BsTrash, BsCheckCircle, BsGeoAlt, BsTelephone, BsShieldLock } from 'react-icons/bs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { createBook, calculateSuggestedPrice } from '../services/bookService';
import { storage } from '../config/firebase';

const conditions = ['New', 'Like New', 'Good', 'Acceptable'];
const genres = ['Textbook', 'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Other'];
const categories = [
  'school',
  'intermediate',
  'graduate',
  'competitive',
  'business',
  'self-help',
  'fiction',
  'non-fiction',
  'other',
];

const syllabuses = ['cbse', 'state', 'icse', 'other'];

const popularCities = [
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
];

export default function SellBooks() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    category: 'school',
    syllabus: 'cbse',
    class: '',
    subject: '',
    condition: '',
    originalPrice: '',
    sellingPrice: '',
    description: '',
    contact: '',
    city: '',
    state: '',
    pincode: '',
    showPhoneNumber: false,
  });

  // allow lat/lng to be null so we know if it was actually set
  const [location, setLocation] = useState<{
    lat: number | null;
    lng: number | null;
    city: string;
    state: string;
  }>({
    lat: null,
    lng: null,
    city: '',
    state: '',
  });

  useEffect(() => {
    if (userData?.location) {
      setLocation(userData.location);
      setFormData(prev => ({
        ...prev,
        city: userData.location.city || '',
        state: userData.location.state || '',
      }));
    }
  }, [userData]);

  // Compress image before upload (SPEED FIX)
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.7,
          );
        };
      };
    });
  };

  const handleGetCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      // First try: Quick location with low accuracy
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await processLocation(position);
        },
        (error) => {
          console.warn('Quick location failed, trying high accuracy...', error.message);
          // Second try: High accuracy with longer timeout
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              await processLocation(position);
            },
            (error) => {
              console.error('Location error:', error);
              alert('Unable to get your location. Please try again or enter manually.');
              setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const processLocation = async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      );
      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || 'Unknown';
      const state = data.address.state || 'Unknown';

      setLocation({ lat: latitude, lng: longitude, city, state });
      setFormData(prev => ({ ...prev, city, state }));
      setLocationLoading(false);
    } catch (error) {
      console.error('Geocoding error:', error);
      // Still save coordinates even if city/state lookup fails
      setLocation({ lat: latitude, lng: longitude, city: 'Unknown', state: 'Unknown' });
      setFormData(prev => ({ ...prev, city: 'Unknown', state: 'Unknown' }));
      setLocationLoading(false);
    }
  };

  const handleCitySelect = (city: string, state: string) => {
    setFormData(prev => ({ ...prev, city, state }));
    setLocation(prev => ({ ...prev, city, state }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && imageFiles.length < 5) {
      const file = files[0];

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);

      // Compress in background
      const compressed = await compressImage(file);
      setImageFiles(prev => [...prev, compressed]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    if (imageFiles.length === 0) {
      alert('Please add at least one image!');
      return;
    }

    if (!formData.city || !formData.state) {
      alert('Please enter your location!');
      return;
    }

    // NEW: do not allow submit without real lat/lng
    if (location.lat === null || location.lng === null) {
      alert('Please tap "Use Current Location" so we can save your location correctly.');
      return;
    }

    setLoading(true);
    setUploadProgress('Uploading images...');

    try {
      // Upload images with progress
      const uploadPromises = imageFiles.map(async (file, index) => {
        const storageRef = ref(storage, `books/${Date.now()}_${index}.jpg`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setUploadProgress(`Uploaded ${index + 1}/${imageFiles.length} images...`);
        return url;
      });
      const imageUrls = await Promise.all(uploadPromises);

      setUploadProgress('Saving book details...');

      // Create book with location + phone privacy
      await createBook(
        formData,
        imageUrls,
        currentUser.uid,
        userData?.name || currentUser.displayName || 'Anonymous',
        {
          lat: location.lat as number,
          lng: location.lng as number,
          city: formData.city,
          state: formData.state,
        },
      );

      setUploadProgress('Done!');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Error listing book:', error);
      alert(error.message || 'Failed to list book. Please try again.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  const suggestedPrice =
    formData.originalPrice && formData.condition
      ? calculateSuggestedPrice(parseFloat(formData.originalPrice), formData.condition)
      : 0;

  // only school and intermediate are academic
  const isAcademicCategory =
    formData.category === 'school' || formData.category === 'intermediate';

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BsCheckCircle className="text-white text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Listed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your book is now available for buyers in {formData.city}!</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Book Images (Max 5) *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {imagePreviews.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img src={img} alt={`Book ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                >
                  <BsTrash />
                </button>
              </div>
            ))}
            {imageFiles.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                <BsCamera className="text-3xl text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Add Photo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <BsGeoAlt className="inline mr-2" />
              Book Location *
            </label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locationLoading}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
            >
              {locationLoading ? 'Getting location...' : '📍 Use Current Location'}
            </button>
          </div>

          {/* Show coordinates if available */}
          {location.lat !== null && location.lng !== null && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800 font-medium">
                ✓ Location saved: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((loc) => (
                <button
                  key={loc.city}
                  type="button"
                  onClick={() => handleCitySelect(loc.city, loc.state)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.city === loc.city
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  {loc.city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Hyderabad"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Telangana"
                required
              />
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., NCERT Physics Class 12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., NCERT"
              required
            />
          </div>

          {/* Category + Syllabus */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {isAcademicCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus *</label>
                <select
                  value={formData.syllabus}
                  onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {syllabuses.map(syl => (
                    <option key={syl} value={syl}>{syl.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Class + Subject */}
          {isAcademicCategory && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class/Grade</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Physics"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Condition</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                min="0"
                placeholder="450"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                min="0"
                placeholder="299"
                required
              />
            </div>
          </div>

          {suggestedPrice > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Suggested Price: <span className="font-bold">₹{suggestedPrice}</span>
                <span className="text-xs block mt-1">Based on condition and original price</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Describe the book condition, any highlights, marks, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="Enter 10-digit number"
              required
            />
          </div>

          {/* Privacy Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="showPhone"
                checked={formData.showPhoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, showPhoneNumber: e.target.checked }))}
                className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="showPhone"
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                >
                  <BsTelephone className="text-lg" />
                  Show my phone number to buyers
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.showPhoneNumber
                    ? '✅ Buyers can call you directly'
                    : '🔒 Buyers can only chat. Your number stays private'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {uploadProgress}
            </span>
          ) : (
            'List Book for Sale'
          )}
        </button>
      </form>
    </div>
  );
}