import express from 'express';
import { registracija, login, prijavljenUser } from '../controllers/auth_controllers.js';
import { validatorRegistracija, validatorLogin } from '../middleware/validators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/registracija', validatorRegistracija, registracija);
router.post('/login', validatorLogin, login);
router.get('/trenutniUser', authMiddleware, prijavljenUser);

export default router;