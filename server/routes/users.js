const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Register API called with body:', req.body);
    const { name, email, password, dateOfBirth } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user with username for backward compatibility
    user = new User({
      name,
      username: name, // Set username to be the same as name for new users
      email,
      password,
      dateOfBirth
    });

    console.log('About to save new user:', { name, email, dateOfBirth });
    await user.save();
    console.log('User saved successfully with ID:', user.id);

    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          throw err;
        }
        console.log('JWT created successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login API called with email:', req.body.email);
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    console.log('User found with ID:', user.id);

    // Check password using synchronous method
    console.log('Checking password...');
    const isMatch = user.comparePassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          throw err;
        }
        console.log('JWT created successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { name, dateOfBirth, weight, waterIntake } = req.body;
    
    const updatedUser = {};
    if (name) updatedUser.name = name;
    if (dateOfBirth) updatedUser.dateOfBirth = dateOfBirth;
    if (weight) updatedUser.weight = weight;
    if (waterIntake) updatedUser.waterIntake = waterIntake;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedUser },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 