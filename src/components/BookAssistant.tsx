import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BsRobot, BsSend, BsX, BsBook, BsMic, BsMicFill, BsClock, BsLightning } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  books?: BookResult[];
}

interface BookResult {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number | string;
  condition: string;
  type: 'sale' | 'exchange';
  description?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

export default function BookAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you find books quickly. Try asking about class books, competitive exams, or price ranges.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [allBooks, setAllBooks] = useState<BookResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadAllBooks();
    loadSearchHistory();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const loadAllBooks = async () => {
    try {
      const booksSnapshot = await getDocs(collection(db, 'books'));
      const exchangeBooksSnapshot = await getDocs(collection(db, 'exchangeBooks'));

      const books: BookResult[] = [
        ...booksSnapshot.docs.map((doc) => {
          const data = doc.data();
          let price: number = 0;
          const priceFields = ['price', 'Price', 'bookPrice', 'amount', 'cost', 'sellingPrice'];

          for (const field of priceFields) {
            if (data[field] !== undefined && data[field] !== null) {
              if (typeof data[field] === 'number') {
                price = data[field];
                break;
              } else if (typeof data[field] === 'string') {
                price = parseFloat(data[field]) || 0;
                break;
              }
            }
          }

          if (price === 0) {
            for (const value of Object.values(data)) {
              if (typeof value === 'number' && value > 0 && value < 10000) {
                price = value;
                break;
              }
            }
          }

          return {
            id: doc.id,
            title: data.title || '',
            author: data.author || '',
            category: data.category || '',
            price: price,
            condition: data.condition || '',
            type: 'sale' as const,
            description: data.description || '',
            images: data.images || [],
            latitude: typeof data.lat === 'number' ? data.lat : typeof data.latitude === 'number' ? data.latitude : undefined,
            longitude: typeof data.lng === 'number' ? data.lng : typeof data.longitude === 'number' ? data.longitude : undefined,
          };
        }),
        ...exchangeBooksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            author: data.author || '',
            category: data.category || '',
            price: 'Exchange',
            condition: data.condition || '',
            type: 'exchange' as const,
            description: data.description || '',
            images: data.images || [],
            latitude: typeof data.lat === 'number' ? data.lat : typeof data.latitude === 'number' ? data.latitude : undefined,
            longitude: typeof data.lng === 'number' ? data.lng : typeof data.longitude === 'number' ? data.longitude : undefined,
          };
        }),
      ];

      setAllBooks(books);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('bookSearchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = (query: string) => {
    try {
      const updated = [query, ...searchHistory.filter((q) => q !== query)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('bookSearchHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('bookSearchHistory');
  };

  const generateSuggestions = (text: string) => {
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerText = text.toLowerCase();

    const commonQueries = [
      '10th class books',
      '11th class books',
      '12th class books',
      'JEE preparation',
      'NEET preparation',
      'Books under ₹200',
      'Books under ₹500',
      'Books for exchange',
    ];

    const bookSuggestions = allBooks
      .filter(
        (book) =>
          book.title.toLowerCase().includes(lowerText) ||
          book.author.toLowerCase().includes(lowerText)
      )
      .slice(0, 3)
      .map((book) => book.title);

    const querySuggestions = commonQueries.filter((q) => q.toLowerCase().includes(lowerText));

    const combined = [...new Set([...querySuggestions, ...bookSuggestions])].slice(0, 5);

    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => {
        if (transcript) {
          handleSendWithQuery(transcript);
        }
      }, 500);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const extractPriceFromQuery = (query: string): { maxPrice: number | null; minPrice: number | null } => {
    const lowerQuery = query.toLowerCase();

    const underMatch = lowerQuery.match(/(?:under|below|less\s+than|<)\s*₹?\s*(\d+)/);
    if (underMatch) {
      return { maxPrice: parseInt(underMatch[1]), minPrice: null };
    }

    const rupeeMatch = lowerQuery.match(/(\d+)\s*(?:rupees?|rs|inr)/);
    if (rupeeMatch) {
      return { maxPrice: parseInt(rupeeMatch[1]), minPrice: null };
    }

    const aboveMatch = lowerQuery.match(/(?:above|more\s+than|over|>)\s*₹?\s*(\d+)/);
    if (aboveMatch) {
      return { maxPrice: null, minPrice: parseInt(aboveMatch[1]) };
    }

    const betweenMatch = lowerQuery.match(/between\s+₹?\s*(\d+)\s+(?:and|to)\s+₹?\s*(\d+)/);
    if (betweenMatch) {
      return { minPrice: parseInt(betweenMatch[1]), maxPrice: parseInt(betweenMatch[2]) };
    }

    return { maxPrice: null, minPrice: null };
  };

  const smartSearch = (userQuery: string): BookResult[] => {
    const query = userQuery.toLowerCase();

    const matches = (text: string, searchTerms: string[]) => {
      const lowerText = text.toLowerCase();
      return searchTerms.some((term) => lowerText.includes(term));
    };

    const searchTerms = query.split(' ').filter((word) => word.length > 2);
    const { maxPrice, minPrice } = extractPriceFromQuery(query);

    let results = allBooks.filter((book) => {
      const bookText = `${book.title} ${book.author} ${book.category} ${book.description}`.toLowerCase();

      if (maxPrice !== null && typeof book.price === 'number') {
        if (book.price > maxPrice) return false;
      }

      if (minPrice !== null && typeof book.price === 'number') {
        if (book.price < minPrice) return false;
      }

      if (query.includes('exchange') || query.includes('swap')) {
        if (book.type !== 'exchange') return false;
      }

      const classMap: Record<string, string[]> = {
        '10': ['10th', 'tenth', 'class 10', 'x class'],
        '11': ['11th', 'eleventh', 'class 11', 'xi class'],
        '12': ['12th', 'twelfth', 'class 12', 'xii class'],
      };

      for (const [num, terms] of Object.entries(classMap)) {
        if (terms.some((term) => query.includes(term))) {
          if (!bookText.includes(num) && !terms.some((t) => bookText.includes(t))) {
            return false;
          }
        }
      }

      if (query.includes('jee') || query.includes('iit')) {
        if (!bookText.includes('jee') && !bookText.includes('iit')) return false;
      }

      if (query.includes('neet')) {
        if (!bookText.includes('neet')) return false;
      }

      const subjects = ['physics', 'chemistry', 'maths', 'mathematics', 'biology', 'english', 'social', 'history', 'geography', 'computer', 'science'];
      for (const subject of subjects) {
        if (query.includes(subject)) {
          if (!bookText.includes(subject)) return false;
        }
      }

      if (searchTerms.length > 0 && !maxPrice && !minPrice) {
        return matches(bookText, searchTerms);
      }

      return true;
    });

    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
      if (!aTitle.includes(query) && bTitle.includes(query)) return 1;

      if (maxPrice !== null || minPrice !== null) {
        const aPrice = typeof a.price === 'number' ? a.price : Infinity;
        const bPrice = typeof b.price === 'number' ? b.price : Infinity;
        return aPrice - bPrice;
      }

      return 0;
    });

    return results.slice(0, 8);
  };

  const handleSendWithQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setInput('');
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    saveToHistory(userMessage);

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const books = smartSearch(userMessage);

      if (books.length > 0) {
        const { maxPrice } = extractPriceFromQuery(userMessage);
        let priceInfo = maxPrice ? ` under ₹${maxPrice}` : '';

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Found ${books.length} book${books.length > 1 ? 's' : ''}${priceInfo}:`,
            books: books,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'No books found. Try:\n• "10th class books"\n• "JEE preparation"\n• "Books under ₹200"',
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    handleSendWithQuery(input);
  };

  const getDistanceKm = (userLoc: { lat: number; lng: number } | null, book: BookResult): string | null => {
    if (!userLoc || typeof book.latitude !== 'number' || typeof book.longitude !== 'number') {
      return null;
    }

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(book.latitude - userLoc.lat);
    const dLon = toRad(book.longitude - userLoc.lng);
    const lat1 = toRad(userLoc.lat);
    const lat2 = toRad(book.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 0.1) return '<100m';
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
  };

  // Quick action buttons
  const quickActions = [
    '10th class books',
    'JEE preparation',
    'Books under ₹200',
    'Exchange books',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all z-50 hover:scale-110"
        title="AI Book Assistant"
      >
        <BsRobot className="text-2xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <BsRobot className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold">AI Book Assistant</h3>
            <p className="text-xs text-blue-100">Smart • Fast • Voice-enabled</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition"
        >
          <BsX className="text-2xl" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>

            {/* Book Results */}
            {msg.books && msg.books.length > 0 && (
              <div className="mt-3 space-y-2">
                {msg.books.map((book) => {
                  const distance = userLocation ? getDistanceKm(userLocation, book) : null;

                  return (
                    <div
                      key={book.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(book.type === 'exchange' ? `/exchange-book/${book.id}` : `/book/${book.id}`);
                      }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex gap-3">
                        {book.images && book.images[0] ? (
                          <img src={book.images[0]} alt={book.title} className="w-14 h-20 object-cover rounded-lg" />
                        ) : (
                          <div className="w-14 h-20 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BsBook className="text-xl text-blue-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1 mb-0.5">{book.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-1 mb-2">{book.author}</p>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-blue-600">
                              {typeof book.price === 'number' ? `₹${book.price}` : book.price}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">{book.condition}</span>
                          </div>

                          {distance && (
                            <p className="text-xs text-green-600 font-medium">📍 {distance} away</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Show when no messages */}
        {messages.length === 1 && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BsLightning className="text-blue-500" />
              <p className="text-xs font-semibold text-gray-600">Quick Searches</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendWithQuery(action)}
                  className="text-xs bg-white border-2 border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search History */}
      {input === '' && searchHistory.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600 font-semibold flex items-center gap-1.5">
              <BsClock className="text-sm" /> Recent
            </p>
            <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-600 font-medium">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 4).map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSendWithQuery(query)}
                className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                {query.length > 20 ? query.substring(0, 20) + '...' : query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input with Suggestions */}
      <div className="p-4 border-t-2 border-gray-200 bg-white rounded-b-2xl relative">
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSendWithQuery(suggestion);
                }}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-2"
              >
                <BsLightning className="text-blue-500 text-xs" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              generateSuggestions(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            onFocus={() => {
              if (input.length >= 2) generateSuggestions(input);
            }}
            placeholder="Ask about books..."
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            disabled={loading}
          />

          <button
            onClick={startVoiceSearch}
            disabled={loading || isListening}
            className={`px-3 py-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
            } disabled:opacity-50`}
            title="Voice Search"
          >
            {isListening ? <BsMicFill className="text-lg" /> : <BsMic className="text-lg" />}
          </button>

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <BsSend />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          {isListening ? '🎤 Listening...' : 'Try voice search or type your query'}
        </p>
      </div>
    </div>
  );
}
