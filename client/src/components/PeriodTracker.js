import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PeriodTracker = () => {
  const [periods, setPeriods] = useState([]);
  const [cycleStats, setCycleStats] = useState(null);
  const [newPeriod, setNewPeriod] = useState({
    startDate: '',
    endDate: '',
    symptoms: [],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // List of common symptoms
  const symptomOptions = [
    'Cramps', 'Headache', 'Bloating', 'Fatigue', 
    'Mood Swings', 'Breast Tenderness', 'Acne', 'Backache'
  ];

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/periods');
        setPeriods(res.data);
        
        // Only fetch stats if we have periods
        if (res.data.length > 0) {
          try {
            const statsRes = await axios.get('http://localhost:5000/api/periods/stats/cycle');
            setCycleStats(statsRes.data);
          } catch (err) {
            console.error('Error fetching cycle stats:', err);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching periods:', err);
        setError('Failed to load period data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  const handleInputChange = (e) => {
    setNewPeriod({
      ...newPeriod,
      [e.target.name]: e.target.value
    });
  };

  const handleSymptomChange = (symptom) => {
    const updatedSymptoms = [...newPeriod.symptoms];
    
    if (updatedSymptoms.includes(symptom)) {
      const index = updatedSymptoms.indexOf(symptom);
      updatedSymptoms.splice(index, 1);
    } else {
      updatedSymptoms.push(symptom);
    }
    
    setNewPeriod({
      ...newPeriod,
      symptoms: updatedSymptoms
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://localhost:5000/api/periods', newPeriod);
      
      // Refresh periods
      const res = await axios.get('http://localhost:5000/api/periods');
      setPeriods(res.data);
      
      // Reset form
      setNewPeriod({
        startDate: '',
        endDate: '',
        symptoms: [],
        notes: ''
      });
      
      // Refresh cycle stats
      if (res.data.length > 0) {
        try {
          const statsRes = await axios.get('http://localhost:5000/api/periods/stats/cycle');
          setCycleStats(statsRes.data);
        } catch (err) {
          console.error('Error fetching cycle stats:', err);
        }
      }
    } catch (err) {
      console.error('Error adding period:', err);
      setError('Failed to add period. Please try again.');
    }
  };

  // Calculate the current cycle day
  const getCurrentCycleDay = () => {
    if (!periods || periods.length === 0 || !cycleStats) return null;
    
    const lastPeriod = periods[0]; // Assuming periods are sorted by startDate in descending order
    const lastPeriodStart = new Date(lastPeriod.startDate);
    const today = new Date();
    
    // Days since last period started
    const daysSinceStart = Math.floor((today - lastPeriodStart) / (1000 * 60 * 60 * 24));
    
    // If we're within the average period length, we're on our period
    if (daysSinceStart < cycleStats.avgPeriodLength) {
      return {
        day: daysSinceStart + 1,
        status: 'Period',
        message: 'You are on your period.'
      };
    }
    
    // Otherwise, we're in the cycle
    const cycleDay = (daysSinceStart % cycleStats.avgCycleLength) + 1;
    
    // Determine fertility status (simplified)
    let status = 'Regular';
    let message = 'Low chance to get pregnant';
    
    // Ovulation is typically around the middle of the cycle
    const ovulationDay = Math.floor(cycleStats.avgCycleLength / 2);
    
    // Fertile window is typically 5 days before ovulation and the day of ovulation
    if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay) {
      status = 'Fertile';
      message = 'Higher chance to get pregnant';
    }
    
    return {
      day: cycleDay,
      status,
      message
    };
  };

  const currentCycle = getCurrentCycleDay();

  // Prepare chart data
  const chartData = {
    labels: periods.map(period => new Date(period.startDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Cycle Length (days)',
        data: cycleStats ? cycleStats.cycles : [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cycle Length History',
      },
    },
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="period-tracker">
      <h2>Period Tracker</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {currentCycle && (
        <div className="cycle-status">
          <div className="cycle-day">
            <div className="day-number">{currentCycle.day}</div>
            <div className="day-label">Day</div>
          </div>
          <div className="cycle-info">
            <h3>Period in, {currentCycle.status}</h3>
            <p>{currentCycle.message}</p>
          </div>
        </div>
      )}
      
      {cycleStats && (
        <div className="cycle-stats">
          <h3>Cycle Information</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Average Cycle Length:</span>
              <span className="stat-value">{cycleStats.avgCycleLength} days</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Period Length:</span>
              <span className="stat-value">{cycleStats.avgPeriodLength} days</span>
            </div>
          </div>
          
          {cycleStats.nextPeriod && (
            <div className="next-period">
              <h4>Next Period Prediction</h4>
              <p>Expected to start on: {new Date(cycleStats.nextPeriod.predictedStartDate).toLocaleDateString()}</p>
            </div>
          )}
          
          <div className="cycle-chart">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      )}
      
      <div className="period-form-container">
        <h3>Log New Period</h3>
        <form onSubmit={handleSubmit} className="period-form">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={newPeriod.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={newPeriod.endDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Symptoms (Select all that apply)</label>
            <div className="symptoms-grid">
              {symptomOptions.map(symptom => (
                <div key={symptom} className="symptom-checkbox">
                  <input
                    type="checkbox"
                    id={`symptom-${symptom}`}
                    checked={newPeriod.symptoms.includes(symptom)}
                    onChange={() => handleSymptomChange(symptom)}
                  />
                  <label htmlFor={`symptom-${symptom}`}>{symptom}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={newPeriod.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary">Log Period</button>
        </form>
      </div>
      
      <div className="period-history">
        <h3>Period History</h3>
        {periods.length === 0 ? (
          <p>No periods logged yet. Add your first period above.</p>
        ) : (
          <div className="period-list">
            {periods.map(period => (
              <div key={period._id} className="period-item">
                <div className="period-date">
                  <strong>Start:</strong> {new Date(period.startDate).toLocaleDateString()}
                  {period.endDate && (
                    <span>
                      <strong> End:</strong> {new Date(period.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {period.symptoms && period.symptoms.length > 0 && (
                  <div className="period-symptoms">
                    <strong>Symptoms:</strong> {period.symptoms.join(', ')}
                  </div>
                )}
                
                {period.notes && (
                  <div className="period-notes">
                    <strong>Notes:</strong> {period.notes}
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

export default PeriodTracker; 