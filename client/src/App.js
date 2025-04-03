import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Context
import { AuthContext } from './context/AuthContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set Auth header
          axios.defaults.headers.common['x-auth-token'] = token;
          
          const res = await axios.get('http://localhost:5000/api/users/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          // Invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      console.log('Login response:', res.data);
      setAuthToken(res.data.token);
      
      const userRes = await axios.get('http://localhost:5000/api/users/me');
      console.log('User data response:', userRes.data);
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      return false;
    }
  };

  // Register
  const register = async (name, email, password, dateOfBirth) => {
    try {
      console.log('Register attempt for:', email);
      const res = await axios.post('http://localhost:5000/api/users/register', { 
        name, 
        email, 
        password,
        dateOfBirth
      });
      
      console.log('Register response:', res.data);
      setAuthToken(res.data.token);
      
      const userRes = await axios.get('http://localhost:5000/api/users/me');
      console.log('User data response:', userRes.data);
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Register error:', err.response ? err.response.data : err.message);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Protected route
  const PrivateRoute = ({ children }) => {
    if (isLoading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        register, 
        logout 
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
