import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsJournal, BsAward, BsTrophy, BsBookHalf, BsCardText, BsStars, BsArrowRight, BsBriefcase } from 'react-icons/bs';
import { getBooks } from '../services/bookService';

interface CategoryCount {
  school: number;
  intermediate: number;
  graduate: number;
  competitive: number;
  novel: number;
  comics: number;
  fiction: number;
  business: number;
  selfhelp: number;
}

export default function BookCategories() {
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount>({
    school: 0,
    intermediate: 0,
    graduate: 0,
    competitive: 0,
    novel: 0,
    comics: 0,
    fiction: 0,
    business: 0,
    selfhelp: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const allBooks = await getBooks();

      const counts: CategoryCount = {
        school: allBooks.filter((book) => book.category === 'school').length,
        intermediate: allBooks.filter((book) => book.category === 'intermediate').length,
        graduate: allBooks.filter((book) => book.category === 'graduate').length,
        competitive: allBooks.filter((book) => book.category === 'competitive').length,
        novel: allBooks.filter((book) => book.category === 'novel').length,
        comics: allBooks.filter((book) => book.category === 'comics').length,
        fiction: allBooks.filter((book) => book.category === 'fiction').length,
        business: allBooks.filter((book) => book.category === 'business').length,
        selfhelp: allBooks.filter((book) => book.category === 'self-help').length,
      };

      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const academicCategories = [
    {
      id: 'school',
      title: 'School Books',
      subtitle: 'Class 1-10 textbooks',
      icon: BsBook,
      color: 'blue',
      count: categoryCounts.school,
      needsSyllabus: true,
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      subtitle: '11th & 12th grade',
      icon: BsJournal,
      color: 'purple',
      count: categoryCounts.intermediate,
      needsSyllabus: true,
    },
    {
      id: 'graduate',
      title: 'Graduate Books',
      subtitle: 'College & university',
      icon: BsAward,
      color: 'green',
      count: categoryCounts.graduate,
      needsSyllabus: true,
    },
    {
      id: 'competitive',
      title: 'Competitive Exams',
      subtitle: 'JEE, NEET, UPSC',
      icon: BsTrophy,
      color: 'orange',
      count: categoryCounts.competitive,
      needsSyllabus: false,
    },
  ];

  const otherCategories = [
    {
      id: 'business',
      title: 'Business',
      subtitle: 'Entrepreneurship',
      icon: BsBriefcase,
      color: 'indigo',
      count: categoryCounts.business,
      needsSyllabus: false,
    },
    {
      id: 'self-help',
      title: 'Self-help',
      subtitle: 'Motivation',
      icon: BsStars,
      color: 'pink',
      count: categoryCounts.selfhelp,
      needsSyllabus: false,
    },
  ];

  const storyCategories = [
    {
      id: 'novel',
      title: 'Novels',
      subtitle: 'Fiction stories',
      icon: BsBookHalf,
      color: 'cyan',
      count: categoryCounts.novel,
    },
    {
      id: 'comics',
      title: 'Comics',
      subtitle: 'Graphic novels',
      icon: BsCardText,
      color: 'rose',
      count: categoryCounts.comics,
    },
    {
      id: 'fiction',
      title: 'Fiction',
      subtitle: 'All fiction',
      icon: BsStars,
      color: 'violet',
      count: categoryCounts.fiction,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white',
      green: 'bg-green-500 text-white',
      orange: 'bg-orange-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      pink: 'bg-pink-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      rose: 'bg-rose-500 text-white',
      violet: 'bg-violet-500 text-white',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h1>
          <p className="text-gray-600">Find books by category and subject</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-8">
        {/* Academic Books */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Academic Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {academicCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.needsSyllabus) {
                      navigate(`/categories/${category.id}/syllabus`);
                    } else {
                      navigate(`/all-books?category=${category.id}`);
                    }
                  }}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getColorClasses(category.color)}`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{category.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.subtitle}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {category.count} books
                      </span>
                    </div>
                    <BsArrowRight className="text-xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Professional & Growth */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Professional & Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/all-books?category=${category.id}`)}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getColorClasses(category.color)}`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{category.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.subtitle}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {category.count} books
                      </span>
                    </div>
                    <BsArrowRight className="text-xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Story Books */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Story Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storyCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/all-books?category=${category.id}`)}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm ${getColorClasses(category.color)}`}>
                    <Icon className="text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 text-center">{category.subtitle}</p>
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      {category.count} books
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Empty State */}
        {Object.values(categoryCounts).every((count) => count === 0) && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <BsBook className="text-4xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-600 mb-6">Be the first to list a book</p>
            <button
              onClick={() => navigate('/sell')}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
            >
              List Your Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
