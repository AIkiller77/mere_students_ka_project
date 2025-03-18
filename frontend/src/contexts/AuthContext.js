import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/users/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      navigate('/dashboard');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'An error occurred during login');
      return false;
    }
  };

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post('/api/users/register', userData);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      navigate('/dashboard');
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'An error occurred during registration');
      return false;
    }
  };

  // Login with Web3 wallet
  const loginWithWeb3 = async (address, signature) => {
    setError(null);
    try {
      const response = await axios.post('/api/users/web3/login', {
        wallet_address: address,
        signature
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setCurrentUser(user);
      navigate('/dashboard');
      return true;
    } catch (err) {
      console.error('Web3 login error:', err);
      setError(err.response?.data?.detail || 'An error occurred during Web3 login');
      return false;
    }
  };

  // Logout the user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/me', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
      return true;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.detail || 'An error occurred while updating your profile');
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    loginWithWeb3,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
