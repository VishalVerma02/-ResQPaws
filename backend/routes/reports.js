const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { getModels } = require('../config/db');

// Setup multer storage for animal images
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'));
  }
});

// Helper to generate mock distance
const generateMockDistance = () => {
  const distances = ['1.2 km away', '2.5 km away', '3.1 km away', '5.6 km away', '0.8 km away', '4.3 km away'];
  return distances[Math.floor(Math.random() * distances.length)];
};

// @route   POST api/reports
// @desc    Submit an animal report
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { animalType, condition, location, address, description, priority } = req.body;
  const { Report } = getModels();

  try {
    let imageUrl = '';
    if (req.file) {
      // Return local server URL path
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      // Default cute animal image placeholder
      imageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
    }

    let latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

    // Fallback coordinates based on parsed cities if not provided
    if (!latitude || !longitude) {
      const loc = location.toLowerCase();
      if (loc.includes('noida')) {
        latitude = 28.5706; longitude = 77.3272;
      } else if (loc.includes('delhi')) {
        latitude = 28.6139; longitude = 77.2090;
      } else if (loc.includes('jaipur')) {
        latitude = 26.9124; longitude = 75.7873;
      } else if (loc.includes('lucknow')) {
        latitude = 26.8467; longitude = 80.9462;
      } else {
        // Fallback Delhi
        latitude = 28.6139; longitude = 77.2090;
      }
    }

    const report = await Report.create({
      reporterId: req.user.id,
      reporterName: req.user.name,
      animalType,
      condition,
      location,
      address: address || '',
      description,
      imageUrl,
      priority: priority || 'medium',
      status: 'reported',
      distance: generateMockDistance(),
      latitude,
      longitude
    });

    res.status(201).json(report);
  } catch (err) {
    console.error('Create report error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports
// @desc    Get all reports with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  const { Report } = getModels();
  const { role, id: userId } = req.user;
  const { status, filter } = req.query;

  try {
    let query = {};

    // Apply role-based visibility rules or query-params
    if (role === 'reporter') {
      // Reporters see their own reports by default
      query.reporterId = userId;
    } else if (role === 'volunteer') {
      // Volunteers can filter
      if (filter === 'available') {
        query.status = 'reported';
      } else if (filter === 'accepted') {
        query.status = 'accepted';
        query.volunteerId = userId;
      } else if (filter === 'completed') {
        query.status = 'completed';
        query.volunteerId = userId;
      }
    } else if (role === 'ngo') {
      // NGOs can filter
      if (filter === 'available') {
        query.status = 'reported';
      } else if (filter === 'accepted') {
        query.status = 'accepted';
        query.ngoId = userId;
      } else if (filter === 'completed') {
        query.status = 'completed';
        query.ngoId = userId;
      }
    }

    // Explicit status query parameter overrides role defaults if specified
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query);

    // Sort reports: newer first
    reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/:id
// @desc    Get report by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const { Report } = getModels();
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('Get report detail error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reports/:id/action
// @desc    Perform status action on report (accept, complete, cancel)
// @access  Private
router.put('/:id/action', auth, async (req, res) => {
  const { action } = req.body;
  const { Report, User } = getModels();
  const reportId = req.params.id;

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let updates = {};

    if (action === 'accept') {
      if (req.user.role !== 'volunteer') {
        return res.status(403).json({ message: 'Only volunteers can accept reports' });
      }
      if (report.status !== 'reported') {
        return res.status(400).json({ message: 'Report is already assigned or inactive' });
      }

      updates = {
        status: 'accepted',
        volunteerId: req.user.id,
        volunteerName: req.user.name,
        acceptedAt: new Date().toISOString()
      };
    } else if (action === 'claim') {
      // NGO claims a case
      if (req.user.role !== 'ngo') {
        return res.status(403).json({ message: 'Only NGOs can claim cases' });
      }
      if (report.status !== 'reported') {
        return res.status(400).json({ message: 'Report is already assigned or inactive' });
      }

      updates = {
        status: 'accepted',
        ngoId: req.user.id,
        ngoName: req.user.name,
        acceptedAt: new Date().toISOString()
      };
    } else if (action === 'complete') {
      if (req.user.role !== 'volunteer' && req.user.role !== 'ngo' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only volunteers, NGOs, or admins can complete rescues' });
      }
      if (report.status !== 'accepted') {
        return res.status(400).json({ message: 'Only accepted reports can be completed' });
      }

      updates = {
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      // Increment completed rescue count for the volunteer
      if (report.volunteerId) {
        const volunteer = await User.findById(report.volunteerId);
        if (volunteer) {
          const currentCount = (volunteer.volunteerDetails && volunteer.volunteerDetails.completedCount) || 0;
          await User.findByIdAndUpdate(report.volunteerId, {
            'volunteerDetails.completedCount': currentCount + 1
          });
        }
      }
    } else if (action === 'cancel') {
      if (report.reporterId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only the reporter or admin can cancel a report' });
      }

      updates = {
        status: 'cancelled'
      };
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const updatedReport = await Report.findByIdAndUpdate(reportId, updates, { new: true });
    res.json(updatedReport);
  } catch (err) {
    console.error('Update report action error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reports/:id
// @desc    Delete a report (Admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  const { Report } = getModels();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    await Report.deleteOne({ _id: req.params.id });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reports/:id/verify
// @desc    Verify or mark fake an incident report (Admin only)
// @access  Private
router.put('/:id/verify', auth, async (req, res) => {
  const { Report } = getModels();
  const { status } = req.body; // 'verified' or 'fake'
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    
    let updates = { verificationStatus: status };
    if (status === 'fake') {
      updates.status = 'cancelled';
    }
    
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
