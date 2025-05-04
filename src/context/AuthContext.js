import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase'; // Import Firebase
import { onAuthStateChanged } from 'firebase/auth';

// Create a context to store the authentication state
export const AuthContext = createContext();

// Create a custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Set up Firebase listener to check user state (logged in or logged out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update currentUser when authentication state changes
    });

    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
