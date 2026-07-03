import express from 'express';
import { getFilterPreferences, applyFilterPreferences } from '../controllers/filterPreferencesController.js';

const router = express.Router();

// this basically defines filter preferences routes
router.get('/', getFilterPreferences);
router.post('/', applyFilterPreferences);

export default router;

