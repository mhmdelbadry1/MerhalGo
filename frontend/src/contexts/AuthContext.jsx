import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer', 'company', 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('mirhal_user');
    const savedUserType = localStorage.getItem('mirhal_user_type');
    const token = localStorage.getItem('mirhal_access_token');
    
    if (savedUser && savedUserType && token) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
      
      // Optionally verify token by fetching current user
      authService.getCurrentUser()
        .then(response => {
          setUser(response.data);
          setUserType(response.data.role);
          localStorage.setItem('mirhal_user', JSON.stringify(response.data));
          localStorage.setItem('mirhal_user_type', response.data.role);
        })
        .catch(() => {
          // Token invalid, clear everything
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Check if verification is required
      const responseData = response.data || {};
      if (responseData.requiresVerification || response.requiresVerification) {
        return response; // Return early, don't try to login
      }

      // If no verification required (e.g. invited user), auto-login
      const loginResponse = await authService.login(userData.email, userData.password);
      setUser(loginResponse.user);
      setUserType(loginResponse.user.role);
      return { success: true, data: loginResponse };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setUserType(response.user.role);
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserType(null);
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('mirhal_user', JSON.stringify(newUser));
  };

  const value = {
    user,
    userType,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

