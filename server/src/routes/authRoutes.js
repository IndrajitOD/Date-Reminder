import express from 'express';
import { User } from '../models/User.js';
import { PersonalReminder } from '../models/PersonalReminder.js';
import { PersonalCategory } from '../models/PersonalCategory.js';
import { EventSubscription } from '../models/EventSubscription.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/v1/auth/me
 * Returns authenticated user's profile and metadata from MongoDB
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
        phoneNumber: user.phoneNumber || '',
        authProvider: user.authProvider,
        timezone: user.timezone || 'UTC',
        dateFormat: user.dateFormat || 'MMM DD, YYYY',
        timeFormat: user.timeFormat || '12h',
        defaultCalendarView: user.defaultCalendarView || 'month',
        language: user.language || 'English (US)',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/auth/profile
 * Updates personal details (name, phone, timezone, language, formats, avatar)
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, phoneNumber, timezone, language, dateFormat, timeFormat, profilePicture } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
    if (timezone !== undefined) updateData.timezone = timezone.trim();
    if (language !== undefined) updateData.language = language.trim();
    if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
    if (timeFormat !== undefined) updateData.timeFormat = timeFormat;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/sync-user
 * Synchronizes user authentication metadata upon login
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

/**
 * DELETE /api/v1/auth/delete-account
 * Deletes all MongoDB user-owned records (reminders, categories, subscriptions, preferences, user record)
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const userId = req.user._id;
    const firebaseUid = req.firebaseUid;

    // Delete all user associations in parallel
    await Promise.all([
      PersonalReminder.deleteMany({ userId }),
      PersonalCategory.deleteMany({ userId }),
      EventSubscription.deleteMany({ userId }),
      NotificationPreference.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    console.log(`[Account Cleanup]: Purged all MongoDB records for user ${firebaseUid}`);

    res.json({
      success: true,
      message: 'All user data permanently deleted from MongoDB'
    });
  } catch (err) {
    console.error('[Account Deletion Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
