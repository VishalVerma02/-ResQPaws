const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getModels } = require('../config/db');

// @route   GET api/stats/dashboard
// @desc    Get dashboard stats depending on user role
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  const { User, Report } = getModels();
  const { role, id: userId } = req.user;

  try {
    if (role === 'reporter') {
      const totalReports = await Report.countDocuments({ reporterId: userId });
      const inProgress = await Report.countDocuments({ reporterId: userId, status: 'accepted' });
      const completed = await Report.countDocuments({ reporterId: userId, status: 'completed' });
      const cancelled = await Report.countDocuments({ reporterId: userId, status: 'cancelled' });

      return res.json({
        myReportsCount: totalReports,
        inProgressCount: inProgress,
        completedCount: completed,
        cancelledCount: cancelled
      });
    }

    if (role === 'volunteer') {
      const user = await User.findById(userId);
      const available = await Report.countDocuments({ status: 'reported' });
      const accepted = await Report.countDocuments({ volunteerId: userId, status: 'accepted' });
      const completed = await Report.countDocuments({ volunteerId: userId, status: 'completed' });

      return res.json({
        availableCount: available,
        acceptedCount: accepted,
        completedCount: completed, // Database count
        rating: (user && user.volunteerDetails && user.volunteerDetails.rating) || 4.8,
        profileCompletedCount: (user && user.volunteerDetails && user.volunteerDetails.completedCount) || 0
      });
    }

    if (role === 'ngo') {
      const available = await Report.countDocuments({ status: 'reported' });
      const activeRescues = await Report.countDocuments({ ngoId: userId, status: 'accepted' });
      const completedRescues = await Report.countDocuments({ ngoId: userId, status: 'completed' });
      const volunteerCount = await User.countDocuments({ role: 'volunteer' });

      return res.json({
        availableCount: available,
        activeCount: activeRescues,
        completedCount: completedRescues,
        volunteersCount: volunteerCount
      });
    }

    if (role === 'admin') {
      // General Admin stats
      const totalReports = await Report.countDocuments();
      const volunteerCount = await User.countDocuments({ role: 'volunteer', isApproved: true });
      const ngoCount = await User.countDocuments({ role: 'ngo', isApproved: true });

      // Animal Type Distribution
      const allReports = await Report.find({});
      const typeCounts = {};
      
      // Cities extraction
      const citiesSet = new Set();
      allReports.forEach(r => {
        const type = r.animalType ? r.animalType.toLowerCase() : 'other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        
        if (r.location) {
          const parts = r.location.split(',');
          const city = parts.length >= 2 ? parts[1].trim() : r.location.trim();
          if (city) citiesSet.add(city);
        }
      });

      const citiesList = Array.from(citiesSet);
      const citiesCount = citiesList.length;

      const total = allReports.length || 1;
      const animalTypesData = [
        { name: 'Dogs', value: Math.round(((typeCounts['dog'] || 0) / total) * 100), count: typeCounts['dog'] || 0 },
        { name: 'Cows', value: Math.round(((typeCounts['cow'] || 0) / total) * 100), count: typeCounts['cow'] || 0 },
        { name: 'Cats', value: Math.round(((typeCounts['cat'] || 0) / total) * 100), count: typeCounts['cat'] || 0 },
        { name: 'Birds', value: Math.round(((typeCounts['bird'] || 0) / total) * 100), count: typeCounts['bird'] || 0 },
        { name: 'Monkeys', value: Math.round(((typeCounts['monkey'] || 0) / total) * 100), count: typeCounts['monkey'] || 0 },
        { name: 'Horses', value: Math.round(((typeCounts['horse'] || 0) / total) * 100), count: typeCounts['horse'] || 0 },
        { name: 'Others', value: Math.round(((typeCounts['other'] || 0) / total) * 100), count: typeCounts['other'] || 0 }
      ];

      // Dynamic Monthly Trend (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const reportsOverview = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = months[d.getMonth()];
        const count = allReports.filter(r => {
          const rDate = new Date(r.createdAt || Date.now());
          return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
        }).length;
        
        reportsOverview.push({
          month: monthLabel,
          reports: count
        });
      }

      return res.json({
        totalReports,
        volunteers: volunteerCount,
        ngos: ngoCount,
        cities: citiesCount,
        citiesList,
        reportsOverview,
        animalTypesData
      });
    }

    res.status(400).json({ message: 'Invalid role' });
  } catch (err) {
    console.error('Get stats error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/stats/public
// @desc    Get public landing page stats
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { User, Report } = getModels();
    const totalReports = await Report.countDocuments();
    const volunteerCount = await User.countDocuments({ role: 'volunteer', isApproved: true });
    const ngoCount = await User.countDocuments({ role: 'ngo', isApproved: true });
    
    const allReports = await Report.find({});
    const citiesSet = new Set();
    allReports.forEach(r => {
      if (r.location) {
        const parts = r.location.split(',');
        const city = parts.length >= 2 ? parts[1].trim() : r.location.trim();
        if (city) citiesSet.add(city);
      }
    });

    res.json({
      totalReports,
      volunteers: volunteerCount,
      ngos: ngoCount,
      cities: citiesSet.size
    });
  } catch (err) {
    console.error('Get public stats error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
