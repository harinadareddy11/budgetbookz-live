import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBookHalf, BsMortarboard } from 'react-icons/bs';

const categories = [
  {
    id: 'school',
    name: 'School',
    icon: BsBookHalf,
    description: 'CBSE, State Syllabus and more'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: BsMortarboard,
    description: 'Junior College, 11th & 12th'
  },
  {
    id: 'graduate',
    name: 'Graduate',
    icon: BsMortarboard,
    description: 'Engineering, Medical, Arts & more'
  },
  {
    id: 'competitive',
    name: 'Competitive Exams',
    icon: BsBookHalf,
    description: 'JEE, NEET, UPSC & more'
  }
];

export default function BookCategories() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Select Category</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-4">
            <button
              className="w-full flex items-center text-left"
              onClick={() => navigate(`/syllabus/${category.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <category.icon className="text-blue-500 text-xl" />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">&gt;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}