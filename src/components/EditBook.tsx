import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { Book } from '../types';

export default function EditBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    originalPrice: '',
    sellingPrice: '',
    condition: 'good',
    category: '',
    class: '',
    subject: '',
    board: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchBookDetails();
  }, [bookId, currentUser]);

  const fetchBookDetails = async () => {
    if (!bookId) return;
    
    try {
      const bookDoc = await getDoc(doc(db, 'books', bookId));
      
      if (bookDoc.exists()) {
        const bookData = bookDoc.data();
        
        // Check if current user is the owner
        if (bookData.sellerId !== currentUser?.uid) {
          alert('You can only edit your own books');
          navigate('/my-listings');
          return;
        }
        
        setFormData({
          title: bookData.title || '',
          author: bookData.author || '',
          description: bookData.description || '',
          originalPrice: bookData.originalPrice?.toString() || '',
          sellingPrice: bookData.sellingPrice?.toString() || '',
          condition: bookData.condition || 'good',
          category: bookData.category || '',
          class: bookData.class || '',
          subject: bookData.subject || '',
          board: bookData.board || '',
          images: bookData.images || []
        });
        
        setImagePreviews(bookData.images || []);
      } else {
        alert('Book not found');
        navigate('/my-listings');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    setImageFiles([...imageFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Remove from existing images array
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !bookId) return;
    
    if (imagePreviews.length === 0) {
      alert('Please add at least one image');
      return;
    }
    
    setUpdating(true);
    
    try {
      let imageUrls = [...formData.images];
      
      // Upload new images if selected
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const imageRef = ref(storage, `books/${currentUser.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }
      }
      
      // Update book in Firestore
      await updateDoc(doc(db, 'books', bookId), {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        originalPrice: parseFloat(formData.originalPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        condition: formData.condition,
        category: formData.category,
        class: formData.class,
        subject: formData.subject,
        board: formData.board,
        images: imageUrls,
        updatedAt: new Date()
      });
      
      alert('Book updated successfully!');
      navigate('/my-listings');
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Edit Book" showBack={true} showProfile={true} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Edit Book" showBack={true} showProfile={true} />
      
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Book Images * (Max 5)
            </label>
            
            {/* Image Previews */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            {imagePreviews.length < 5 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter book title"
            />
          </div>

          {/* Author */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter author name"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe the book's condition and details"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Original Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Condition */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select category</option>
              <option value="school">School</option>
              <option value="intermediate">Intermediate</option>
              <option value="graduate">Graduate</option>
              <option value="competitive">Competitive</option>
              <option value="novel">Novel</option>
              <option value="comics">Comics</option>
              <option value="fiction">Fiction</option>
            </select>
          </div>

          {/* Class (optional) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class (Optional)
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 10th, B.Tech 2nd Year"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-400"
            >
              {updating ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
