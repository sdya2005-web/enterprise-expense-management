import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: jwtToken, ...userInfo } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const quickDemoSwitch = async (roleName) => {
    const credentials = {
      ADMIN: { email: 'admin@enterprise.com', password: 'admin123' },
      MANAGER: { email: 'manager@enterprise.com', password: 'manager123' },
      FINANCE: { email: 'finance@enterprise.com', password: 'finance123' },
      EMPLOYEE: { email: 'employee@enterprise.com', password: 'employee123' }
    };

    const target = credentials[roleName] || credentials.ADMIN;
    return await login(target.email, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoSwitch,
        isAdmin: user?.role === 'ROLE_ADMIN',
        isManager: user?.role === 'ROLE_MANAGER',
        isFinance: user?.role === 'ROLE_FINANCE',
        isEmployee: user?.role === 'ROLE_EMPLOYEE',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
