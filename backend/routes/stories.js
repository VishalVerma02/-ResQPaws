const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getModels } = require('../config/db');

// @route   GET api/stories
// @desc    Get all success stories
// @access  Public
router.get('/', async (req, res) => {
  const { SuccessStory } = getModels();
  try {
    const stories = await SuccessStory.find({});
    // Return sorted by date descending if available
    const sorted = [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/stories
// @desc    Create a new success story
// @access  Private (NGO, Volunteer, or Admin only)
router.post('/', auth, async (req, res) => {
  const { SuccessStory } = getModels();
  const { animalName, beforeImage, afterImage, description, status } = req.body;

  if (!animalName || !beforeImage || !afterImage || !description) {
    return res.status(400).json({ message: 'Please provide animalName, beforeImage, afterImage, and description.' });
  }

  try {
    const newStory = await SuccessStory.create({
      animalName,
      beforeImage,
      afterImage,
      description,
      status: status || 'Adopted ❤️',
      authorName: req.user.name || 'Rescue Team',
      createdAt: new Date().toISOString()
    });

    res.json(newStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/stories/:id
// @desc    Delete a success story
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  const { SuccessStory } = getModels();
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const story = await SuccessStory.deleteOne({ _id: req.params.id });
    res.json({ message: 'Success story deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
