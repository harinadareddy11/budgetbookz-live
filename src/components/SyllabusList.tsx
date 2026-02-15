import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooks } from '../services/bookService';

interface SyllabusCount {
  cbse: number;
  state: number;
  icse: number;
  other: number;
}

export default function SyllabusList() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [syllabusCounts, setSyllabusCounts] = useState<SyllabusCount>({
    cbse: 0,
    state: 0,
    icse: 0,
    other: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyllabusCounts();
  }, [category]);

  const fetchSyllabusCounts = async () => {
    try {
      // Get books for this category
      const allBooks = await getBooks({ category: category });
      
      // Count by syllabus
      const counts = {
        cbse: allBooks.filter(book => book.syllabus === 'cbse').length,
        state: allBooks.filter(book => book.syllabus === 'state').length,
        icse: allBooks.filter(book => book.syllabus === 'icse').length,
        other: allBooks.filter(book => book.syllabus === 'other').length
      };
      
      setSyllabusCounts(counts);
    } catch (error) {
      console.error('Error fetching syllabus counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const syllabuses = [
    {
      id: 'cbse',
      title: 'CBSE',
      subtitle: 'Central Board of Secondary Education',
      icon: '📘',
      color: 'from-blue-500 to-blue-600',
      count: syllabusCounts.cbse
    },
    {
      id: 'state',
      title: 'State Board',
      subtitle: 'State Education Boards',
      icon: '📗',
      color: 'from-green-500 to-green-600',
      count: syllabusCounts.state
    },
    {
      id: 'icse',
      title: 'ICSE',
      subtitle: 'Indian Certificate of Secondary Education',
      icon: '📙',
      color: 'from-purple-500 to-purple-600',
      count: syllabusCounts.icse
    },
    {
      id: 'other',
      title: 'Other',
      subtitle: 'International & Other Boards',
      icon: '📕',
      color: 'from-orange-500 to-orange-600',
      count: syllabusCounts.other
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading syllabuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{category} Books</h1>
        <p className="text-gray-600">Select your syllabus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {syllabuses.map((syllabus) => (
          <button
            key={syllabus.id}
            onClick={() => navigate(`/categories/${category}/syllabus/${syllabus.id}/books`)}
            className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
            disabled={syllabus.count === 0}
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${syllabus.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform ${syllabus.count === 0 ? 'opacity-50' : ''}`}>
                {syllabus.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{syllabus.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{syllabus.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    syllabus.count > 0 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-500 bg-gray-100'
                  }`}>
                    {syllabus.count > 0 ? `${syllabus.count} books available` : 'No books yet'}
                  </span>
                </div>
              </div>
              {syllabus.count > 0 && (
                <span className="text-2xl text-gray-400 group-hover:text-orange-500 transition-colors">→</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
