import React, { useState } from 'react';
import axios from 'axios';

const Profile = ({ userData }) => {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
    weight: userData.weight || '',
    waterIntake: userData.waterIntake || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { name, dateOfBirth, weight, waterIntake } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const res = await axios.put('http://localhost:5000/api/users/me', formData);
      
      setMessage('Profile updated successfully');
      setIsEditing(false);
      
      // Update the form data with the response
      setFormData({
        name: res.data.name || '',
        dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : '',
        weight: res.data.weight || '',
        waterIntake: res.data.waterIntake || ''
      });
      
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update profile');
      
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return 'Unknown';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="profile">
      <h2>User Profile</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {isEditing ? (
        <form onSubmit={onSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={dateOfBirth}
              onChange={onChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={weight}
              onChange={onChange}
              placeholder="Enter your weight in kg"
              min="20"
              max="300"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="waterIntake">Daily Water Intake (ml)</label>
            <input
              type="number"
              id="waterIntake"
              name="waterIntake"
              value={waterIntake}
              onChange={onChange}
              placeholder="Enter your daily water intake"
              min="0"
              max="5000"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(false);
                // Reset form data to original values
                setFormData({
                  name: userData.name || '',
                  dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                  weight: userData.weight || '',
                  waterIntake: userData.waterIntake || ''
                });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{userData.name || 'Not set'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData.email}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Date of Birth:</span>
              <span className="info-value">{formatDate(userData.dateOfBirth)}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Age:</span>
              <span className="info-value">{calculateAge(userData.dateOfBirth)} years</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Weight:</span>
              <span className="info-value">{userData.weight ? `${userData.weight} kg` : 'Not set'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Water Intake:</span>
              <span className="info-value">{userData.waterIntake ? `${userData.waterIntake} ml` : 'Not set'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Account Created:</span>
              <span className="info-value">{formatDate(userData.createdAt)}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 