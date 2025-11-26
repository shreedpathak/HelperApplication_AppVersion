import express from 'express';
const router = express.Router();

import { signup, login, bulkUserCreator, addProfilesBulk} from '../controllers/authController.js';

router.post('/signup', signup);
router.post('/signupBulk', bulkUserCreator);
router.post('/signupBulkProfile', addProfilesBulk);
router.post('/login', login);

export default router;