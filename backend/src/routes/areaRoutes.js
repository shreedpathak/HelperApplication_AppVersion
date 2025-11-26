import express from 'express';
import Area from '../models/Area.js';

const router = express.Router();

// ✅ Create a new area
router.post('/', async (req, res) => {
  try {
    const existing = await Area.findOne({ pincode: req.body.pincode });

    if (existing) {
      return res.status(400).json({ message: 'Area with this pincode already exists.' });
    }

    const area = new Area(req.body);
    await area.save();
    res.status(201).json({ message: 'Area created successfully', area });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create area', details: err.message });
  }
});

// ✅ Update area by pincode
router.put('/area/:pincode', async (req, res) => {
  const { pincode } = req.params;

  try {
    const updatedArea = await Area.findOneAndUpdate(
      { pincode },
      req.body,
      { new: true, upsert: false }
    );

    if (!updatedArea) {
      return res.status(404).json({ message: 'Area not found for update' });
    }

    res.json({ message: 'Area updated successfully', area: updatedArea });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update area', details: err.message });
  }
});

export default router;
