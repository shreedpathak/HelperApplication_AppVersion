import express from 'express';
import { addSkill, getSkill, addSkillsBulk } from '../controllers/createSkills.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', addSkill);
router.post('/addBulk', addSkillsBulk);
router.get('/list', getSkill);

export default router;
