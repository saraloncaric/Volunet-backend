import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin, isUdruga } from '../middleware/roleMiddleware.js';
import { dodajRecenziju, dohvatiRecenzije, obrisiRecenziju } from '../controllers/recenzije_controllers.js';

const router = express.Router();

router.post('/nova/:volunteer_id', authMiddleware, isUdruga, dodajRecenziju);
router.get('/all/:volunteer_id', dohvatiRecenzije);
router.delete('/delete/:id', authMiddleware, isAdmin, obrisiRecenziju);

export default router;