import express from 'express';
const router = express.Router();

// import { getAvailableHelpers, filterByLocation } from '../controllers/neederController.js';

router.get('/search', (req, res) => {
  res.send('Search helpers route hit!');
});

router.get('/request', (req, res) => {
  res.send('Create service request route hit!');
});

export default router;
