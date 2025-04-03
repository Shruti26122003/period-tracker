const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'anxious', 'calm', 'energetic', 'tired', 'irritable'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Mood', MoodSchema); 