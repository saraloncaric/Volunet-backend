import express from 'express';
import { deleteChat, dohvatiPoruke, novaPoruka, noviRazgovor, readAt, sviRazgovori } from '../controllers/chat_controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations/:user_id',authMiddleware, sviRazgovori);
router.post('/conversation', authMiddleware, noviRazgovor);
router.get('/messages/:conversation_id', authMiddleware, dohvatiPoruke);
router.post('/message', authMiddleware, novaPoruka);
router.post('/readat', authMiddleware, readAt);
router.delete('/delete/:id', authMiddleware, deleteChat);

export default router;