import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './components/Splash';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/location" element={<LocationPermission />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-login" element={<EmailLogin />} />
        <Route path="/phone-login" element={<PhoneLogin />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/categories" element={<Layout><BookCategories /></Layout>} />
        <Route path="/syllabus/:category" element={<Layout><SyllabusList /></Layout>} />
        <Route path="/books/:syllabus" element={<Layout><BookList /></Layout>} />
        <Route path="/book/:bookId" element={<Layout><BookDetails /></Layout>} />
        <Route path="/sell" element={<Layout><SellBooks /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;