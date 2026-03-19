import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserProfile, UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  profile: UserProfile | null;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, profile, allowedRoles }) => {
  if (!profile) return <Navigate to="/login" />;
  
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
