import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use useAuth hook

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Use useAuth to get currentUser

  if (!currentUser) {
    // Redirect to login page if the user is not logged in
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
