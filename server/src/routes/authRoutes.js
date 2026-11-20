import express from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/v1/auth/me
 * Returns authenticated user's profile from MongoDB
 */
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }
    res.json({
      success: true,
      data: {
        id: user._id,
        firebaseUID: user.firebaseUID,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        timezone: user.timezone,
        dateFormat: user.dateFormat,
        timeFormat: user.timeFormat,
        defaultCalendarView: user.defaultCalendarView,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/sync-user
 * Explicitly synchronizes or updates profile fields upon authentication
 */
router.post('/sync-user', async (req, res) => {
  try {
    const { name, profilePicture, timezone } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (timezone) updateData.timezone = timezone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'User synchronized successfully',
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
