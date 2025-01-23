import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsBook } from 'react-icons/bs';

const syllabusOptions = {
  school: [
    { id: 'cbse', name: 'CBSE', description: 'Central Board of Secondary Education' },
    { id: 'state', name: 'State Board', description: 'State Education Board' },
    { id: 'icse', name: 'ICSE', description: 'Indian Certificate of Secondary Education' },
    { id: 'igcse', name: 'IGCSE', description: 'International General Certificate of Secondary Education' }
  ],
  intermediate: [
    { id: 'state-inter', name: 'State Board', description: 'State Intermediate Board' },
    { id: 'cbse-11-12', name: 'CBSE (11th & 12th)', description: 'CBSE Higher Secondary' }
  ],
  graduate: [
    { id: 'engineering', name: 'Engineering', description: 'B.Tech, B.E & related courses' },
    { id: 'medical', name: 'Medical', description: 'MBBS, BDS & related courses' },
    { id: 'arts', name: 'Arts & Science', description: 'BA, B.Sc, B.Com & more' }
  ],
  competitive: [
    { id: 'jee', name: 'JEE', description: 'Joint Entrance Examination' },
    { id: 'neet', name: 'NEET', description: 'National Eligibility cum Entrance Test' },
    { id: 'upsc', name: 'UPSC', description: 'Union Public Service Commission' }
  ]
};

export default function SyllabusList() {
  const { category } = useParams<{ category: keyof typeof syllabusOptions }>();
  const navigate = useNavigate();
  
  const options = category ? syllabusOptions[category] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Select Syllabus</h2>
      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.id} className="bg-white rounded-lg shadow p-4">
            <button
              className="w-full flex items-center text-left"
              onClick={() => navigate(`/books/${option.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <BsBook className="text-blue-500 text-xl" />
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
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