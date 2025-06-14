import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login\" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;