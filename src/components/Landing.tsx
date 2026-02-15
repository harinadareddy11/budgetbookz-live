import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsGeoAlt, BsCash, BsShieldCheck, BsArrowRight, BsSearch, BsStars, BsRobot, BsCameraFill, BsArrowLeftRight, BsHeart } from 'react-icons/bs';

export default function Landing() {
  const navigate = useNavigate();

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Navigation */}
      <header className="bg-gray-100 border-b border-gray-300 sticky top-0 z-50 backdrop-blur-lg bg-gray-100/95">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BsBook className="text-xl text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Budget Bookz</span>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('ai-features')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              AI Tools
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/all-books')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Browse Books
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Blue Background */}
      <section id="home" className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 py-20 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-8 h-8 border-4 border-blue-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-12 h-12 border-4 border-blue-300/20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-6 h-6 bg-blue-300/20 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left - Text Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Buy • Sell • Exchange • Donate
            </div>
            
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              Books That Fit<br/>
              Your <span className="text-yellow-300">Budget</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-xl">
              Buy, sell, exchange, or donate used books. AI-powered pricing, smart search, and local connections make book trading effortless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Get Started Free <BsArrowRight />
              </button>
              <button
                onClick={() => navigate('/all-books')}
                className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <BsSearch /> Browse Books
              </button>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="relative flex items-center justify-center">
            <img 
              src="finlog.png" 
              alt="Person with books" 
              className="w-full max-w-4xl mx-auto scale-110"
              style={{ 
                mixBlendMode: 'multiply',
                opacity: 0.92
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-extrabold text-blue-500 mb-2">10K+</div>
            <div className="text-gray-700 font-medium">Books Listed</div>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-blue-500 mb-2">5K+</div>
            <div className="text-gray-700 font-medium">Happy Users</div>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-blue-500 mb-2">50+</div>
            <div className="text-gray-700 font-medium">Cities</div>
          </div>
        </div>
      </section>

      {/* AI Features Section - BLUE & WHITE THEME */}
      <section id="ai-features" className="py-24 px-6 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 relative overflow-hidden scroll-mt-20">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full text-sm font-semibold mb-6 text-blue-700">
              <BsStars className="text-blue-500" />
              AI-Powered Intelligence
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Smart Features That Save You Time</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our AI technology helps you price books accurately and find exactly what you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Price Intelligence */}
            <div className="bg-white backdrop-blur-lg border border-blue-200 p-8 rounded-3xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <BsStars className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Price Prediction</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our AI analyzes book condition, market demand, and local prices to suggest the perfect selling price instantly.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">✓</span>
                  <span>Automatic condition assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">✓</span>
                  <span>Real-time market pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">✓</span>
                  <span>Maximize your earnings</span>
                </li>
              </ul>
            </div>

            {/* AI Book Scanner */}
            <div className="bg-white backdrop-blur-lg border border-blue-200 p-8 rounded-3xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <BsCameraFill className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Book Scanner</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Snap a photo of your book and our AI instantly identifies it, fills details, and detects condition automatically.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">✓</span>
                  <span>Instant book recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">✓</span>
                  <span>Auto-fill book details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">✓</span>
                  <span>Condition detection & pricing</span>
                </li>
              </ul>
            </div>

            {/* AI Search Assistant */}
            <div className="bg-white backdrop-blur-lg border border-blue-200 p-8 rounded-3xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <BsRobot className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Search Assistant</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chat with our AI bot to find books using natural language. Just describe what you need and get instant results.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Natural language search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Smart filter recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Personalized book suggestions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* AI CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold text-lg shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <BsStars /> Try AI Features Free
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - COLORFUL ICONS */}
      <section id="features" className="py-24 px-6 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Why Budget Bookz?</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Buy, sell, exchange, or donate books with ease
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <BsCash className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Buy & Sell</h3>
              <p className="text-gray-700 leading-relaxed">
                Get textbooks up to 70% cheaper. Sell your old books and earn instant cash with AI-powered pricing.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <BsArrowLeftRight className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Exchange</h3>
              <p className="text-gray-700 leading-relaxed">
                Swap books with other students. Exchange your finished books for new ones without spending money.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <BsHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Donate Books</h3>
              <p className="text-gray-700 leading-relaxed">
                Give back to the community. Donate books to students in need and help spread education.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <BsGeoAlt className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Local & Safe</h3>
              <p className="text-gray-700 leading-relaxed">
                Find books nearby. Verified users and secure meetups ensure safe exchanges and donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - COLORFUL STEP NUMBERS */}
      <section id="how-it-works" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-xl">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up Free</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Create your account in 30 seconds. No credit card required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-xl">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">List or Browse</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Use AI to scan and list books, or browse thousands of books for sale, exchange, or donation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-xl">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect & Trade</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Meet locally to buy, sell, exchange, or donate books safely and conveniently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Save on Books?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of students saving money on textbooks.<br/>Buy, sell, exchange, or donate books today.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 font-bold text-xl shadow-2xl hover:scale-105 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BsBook className="text-xl text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Budget Bookz</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                Your trusted local book marketplace. Buy, sell, exchange, and donate books that fit your budget.
              </p>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => navigate('/all-books')} className="hover:text-blue-500 transition-colors">
                    Browse Books
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-blue-500 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-500 transition-colors">
                    How It Works
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-6 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-500">© 2025 Budget Bookz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
