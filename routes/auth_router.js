import express from 'express';
import { registracija, login, prijavljenUser, sviKorisnici } from '../controllers/auth_controllers.js';
import { validatorRegistracija, validatorLogin } from '../middleware/validators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/registracija', validatorRegistracija, registracija);
router.post('/login', validatorLogin, login);
router.get('/trenutniUser', authMiddleware, prijavljenUser);
router.get('/all', authMiddleware, isAdmin, sviKorisnici);

export default router;