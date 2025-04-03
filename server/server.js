const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug environment variables (don't log JWT_SECRET in production)
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/period-tracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./routes/users');
const periodRoutes = require('./routes/periods');
const articleRoutes = require('./routes/articles');
const moodRoutes = require('./routes/moods');

app.use('/api/users', userRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/moods', moodRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Period Tracker API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 