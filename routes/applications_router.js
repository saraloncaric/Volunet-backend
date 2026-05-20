import express from 'express';
import { prijavaNaZadatak, otkaziPrijavu, upitOdVolontera, zatvoriPrijave } from '../controllers/applications_controllers.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isUdruga, isVolonter } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/prijava/:id', authMiddleware, isVolonter, prijavaNaZadatak);
router.delete('/otkazi/:id', authMiddleware, isVolonter, otkaziPrijavu);
router.patch('/prijava/:id', authMiddleware, isUdruga, upitOdVolontera);
router.patch('/prijava/:id/zavrsi', authMiddleware, isUdruga, zatvoriPrijave);

export default router;