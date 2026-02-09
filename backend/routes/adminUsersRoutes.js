import express from 'express';
import { getAdminUsers } from '../controllers/adminUsersController.js'

const router = express.Router();

router.get('/', getAdminUsers);
export default router;