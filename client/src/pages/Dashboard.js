import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Dashboard sub-pages
import PeriodTracker from '../components/PeriodTracker';
import Articles from '../components/Articles';
import MoodTracker from '../components/MoodTracker';
import Profile from '../components/Profile';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/me');
        setUserData(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-greeting">
          <h2>{greeting()}, {userData.name || 'User'}!</h2>
          <p>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="header-actions">
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <NavLink to="/dashboard" end>
            Period Tracker
          </NavLink>
          <NavLink to="/dashboard/articles">
            Articles
          </NavLink>
          <NavLink to="/dashboard/mood">
            Mood Tracker
          </NavLink>
          <NavLink to="/dashboard/profile">
            Profile
          </NavLink>
        </nav>

        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<PeriodTracker />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/profile" element={<Profile userData={userData} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 