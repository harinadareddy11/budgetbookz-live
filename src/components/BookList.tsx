import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsInfoCircle, BsGeoAlt } from 'react-icons/bs';

// Mock data - replace with actual API data later
const books = {
  cbse: [
    {
      id: 1,
      title: 'Physics NCERT Class 12',
      originalPrice: 450,
      sellingPrice: 299,
      discount: '34% off',
      condition: 'Good',
      suggestedPrice: 320,
      location: 'Ameerpet, Hyderabad',
      distance: '2.5 km',
      images: [
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'
      ]
    },
    {
      id: 2,
      title: 'Chemistry NCERT Class 12',
      originalPrice: 420,
      sellingPrice: 280,
      discount: '33% off',
      condition: 'Like New',
      suggestedPrice: 300,
      location: 'Kukatpally, Hyderabad',
      distance: '4.8 km',
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570'
      ]
    }
  ],
  state: [
    {
      id: 3,
      title: 'Mathematics State Board Class 10',
      originalPrice: 380,
      sellingPrice: 250,
      discount: '34% off',
      condition: 'Like New',
      suggestedPrice: 280,
      location: 'Madhapur, Hyderabad',
      distance: '1.2 km',
      images: [
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'
      ]
    }
  ]
};

export default function BookList() {
  const { syllabus } = useParams<{ syllabus: keyof typeof books }>();
  const navigate = useNavigate();
  const bookList = syllabus ? books[syllabus] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3">
        <BsArrowLeft className="text-xl cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-semibold">Available Books</h1>
      </div>

      {/* Book List */}
      <div className="p-4 space-y-4">
        {bookList.map((book) => (
          <div 
            key={book.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <div className="flex">
              <img
                src={book.images[0]}
                alt={book.title}
                className="h-32 w-32 object-cover"
              />
              <div className="p-4 flex-1">
                <h2 className="font-semibold mb-2">{book.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl text-blue-500">₹{book.sellingPrice}</span>
                  <span className="text-sm text-gray-500 line-through">₹{book.originalPrice}</span>
                  <span className="text-sm text-green-500">{book.discount}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <BsInfoCircle />
                  <span>Condition: {book.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BsGeoAlt className="text-blue-500" />
                  <span>{book.location}</span>
                  <span className="text-blue-500">•</span>
                  <span className="text-blue-500">{book.distance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}