import express from 'express';
import { dohvatiProfilUdruge, urediProfilUdruge, dohvatiSveZadatke, dohvatiZadatak, prijavljeniNaZadatak } from '../controllers/udruga_controllers.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isUdruga } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/profil/:id', dohvatiProfilUdruge);
router.put('/profil', authMiddleware, isUdruga, urediProfilUdruge);
router.get('/zadaci', authMiddleware, isUdruga, dohvatiSveZadatke);
router.get('/zadatak/:id', dohvatiZadatak);
router.get('/zadatak/:id/prijavljeni', authMiddleware, isUdruga, prijavljeniNaZadatak);

export default router;