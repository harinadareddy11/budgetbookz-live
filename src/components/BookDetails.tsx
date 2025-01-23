import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsStarFill, BsClock, BsTelephone, BsChatDots, BsCart } from 'react-icons/bs';

// Mock data - replace with actual API data later
const booksData = {
  1: {
    id: 1,
    title: 'Physics NCERT Class 12',
    originalPrice: 450,
    sellingPrice: 299,
    discount: '34% off',
    publisher: 'NCERT',
    language: 'English',
    condition: 'Like New',
    delivery: 'Free Delivery',
    seller: {
      name: 'Rahul Kumar',
      rating: 4.8,
      responseTime: 'Usually responds within 1 hour'
    },
    description: 'CBSE Physics textbook in excellent condition, all chapters intact. Perfect for JEE preparation with all important topics covered. Includes solved examples and practice questions.',
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f'
    ]
  }
};

export default function BookDetails() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const book = bookId ? booksData[Number(bookId)] : null;

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3">
        <BsArrowLeft className="text-xl cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-semibold">Book Details</h1>
      </div>

      {/* Image Carousel */}
      <div className="relative h-64 bg-gray-200">
        <div className="flex overflow-x-auto snap-x">
          {book.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${book.title} - ${index + 1}`}
              className="h-64 w-full object-cover snap-center"
            />
          ))}
        </div>
      </div>

      {/* Book Details */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2">{book.title}</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl text-blue-500">₹{book.sellingPrice}</span>
          <span className="text-gray-500 line-through">₹{book.originalPrice}</span>
          <span className="text-green-500">{book.discount}</span>
        </div>

        {/* Book Information */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-500">Publisher</h3>
              <p>{book.publisher}</p>
            </div>
            <div>
              <h3 className="text-gray-500">Language</h3>
              <p>{book.language}</p>
            </div>
            <div>
              <h3 className="text-gray-500">Condition</h3>
              <p>{book.condition}</p>
            </div>
            <div>
              <h3 className="text-gray-500">Delivery</h3>
              <p className="text-green-500">{book.delivery}</p>
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="border-t border-b py-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{book.seller.name}</h3>
            <div className="flex items-center gap-1">
              <BsStarFill className="text-yellow-400" />
              <span>{book.seller.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <BsClock />
            <span>{book.seller.responseTime}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{book.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button className="flex items-center justify-center gap-2 bg-green-500 text-white p-3 rounded-lg">
            <BsTelephone />
            <span>Call</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-lg">
            <BsChatDots />
            <span>Chat</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-purple-500 text-white p-3 rounded-lg">
            <BsCart />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}