import express from 'express';
import { PersonalCategory } from '../models/PersonalCategory.js';
import { PersonalReminder } from '../models/PersonalReminder.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/categories - list user's categories
router.get('/', async (req, res) => {
  try {
    const categories = await PersonalCategory.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/categories - create custom category
router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const existing = await PersonalCategory.findOne({ userId: req.user._id, name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A category with this name already exists' });
    }

    const category = await PersonalCategory.create({
      userId: req.user._id,
      name: name.trim(),
      icon: icon || 'Tag',
      color: color || '#e11d48'
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/categories/:id - rename or update icon/color
router.put('/:id', async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(200).json({ success: true, message: 'Sample category updated locally' });
    }

    const category = await PersonalCategory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const oldName = category.name;
    if (req.body.name) category.name = req.body.name.trim();
    if (req.body.icon) category.icon = req.body.icon;
    if (req.body.color) category.color = req.body.color;

    await category.save();

    // Sync reminders if name changed
    if (req.body.name && req.body.name !== oldName) {
      await PersonalReminder.updateMany(
        { categoryId: category._id },
        { categoryName: category.name }
      );
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/categories/:id - safely moves reminders to Uncategorized
router.delete('/:id', async (req, res) => {
  try {
    // If it's a sample mock category ID (e.g. cat-1, cat-2, cat-3), treat as already cleared
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.json({ success: true, message: 'Sample category removed' });
    }

    const category = await PersonalCategory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Crucial requirement: Move reminders to Uncategorized instead of deleting them!
    await PersonalReminder.updateMany(
      { categoryId: category._id },
      { categoryId: null, categoryName: 'Uncategorized' }
    );

    res.json({
      success: true,
      message: `Category "${category.name}" deleted. Reminders moved to Uncategorized.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
