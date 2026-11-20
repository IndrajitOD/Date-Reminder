import express from 'express';
import { PersonalReminder } from '../models/PersonalReminder.js';
import { PersonalCategory } from '../models/PersonalCategory.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/reminders
router.get('/', async (req, res) => {
  try {
    const { category, search, timeline } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      if (category === 'Uncategorized') {
        query.categoryId = null;
      } else {
        query.categoryName = category;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { personName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const reminders = await PersonalReminder.find(query).sort({ eventDate: 1 });
    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/reminders
router.post('/', async (req, res) => {
  try {
    const { title, personName, eventDate, categoryId, categoryName, recurrence, reminderSchedules, notificationChannels, notes } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ success: false, error: 'Title and eventDate are required' });
    }

    // Validate if categoryId is a valid 24-char hex MongoDB ObjectId, otherwise null
    const validCategoryId = categoryId && typeof categoryId === 'string' && /^[0-9a-fA-F]{24}$/.test(categoryId) 
      ? categoryId 
      : null;

    const reminder = await PersonalReminder.create({
      userId: req.user._id,
      title: title.trim(),
      personName: personName ? personName.trim() : '',
      eventDate,
      categoryId: validCategoryId,
      categoryName: categoryName || 'Uncategorized',
      recurrence: recurrence || 'yearly',
      reminderSchedules: Array.isArray(reminderSchedules) ? reminderSchedules : [3],
      notificationChannels: Array.isArray(notificationChannels) ? notificationChannels : ['email'],
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/reminders/:id
router.put('/:id', async (req, res) => {
  try {
    const reminder = await PersonalReminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found or access denied' });
    }

    Object.assign(reminder, req.body);
    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await PersonalReminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found or access denied' });
    }
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
