import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { dohvatiObavijesti, oznaciProcitano } from '../controllers/obavijesti_controllers.js';

const router = express.Router();

router.get('/all', authMiddleware, dohvatiObavijesti);
router.patch('/read/:id', authMiddleware, oznaciProcitano);

export default router;