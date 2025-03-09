import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Configure default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  const login = async (email, password) => {
    try {
      setError(null);
      const { token, user } = await authService.login(email, password);
      
      // Store token and configure axios
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };
  
  const register = async (data) => {
    try {
      setError(null);
      const response = await authService.register(data);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };
  
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };
  
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await authService.forgotPassword(email);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };
  
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await authService.resetPassword(token, password);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};