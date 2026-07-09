import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cityfix_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile();
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('cityfix_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('cityfix_token', token);
      setToken(token);
      setUser(user);
      return user;
    } catch (error) {
      toast.error(error.extractedMessage || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('cityfix_token', token);
      setToken(token);
      setUser(user);
      return user;
    } catch (error) {
      toast.error(error.extractedMessage || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cityfix_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateContextUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateContextUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
