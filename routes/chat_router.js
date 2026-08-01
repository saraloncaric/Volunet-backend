import express from 'express';
import { dohvatiPoruke, novaPoruka, noviRazgovor, sviRazgovori } from '../controllers/chat_controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations/:user_id',authMiddleware, sviRazgovori);
router.post('/conversation', authMiddleware, noviRazgovor);
router.get('/messages/:conversation_id', authMiddleware, dohvatiPoruke);
router.post('/message', authMiddleware, novaPoruka);

export default router;