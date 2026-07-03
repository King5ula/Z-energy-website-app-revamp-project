import express from 'express';
import { getEntryData } from '../controllers/entryController.js';

const router = express.Router();

// this basically defines entry page routes
router.get('/', getEntryData);

export default router;

