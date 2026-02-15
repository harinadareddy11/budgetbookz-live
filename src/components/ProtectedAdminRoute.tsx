import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {LoadingSpinner} from './LoadingSpinner';

const ADMIN_EMAILS = ['admin@budgetbookz.com', 'harinadareddy11.1@gmail.com'];

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { currentUser, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  // Show loading spinner while checking auth
  if (checking || loading) {
    return <LoadingSpinner message="Checking admin access..." fullScreen />;
  }

  // Not logged in - redirect to admin login
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin - redirect to home with alert
  if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
    alert('Access denied. You are not authorized as an admin.');
    return <Navigate to="/" replace />;
  }

  // Authorized admin - render the protected component
  return <>{children}</>;
}
