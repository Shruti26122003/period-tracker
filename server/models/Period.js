const mongoose = require('mongoose');

const PeriodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  cycleLength: {
    type: Number
  },
  periodLength: {
    type: Number
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Period', PeriodSchema); 