import express from 'express';
import { dohvatiSveZadatke } from "../controllers/zadaci_controllers.js";

const router = express.Router();

router.get('/aktivnizadaci', dohvatiSveZadatke);

export default router;