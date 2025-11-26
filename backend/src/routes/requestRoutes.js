import express from 'express';
const router = express.Router();

import { createRequest, fetchRequests, updateRequests, deleteRequests } from '../controllers/requestController.js';

router.post('/create', createRequest);
router.get('/fetch', fetchRequests);
router.put('/update', updateRequests);
router.put('/delete', deleteRequests);

export default router;