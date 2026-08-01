import express from 'express';
import { noviRazgovor, sviRazgovori } from '../controllers/chat_controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations/:user_id',authMiddleware, sviRazgovori);
router.post('/conversation', authMiddleware, noviRazgovor);

export default router;