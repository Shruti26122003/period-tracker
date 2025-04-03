const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mood = require('../models/Mood');

// @route   POST api/moods
// @desc    Add a new mood
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { date, mood, intensity, notes } = req.body;

    const newMood = new Mood({
      user: req.user.id,
      date: date || Date.now(),
      mood,
      intensity,
      notes
    });

    const savedMood = await newMood.save();
    res.json(savedMood);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/moods
// @desc    Get all moods for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user.id }).sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/moods/:id
// @desc    Get mood by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }

    // Check user ownership
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(mood);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/moods/:id
// @desc    Update a mood
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, mood, intensity, notes } = req.body;

    let moodEntry = await Mood.findById(req.params.id);

    if (!moodEntry) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }

    // Check user ownership
    if (moodEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Build mood object
    const moodFields = {};
    if (date) moodFields.date = date;
    if (mood) moodFields.mood = mood;
    if (intensity) moodFields.intensity = intensity;
    if (notes) moodFields.notes = notes;

    // Update
    moodEntry = await Mood.findByIdAndUpdate(
      req.params.id,
      { $set: moodFields },
      { new: true }
    );

    res.json(moodEntry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/moods/:id
// @desc    Delete a mood
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }

    // Check user ownership
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await mood.remove();
    res.json({ msg: 'Mood entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/moods/stats/monthly
// @desc    Get monthly mood statistics
// @access  Private
router.get('/stats/monthly', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user.id });
    
    // Group moods by month
    const moodsByMonth = {};
    
    moods.forEach(mood => {
      const date = new Date(mood.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!moodsByMonth[monthYear]) {
        moodsByMonth[monthYear] = [];
      }
      
      moodsByMonth[monthYear].push(mood);
    });
    
    // Calculate stats for each month
    const monthlyStats = {};
    
    for (const [month, monthMoods] of Object.entries(moodsByMonth)) {
      const moodCounts = {};
      let totalIntensity = 0;
      let intensityCount = 0;
      
      monthMoods.forEach(mood => {
        if (!moodCounts[mood.mood]) {
          moodCounts[mood.mood] = 0;
        }
        
        moodCounts[mood.mood]++;
        
        if (mood.intensity) {
          totalIntensity += mood.intensity;
          intensityCount++;
        }
      });
      
      const avgIntensity = intensityCount > 0 ? totalIntensity / intensityCount : 0;
      
      monthlyStats[month] = {
        moodCounts,
        totalEntries: monthMoods.length,
        avgIntensity
      };
    }
    
    res.json(monthlyStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 