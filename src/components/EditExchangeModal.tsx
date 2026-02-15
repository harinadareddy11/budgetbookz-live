import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { BsX, BsTrash } from 'react-icons/bs';

interface EditExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    description: string;
    condition: string;
    category: string;
    lookingFor: string;
    phoneNumber: string;
    showPhone: boolean;
    images: string[];
  };
  onSuccess: () => void;
}

export default function EditExchangeModal({ isOpen, onClose, book, onSuccess }: EditExchangeModalProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    condition: '',
    category: '',
    lookingFor: '',
    phoneNumber: '',
    showPhone: true
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description || '',
        condition: book.condition,
        category: book.category,
        lookingFor: book.lookingFor,
        phoneNumber: book.phoneNumber || '',
        showPhone: book.showPhone ?? true
      });
      setExistingImages(book.images || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [isOpen, book]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImagePreviews.length + files.length;
    
    if (totalImages > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    setNewImageFiles([...newImageFiles, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const totalImages = existingImages.length + newImageFiles.length;
    if (totalImages === 0) {
      alert('Please keep at least one image');
      return;
    }

    setSubmitting(true);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const imageRef = ref(storage, `exchangeBooks/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update book in Firestore
      await updateDoc(doc(db, 'exchangeBooks', book.id), {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        condition: formData.condition,
        category: formData.category,
        lookingFor: formData.lookingFor,
        phoneNumber: formData.phoneNumber,
        showPhone: formData.showPhone,
        images: allImages,
        updatedAt: new Date()
      });

      alert('Book updated successfully! ✅');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Exchange Book</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <BsX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Book Images * (Max 3)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <BsTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImagePreviews.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Images */}
            {(existingImages.length + newImagePreviews.length) < 3 && (
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
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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

          {/* Looking For */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What are you looking for? *
            </label>
            <textarea
              required
              value={formData.lookingFor}
              onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Show Phone */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showPhone}
                onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Allow others to see my phone number
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
            >
              {submitting ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
