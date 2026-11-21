import express from 'express';
import { GlobalCategory } from '../models/GlobalCategory.js';

const router = express.Router();

// GET /api/v1/global-categories - Public catalog list
router.get('/', async (req, res) => {
  try {
    const categories = await GlobalCategory.find({}).sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
