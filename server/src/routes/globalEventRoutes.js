import express from 'express';
import { GlobalEvent } from '../models/GlobalEvent.js';
import { GlobalCategory } from '../models/GlobalCategory.js';
import { EventSubscription } from '../models/EventSubscription.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public: GET /api/v1/global-events - browse catalog
router.get('/', async (req, res) => {
  try {
    const { category, country, search, month } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.primaryCategory = category;
    }

    if (country && country !== 'All') {
      query.country = country;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await GlobalEvent.find(query).sort({ date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Authenticated: Manage Subscriptions
router.get('/subscriptions', requireAuth, async (req, res) => {
  try {
    const subscriptions = await EventSubscription.find({ userId: req.user._id, isActive: true });
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscriptionType, eventId, categoryName } = req.body;

    if (!subscriptionType || (!eventId && !categoryName)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription parameters' });
    }

    const existing = await EventSubscription.findOne({
      userId: req.user._id,
      subscriptionType,
      eventId: eventId || null,
      categoryName: categoryName || ''
    });

    if (existing) {
      existing.isActive = true;
      await existing.save();
      return res.json({ success: true, data: existing, message: 'Subscription active' });
    }

    const created = await EventSubscription.create({
      userId: req.user._id,
      subscriptionType,
      eventId: eventId || null,
      categoryName: categoryName || '',
      isActive: true
    });

    res.status(201).json({ success: true, data: created, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { subscriptionType, eventId, categoryName } = req.body;

    await EventSubscription.findOneAndDelete({
      userId: req.user._id,
      subscriptionType,
      eventId: eventId || null,
      categoryName: categoryName || ''
    });

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
