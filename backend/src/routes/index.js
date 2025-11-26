import express, { request } from 'express';

import authRoutes from './authRoutes.js';
import helperRoutes from './helperRoutes.js';
import neederRoutes from './neederRoutes.js';
import areaRoutes from './areaRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import skillRoutes from './skillRoutes.js';
import requestRoutes from './requestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/request', requestRoutes);
router.use('/helpers', helperRoutes);
router.use('/needers', neederRoutes);
router.use('/area', areaRoutes);
router.use('/category', categoryRoutes);
router.use('/skill', skillRoutes);

export default router;
