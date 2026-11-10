import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS } from '../../utils/constants';

const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (loading) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || 
                sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  
  // If user is authenticated, redirect to home or specified redirect
  if (token && isAuthenticated) {
    // Check if there's a redirect location in state
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
