import express from 'express';
import { dohvatiSveZadatke, zadaciFilter } from "../controllers/zadaci_controllers.js";

const router = express.Router();

router.get('/all', dohvatiSveZadatke);
router.get('/filter', zadaciFilter);

export default router;