import express from 'express';
import { getContactInfo, updateContactInfo } from '../controllers/adminContactController.js';

const router = express.Router();

router.get('/', getContactInfo);

// add admin authentication later 
// router.put('/', isAdmin, updateContactInfo);

router.put('/', updateContactInfo);

export default router;
