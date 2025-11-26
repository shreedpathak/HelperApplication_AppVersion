import express from 'express';
import {addCategory}  from '../controllers/createCategory.js';
import {getCategory}  from '../controllers/createCategory.js';
import {updateCategoryById}  from '../controllers/createCategory.js';
import {bulkUpdateCategories}  from '../controllers/createCategory.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, addCategory);
router.get('/', getCategory);
router.put('/update/:id', updateCategoryById);  // Single update
router.put('/bulkupdate', bulkUpdateCategories);   // Bulk update


export default router;
