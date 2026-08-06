const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { getModels } = require('../config/db');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const { User } = getModels();

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isApproved = (role === 'reporter' || role === 'admin');

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'reporter',
      isApproved,
      volunteerDetails: {
        rating: 5.0,
        completedCount: 0,
        status: 'active'
      }
    });

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'resqpaws_secret_key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture || ''
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { User } = getModels();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'resqpaws_secret_key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture || '',
            volunteerDetails: user.volunteerDetails || null
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  const { User } = getModels();
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toObject());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, email, profilePicture } = req.body;
  const { User } = getModels();
  try {
    const updates = { name, email, profilePicture };
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture || '',
      volunteerDetails: updatedUser.volunteerDetails || null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/users
// @desc    Get all users (Admin only)
// @access  Private
router.get('/users', auth, async (req, res) => {
  const { User } = getModels();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const users = await User.find({});
    // Remove passwords from response
    const usersResponse = users.map(u => {
      const uObj = { ...u };
      delete uObj.password;
      return uObj;
    });
    res.json(usersResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/auth/users/:id
// @desc    Delete a user account (Admin only)
// @access  Private
router.delete('/users/:id', auth, async (req, res) => {
  const { User } = getModels();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/users/:id/approve
// @desc    Approve a volunteer or NGO account (Admin only)
// @access  Private
router.put('/users/:id/approve', auth, async (req, res) => {
  const { User } = getModels();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/users
// @desc    Create a user account directly (Admin only)
// @access  Private
router.post('/users', auth, async (req, res) => {
  const { User } = getModels();
  const { name, email, password, role, ngoDetails } = req.body;
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: true,
      ngoDetails: role === 'ngo' ? ngoDetails : undefined,
      volunteerDetails: role === 'volunteer' ? { rating: 5.0, completedCount: 0, status: 'active' } : undefined
    });
    res.json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
