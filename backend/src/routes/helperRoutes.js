import express from 'express';
import Profile from '../models/Profile.js';
import { addUserSkill, getAllHelpers } from '../controllers/helperController.js'; // Import the controller function
import { getHelpersByCategory } from '../controllers/helperController.js';
const router = express.Router();

router.get('/category/:categoryId', getHelpersByCategory);
router.post('/dashboard/addskill',addUserSkill);

// GET all helpers
router.get('/', getAllHelpers);

// GET helper status
router.get('/status', (req, res) => {
  res.send('Update helper status route hit!');
});

// ✅ GET profile by user ID
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch profile',
      details: err.message,
    });
  }

});

// POST to create or update profile for a user
router.post('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { skillId, skillName } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $push: { skills: { skillId, skillName } } },
      { new: true, upsert: true } // `upsert` ensures profile gets created if not found
    );

    res.status(201).json({
      message: 'Skill added successfully',
      profile,
    });
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({
      error: 'Failed to add skill',
      details: err.message,
    });
  }
});




export default router;
