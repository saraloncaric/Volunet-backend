import express from 'express';
import { dohvatiProfilVolontera, urediProfil, povijestVolontiranja } from '../controllers/volonter_controllers.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isVolonter } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/profil/povijest', authMiddleware, isVolonter, povijestVolontiranja);
router.get('/profil/:id', dohvatiProfilVolontera);
router.put('/profil', authMiddleware, isVolonter, urediProfil);

export default router;