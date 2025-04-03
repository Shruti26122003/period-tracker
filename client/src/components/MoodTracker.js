import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [newMood, setNewMood] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: '',
    intensity: 5,
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Available mood options
  const moodOptions = [
    { name: 'happy', emoji: '😊', color: '#FFD700' },
    { name: 'sad', emoji: '😢', color: '#6495ED' },
    { name: 'angry', emoji: '😠', color: '#FF6347' },
    { name: 'anxious', emoji: '😰', color: '#9370DB' },
    { name: 'calm', emoji: '😌', color: '#98FB98' },
    { name: 'energetic', emoji: '⚡', color: '#FF69B4' },
    { name: 'tired', emoji: '😴', color: '#808080' },
    { name: 'irritable', emoji: '😤', color: '#FF7F50' }
  ];

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/moods');
        setMoods(res.data);
        
        // Get mood statistics
        try {
          const statsRes = await axios.get('http://localhost:5000/api/moods/stats/monthly');
          setMoodStats(statsRes.data);
        } catch (err) {
          console.error('Error fetching mood stats:', err);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching moods:', err);
        setError('Failed to load mood data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMoods();
  }, []);

  const handleInputChange = (e) => {
    setNewMood({
      ...newMood,
      [e.target.name]: e.target.value
    });
  };

  const handleMoodSelect = (mood) => {
    setNewMood({
      ...newMood,
      mood
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMood.mood) {
      setError('Please select a mood');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/moods', newMood);
      
      // Refresh moods
      const res = await axios.get('http://localhost:5000/api/moods');
      setMoods(res.data);
      
      // Reset form (but keep today's date)
      setNewMood({
        date: new Date().toISOString().split('T')[0],
        mood: '',
        intensity: 5,
        notes: ''
      });
      
      // Refresh stats
      try {
        const statsRes = await axios.get('http://localhost:5000/api/moods/stats/monthly');
        setMoodStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching mood stats:', err);
      }
      
      setError('');
    } catch (err) {
      console.error('Error adding mood:', err);
      setError('Failed to add mood. Please try again.');
    }
  };

  // Get emoji for mood name
  const getMoodEmoji = (moodName) => {
    const mood = moodOptions.find(m => m.name === moodName);
    return mood ? mood.emoji : '❓';
  };

  // Get color for mood name
  const getMoodColor = (moodName) => {
    const mood = moodOptions.find(m => m.name === moodName);
    return mood ? mood.color : '#CCCCCC';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Prepare chart data (if stats available)
  const chartData = moodStats ? {
    labels: Object.keys(moodStats).map(month => {
      const [m, y] = month.split('-');
      return `${m}/${y}`;
    }),
    datasets: moodOptions.map(mood => ({
      label: mood.name.charAt(0).toUpperCase() + mood.name.slice(1),
      data: Object.values(moodStats).map(monthData => 
        monthData.moodCounts[mood.name] || 0
      ),
      backgroundColor: mood.color
    }))
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Mood Distribution',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Sweet message based on most frequent mood today
  const getSweetMessage = () => {
    if (moods.length === 0) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayMoods = moods.filter(m => m.date.startsWith(today));
    
    if (todayMoods.length === 0) return null;
    
    // Count moods
    const moodCounts = {};
    todayMoods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    
    // Find most frequent
    let mostFrequentMood = null;
    let highestCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > highestCount) {
        mostFrequentMood = mood;
        highestCount = count;
      }
    });
    
    if (!mostFrequentMood) return null;
    
    // Return message based on mood
    switch (mostFrequentMood) {
      case 'happy':
        return "Your happiness lights up the room! Keep that positive energy flowing!";
      case 'sad':
        return "It's okay to feel down sometimes. Be gentle with yourself today.";
      case 'angry':
        return "Take a deep breath. Tomorrow is a new day with fresh opportunities.";
      case 'anxious':
        return "Remember to breathe deeply. This feeling will pass, and you've got this!";
      case 'calm':
        return "Your peaceful energy is your superpower. Enjoy this tranquil state.";
      case 'energetic':
        return "Channel that amazing energy into something you love today!";
      case 'tired':
        return "Rest is important! Give yourself permission to recharge.";
      case 'irritable':
        return "It's a tough day. Try a short walk or some music to reset.";
      default:
        return "Your feelings are valid, whatever they may be today.";
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="mood-tracker">
      <h2>Mood Tracker</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="sweet-message">
        {getSweetMessage() && (
          <div className="message-card">
            <h3>Today's Message</h3>
            <p>{getSweetMessage()}</p>
          </div>
        )}
      </div>
      
      <div className="mood-form-container">
        <h3>How are you feeling today?</h3>
        <form onSubmit={handleSubmit} className="mood-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={newMood.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mood</label>
            <div className="mood-selector">
              {moodOptions.map(option => (
                <button
                  key={option.name}
                  type="button"
                  className={`mood-option ${newMood.mood === option.name ? 'selected' : ''}`}
                  onClick={() => handleMoodSelect(option.name)}
                  style={{ backgroundColor: newMood.mood === option.name ? option.color : 'transparent' }}
                >
                  <span className="mood-emoji">{option.emoji}</span>
                  <span className="mood-name">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="intensity">Intensity (1-10)</label>
            <input
              type="range"
              id="intensity"
              name="intensity"
              min="1"
              max="10"
              value={newMood.intensity}
              onChange={handleInputChange}
            />
            <div className="intensity-value">{newMood.intensity}</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={newMood.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about your mood..."
            ></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary">Log Mood</button>
        </form>
      </div>
      
      {chartData && (
        <div className="mood-stats">
          <h3>Mood Statistics</h3>
          <div className="chart-container">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>
      )}
      
      <div className="mood-history">
        <h3>Recent Moods</h3>
        {moods.length === 0 ? (
          <p>No moods logged yet. Add your first mood above.</p>
        ) : (
          <div className="mood-list">
            {moods.slice(0, 10).map(mood => (
              <div 
                key={mood._id} 
                className="mood-item"
                style={{ borderLeft: `4px solid ${getMoodColor(mood.mood)}` }}
              >
                <div className="mood-header">
                  <span className="mood-date">{formatDate(mood.date)}</span>
                  <span className="mood-emoji-display">
                    {getMoodEmoji(mood.mood)} 
                    <span className="mood-name-display">
                      {mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}
                    </span>
                  </span>
                </div>
                
                {mood.intensity && (
                  <div className="mood-intensity">
                    Intensity: {mood.intensity}/10
                  </div>
                )}
                
                {mood.notes && (
                  <div className="mood-notes">
                    {mood.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker; 