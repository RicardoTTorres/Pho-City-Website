import express from 'express';
import { getContactInfo } from '../controllers/adminContactController.js';

const router = express.Router();

router.get('/', getContactInfo);

// router.put('/', updateContactInfo);

export default router;


