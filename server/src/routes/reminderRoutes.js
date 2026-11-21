import express from 'express';
import { PersonalReminder } from '../models/PersonalReminder.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/reminders
router.get('/', async (req, res) => {
  try {
    const { category, search, timeline, status, priority, channel, recurrence } = req.query;
    const query = { userId: req.user._id };

    // Status filter: completed, archived, active (default: non-archived unless explicitly asked)
    if (status === 'archived') {
      query.isArchived = true;
    } else if (status === 'completed') {
      query.isCompleted = true;
      query.isArchived = false;
    } else if (status === 'all') {
      // Include all (archived and active)
    } else {
      // Default: active non-archived reminders
      query.isArchived = false;
    }

    if (category && category !== 'All') {
      if (category === 'Uncategorized') {
        query.categoryId = null;
      } else {
        query.categoryName = category;
      }
    }

    if (priority && priority !== 'All') {
      query.priority = priority.toLowerCase();
    }

    if (recurrence && recurrence !== 'All') {
      query.recurrence = recurrence.toLowerCase();
    }

    if (channel && channel !== 'All') {
      query.notificationChannels = channel.toLowerCase();
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
    const { 
      title, 
      personName, 
      eventDate, 
      categoryId, 
      categoryName, 
      recurrence, 
      priority,
      reminderSchedules, 
      notificationChannels, 
      notes 
    } = req.body;

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
      priority: priority && ['low', 'normal', 'high', 'critical'].includes(priority.toLowerCase()) ? priority.toLowerCase() : 'normal',
      reminderSchedules: Array.isArray(reminderSchedules) ? reminderSchedules : [3],
      notificationChannels: Array.isArray(notificationChannels) ? notificationChannels : ['email'],
      notes: notes ? notes.trim() : '',
      isCompleted: false,
      isArchived: false,
      isActive: true
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

    const allowedUpdates = [
      'title', 'personName', 'eventDate', 'categoryId', 'categoryName', 
      'recurrence', 'priority', 'reminderSchedules', 'notificationChannels', 
      'notes', 'isCompleted', 'isArchived', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        reminder[field] = req.body[field];
      }
    });

    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/reminders/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Ids array is required' });
    }

    // Enforce ownership
    const filter = { _id: { $in: ids }, userId: req.user._id };

    if (action === 'archive') {
      await PersonalReminder.updateMany(filter, { isArchived: true });
      return res.json({ success: true, message: `Archived ${ids.length} reminder(s)` });
    } else if (action === 'restore') {
      await PersonalReminder.updateMany(filter, { isArchived: false });
      return res.json({ success: true, message: `Restored ${ids.length} reminder(s)` });
    } else if (action === 'complete') {
      await PersonalReminder.updateMany(filter, { isCompleted: true });
      return res.json({ success: true, message: `Marked ${ids.length} reminder(s) as completed` });
    } else if (action === 'uncomplete') {
      await PersonalReminder.updateMany(filter, { isCompleted: false });
      return res.json({ success: true, message: `Marked ${ids.length} reminder(s) as active` });
    } else if (action === 'delete') {
      const result = await PersonalReminder.deleteMany(filter);
      return res.json({ success: true, message: `Deleted ${result.deletedCount} reminder(s)` });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid bulk action' });
    }
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
