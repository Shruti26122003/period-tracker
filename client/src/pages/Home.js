import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home-container">
      <header>
        <h1>Period Tracker</h1>
        <p>Track, understand, and optimize your menstrual health</p>
      </header>

      <section className="features">
        <div className="feature">
          <h2>Track Your Cycle</h2>
          <p>Log your period dates, symptoms, and more to understand your body better.</p>
        </div>
        <div className="feature">
          <h2>Predict Future Cycles</h2>
          <p>Get predictions for your next period, ovulation, and fertile windows.</p>
        </div>
        <div className="feature">
          <h2>Monitor Your Mood</h2>
          <p>Track how you feel throughout your cycle to identify patterns.</p>
        </div>
        <div className="feature">
          <h2>Learn with Articles</h2>
          <p>Read expert articles about menstrual health and well-being.</p>
        </div>
      </section>

      <section className="cta">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Sign Up</Link>
          </div>
        )}
      </section>

      <footer>
        <p>&copy; {new Date().getFullYear()} Period Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home; 