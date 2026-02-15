import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Landing from './components/Landing';
import LocationPermission from './components/LocationPermission';
import Login from './components/Login';
import EmailLogin from './components/EmailLogin';
import PhoneLogin from './components/PhoneLogin';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import BookCategories from './components/BookCategories';
import SyllabusList from './components/SyllabusList';
import BookList from './components/BookList';
import BookDetails from './components/BookDetails';
import SellBooks from './components/SellBooks';
import AllBooks from './components/AllBooks';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import MyListings from './components/MyListings';
import Favorites from './components/Favorites';
import EditBook from './components/EditBook';
import ExchangeBooks from './components/ExchangeBooks';
import ExchangeBookDetails from './components/ExchangeBookDetails';
import ExchangeRequests from './components/ExchangeRequests';
import BookAssistant from './components/BookAssistant';

// Donation System Pages
import RequestDonation from './pages/RequestDonation';
import DonationRequests from './pages/DonationRequests';
import DonationRequestDetail from './pages/DonationRequestDetail';
import DonateToRequest from './pages/DonateToRequest';

// Admin Portal Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDonationRequests from './pages/admin/AdminDonationRequests';
import AdminBooks from './pages/admin/AdminBooks';
import AdminUsers from './pages/admin/AdminUsers';
import Notifications from './pages/Notifications';

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Routes where the bot should NOT appear
  const hideAssistantOn = [
    '/',
    '/login',
    '/email-login',
    '/phone-login',
    '/location',
    '/admin/login',
  ];

  const shouldShowAssistant =
    currentUser && 
    !hideAssistantOn.includes(location.pathname) && 
    !location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/location" element={<LocationPermission />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-login" element={<EmailLogin />} />
        <Route path="/phone-login" element={<PhoneLogin />} />
        
        {/* Public Book Browsing */}
        <Route path="/categories" element={<Layout><BookCategories /></Layout>} />
        <Route path="/categories/:category/syllabus" element={<Layout><SyllabusList /></Layout>} />
        <Route path="/categories/:category/syllabus/:syllabus/books" element={<Layout><BookList /></Layout>} />
        <Route path="/books/:id" element={<Layout><BookDetails /></Layout>} />
        <Route path="/book/:id" element={<Layout><BookDetails /></Layout>} />
        <Route path="/all-books" element={<Layout><AllBooks /></Layout>} />
        
        {/* Exchange Books (Public) */}
        <Route path="/exchange" element={<Layout><ExchangeBooks /></Layout>} />
        <Route path="/exchange-book/:bookId" element={<Layout><ExchangeBookDetails /></Layout>} />
        
        {/* Donation System (Public - View Only) */}
        <Route path="/donation-requests" element={<Layout><DonationRequests /></Layout>} />
        <Route path="/donation-request/:id" element={<Layout><DonationRequestDetail /></Layout>} />
        <Route path="/notifications" element={<Notifications />} />
        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/exchange-requests" 
          element={
            <ProtectedRoute>
              <Layout><ExchangeRequests /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <Layout><Favorites /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-listings" 
          element={
            <ProtectedRoute>
              <Layout><MyListings /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edit-book/:bookId" 
          element={
            <ProtectedRoute>
              <Layout><EditBook /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sell" 
          element={
            <ProtectedRoute>
              <Layout><SellBooks /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <Layout><ChatList /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chat/:chatRoomId" 
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />
        
        {/* Donation System (Protected) */}
        <Route 
          path="/request-donation" 
          element={
            <ProtectedRoute>
              <Layout><RequestDonation /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/donate/:requestId" 
          element={
            <ProtectedRoute>
              <Layout><DonateToRequest /></Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Portal Routes - Public Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes (No Layout - Separate Admin UI) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        
        <Route 
          path="/admin/donation-requests" 
          element={
            <ProtectedAdminRoute>
              <AdminDonationRequests />
            </ProtectedAdminRoute>
          } 
        />
        
        <Route 
          path="/admin/books" 
          element={
            <ProtectedAdminRoute>
              <AdminBooks />
            </ProtectedAdminRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          } 
        />
      </Routes>

      {/* AI Assistant - only when logged in AND not on auth/splash/admin routes */}
      {shouldShowAssistant && <BookAssistant />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
