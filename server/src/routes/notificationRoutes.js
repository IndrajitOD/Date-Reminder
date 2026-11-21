import express from 'express';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { NotificationLog } from '../models/NotificationLog.js';
import { GlobalCategory } from '../models/GlobalCategory.js';
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
        masterEnabled: true,
        globalEventsEnabled: true,
        personalRemindersEnabled: true,
        uncategorizedRemindersEnabled: { email: true, push: true, whatsapp: false },
        personalCategoryPreferences: {},
        globalCategoryPreferences: {},
        channels: {
          email: { enabled: true, address: req.user.email || '', verified: true },
          push: { enabled: true },
          whatsapp: { 
            enabled: false, 
            phoneNumber: req.user.phoneNumber || '', 
            verified: false,
            optInConsent: false,
            status: 'Coming Soon'
          }
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
    res.json({ success: true, data: prefs, message: 'Preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/notifications/global-categories - fetch dynamic global categories for settings
router.get('/global-categories', async (req, res) => {
  try {
    const categories = await GlobalCategory.find({}).sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/notifications/logs - notification history with advanced filters
router.get('/logs', async (req, res) => {
  try {
    const { status, channel, search, limit = 100, page = 1 } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.deliveryStatus = status.toLowerCase();
    }

    if (channel && channel !== 'all') {
      query.channel = channel.toLowerCase();
    }

    if (search) {
      query.eventName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [logs, total] = await Promise.all([
      NotificationLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      NotificationLog.countDocuments(query)
    ]);

    res.json({ 
      success: true, 
      count: logs.length, 
      total, 
      page: parseInt(page, 10), 
      data: logs 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/notifications/logs/:id/retry - safely retry a failed notification dispatch
router.post('/logs/:id/retry', async (req, res) => {
  try {
    const log = await NotificationLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ success: false, error: 'Notification record not found' });
    }

    if (log.deliveryStatus === 'delivered') {
      return res.status(400).json({ success: false, error: 'Cannot retry an already delivered notification' });
    }

    if (log.retryCount >= log.maxRetries) {
      return res.status(400).json({ success: false, error: 'Maximum retry limit reached for this notification' });
    }

    // Increment retry count and reset status to pending for dispatch worker
    log.retryCount += 1;
    log.deliveryStatus = 'pending';
    log.failureReason = `Retry queued (Attempt ${log.retryCount}/${log.maxRetries})`;
    await log.save();

    res.json({ 
      success: true, 
      data: log, 
      message: `Notification retry queued successfully (Attempt ${log.retryCount})` 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// WhatsApp Management Endpoints
router.post('/whatsapp/connect', async (req, res) => {
  try {
    const { phoneNumber, optInConsent } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Check if WhatsApp backend provider credentials exist
    const hasProvider = !!process.env.WHATSAPP_API_TOKEN;

    const status = hasProvider ? 'Verification Required' : 'Coming Soon';

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $set: { 
          'channels.whatsapp.phoneNumber': phoneNumber,
          'channels.whatsapp.optInConsent': !!optInConsent,
          'channels.whatsapp.consentTimestamp': new Date(),
          'channels.whatsapp.status': status,
          'channels.whatsapp.enabled': hasProvider
        } 
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: prefs.channels.whatsapp,
      message: hasProvider 
        ? 'WhatsApp connection initiated. Verification code sent.'
        : 'WhatsApp integration is prepared. Provider setup is in progress (Coming Soon).'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/whatsapp/disconnect', async (req, res) => {
  try {
    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $set: { 
          'channels.whatsapp.enabled': false,
          'channels.whatsapp.verified': false,
          'channels.whatsapp.status': 'Not Connected'
        } 
      },
      { new: true }
    );
    res.json({ success: true, data: prefs.channels.whatsapp, message: 'WhatsApp disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
