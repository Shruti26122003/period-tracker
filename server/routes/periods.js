const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Period = require('../models/Period');

// @route   POST api/periods
// @desc    Add a new period
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, symptoms, notes } = req.body;

    const newPeriod = new Period({
      user: req.user.id,
      startDate,
      endDate,
      symptoms,
      notes
    });

    const period = await newPeriod.save();
    res.json(period);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/periods
// @desc    Get all periods for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const periods = await Period.find({ user: req.user.id }).sort({ startDate: -1 });
    res.json(periods);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/periods/:id
// @desc    Get period by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const period = await Period.findById(req.params.id);

    if (!period) {
      return res.status(404).json({ msg: 'Period not found' });
    }

    // Check user ownership
    if (period.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(period);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Period not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/periods/:id
// @desc    Update a period
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { startDate, endDate, symptoms, notes } = req.body;

    let period = await Period.findById(req.params.id);

    if (!period) {
      return res.status(404).json({ msg: 'Period not found' });
    }

    // Check user ownership
    if (period.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Build period object
    const periodFields = {};
    if (startDate) periodFields.startDate = startDate;
    if (endDate) periodFields.endDate = endDate;
    if (symptoms) periodFields.symptoms = symptoms;
    if (notes) periodFields.notes = notes;

    // Update
    period = await Period.findByIdAndUpdate(
      req.params.id,
      { $set: periodFields },
      { new: true }
    );

    res.json(period);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Period not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/periods/:id
// @desc    Delete a period
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const period = await Period.findById(req.params.id);

    if (!period) {
      return res.status(404).json({ msg: 'Period not found' });
    }

    // Check user ownership
    if (period.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await period.remove();
    res.json({ msg: 'Period removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Period not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/periods/stats
// @desc    Get period statistics
// @access  Private
router.get('/stats/cycle', auth, async (req, res) => {
  try {
    const periods = await Period.find({ user: req.user.id }).sort({ startDate: 1 });
    
    // Calculate cycle and period lengths
    if (periods.length < 2) {
      return res.status(400).json({ msg: 'Not enough period data to calculate stats' });
    }

    const cycles = [];
    const periodLengths = [];

    for (let i = 0; i < periods.length; i++) {
      if (periods[i].endDate) {
        const periodLength = Math.floor((new Date(periods[i].endDate) - new Date(periods[i].startDate)) / (1000 * 60 * 60 * 24)) + 1;
        periodLengths.push(periodLength);
      }

      if (i < periods.length - 1) {
        const cycleLength = Math.floor((new Date(periods[i + 1].startDate) - new Date(periods[i].startDate)) / (1000 * 60 * 60 * 24));
        cycles.push(cycleLength);
      }
    }

    const avgCycleLength = cycles.length > 0 ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : 0;
    const avgPeriodLength = periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : 0;

    // Predict next period
    let nextPeriod = null;
    if (periods.length > 0 && avgCycleLength > 0) {
      const lastPeriod = periods[periods.length - 1];
      const lastStart = new Date(lastPeriod.startDate);
      const nextStart = new Date(lastStart);
      nextStart.setDate(nextStart.getDate() + avgCycleLength);
      
      nextPeriod = {
        predictedStartDate: nextStart,
        predictedEndDate: new Date(new Date(nextStart).setDate(nextStart.getDate() + avgPeriodLength - 1))
      };
    }

    res.json({
      cycles,
      periodLengths,
      avgCycleLength,
      avgPeriodLength,
      nextPeriod
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 