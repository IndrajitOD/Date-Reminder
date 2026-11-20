import express from 'express';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { NotificationLog } from '../models/NotificationLog.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/notifications/preferences
router.get('/preferences', async (req, res) => {
  try {
    let prefs = await NotificationPreference.findOne({ userId: req.user._id });
    if (!prefs) {
      prefs = await NotificationPreference.create({
        userId: req.user._id,
        channels: {
          email: { enabled: true, address: req.user.email || '', verified: true },
          push: { enabled: true },
          whatsapp: { enabled: false }
        }
      });
    }
    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/notifications/preferences
router.put('/preferences', async (req, res) => {
  try {
    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: prefs, message: 'Preferences updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/notifications/logs - notification history
router.get('/logs', async (req, res) => {
  try {
    const logs = await NotificationLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
