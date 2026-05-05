import express from 'express';
import { dohvatiSveZadatke, zadaciFilter, jedanZadatak, noviZadatak, urediZadatak, deleteZadatak, oznaciZadatakZavrsenim } from "../controllers/zadaci_controllers.js";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin, isUdruga, isUdrugaIliAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/all', dohvatiSveZadatke);
router.get('/filter', zadaciFilter);
router.get('/zadatak/:id', jedanZadatak);
router.post('/novi', authMiddleware, isUdruga, noviZadatak);
router.put('/zadatak/:id', authMiddleware, isUdruga, urediZadatak);
router.delete('/zadatak/:id', authMiddleware, isUdrugaIliAdmin, deleteZadatak);
router.patch('/zadatak/:id', authMiddleware, isUdruga, oznaciZadatakZavrsenim);

export default router;