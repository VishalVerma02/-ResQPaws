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
    let stories = await SuccessStory.find({});
    if (!Array.isArray(stories)) stories = [];

    // Ensure at least 6 stories are present to maintain a 3x2 symmetrical grid
    if (stories.length < 6) {
      const seeds = [
        {
          _id: '645f9a23f12a3b001c900021',
          animalName: 'Bruno',
          beforeImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
          description: 'Bruno was found on Noida Expressway with severe dehydration and leg fracture. NGO and volunteers rescued him, operated, and he has now been adopted by a loving family!',
          status: 'Adopted ❤️',
          authorName: 'Happy Paws NGO',
          createdAt: new Date('2025-06-01T12:00:00Z').toISOString()
        },
        {
          _id: '645f9a23f12a3b001c900022',
          animalName: 'Bella',
          beforeImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400',
          description: 'Bella the kitten was trapped in a deep storm pipe for 2 days. Volunteers retrieved her and nurtured her. She is now healthy and adopted.',
          status: 'Adopted ❤️',
          authorName: 'Rahul Singh (Volunteer)',
          createdAt: new Date('2025-06-15T15:30:00Z').toISOString()
        },
        {
          _id: '645f9a23f12a3b001c900023',
          animalName: 'Rocky',
          beforeImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=400',
          description: 'Rocky was spotted near a construction site with severe heatstroke. ResQ Paws team arrived promptly, provided IV fluids, and placed him in foster care.',
          status: 'Adopted ❤️',
          authorName: 'ResQ Paws Team',
          createdAt: new Date('2025-07-02T09:15:00Z').toISOString()
        },
        {
          _id: '645f9a23f12a3b001c900024',
          animalName: 'Milo',
          beforeImage: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=400',
          description: 'Milo the parrot was rescued from tangled kite string in Sector 15. After wing rehabilitation by avian specialists, Milo was safely released back into nature.',
          status: 'Healthy & Released 🐾',
          authorName: 'Happy Paws NGO',
          createdAt: new Date('2025-07-10T14:20:00Z').toISOString()
        },
        {
          _id: '645f9a23f12a3b001c900025',
          animalName: 'Charlie',
          beforeImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
          description: 'Charlie was found shivering during monsoon rains in Greater Noida with a high fever. ResQ Paws volunteers sheltered him, completed treatment & vaccination, and he is now adopted!',
          status: 'Adopted ❤️',
          authorName: 'ResQ Paws Team',
          createdAt: new Date('2025-08-01T10:00:00Z').toISOString()
        },
        {
          _id: '645f9a23f12a3b001c900026',
          animalName: 'Coco',
          beforeImage: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400',
          afterImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
          description: 'Coco the Persian cat was rescued from an abandoned warehouse with an eye injury. After emergency surgery by our partner vet clinic, Coco made a 100% recovery!',
          status: 'Adopted ❤️',
          authorName: 'Paws Welfare NGO',
          createdAt: new Date('2025-08-12T16:45:00Z').toISOString()
        }
      ];

      seeds.forEach(s => {
        if (stories.length < 6 && !stories.some(item => item._id === s._id || item.animalName === s.animalName)) {
          stories.push(s);
        }
      });
    }

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
