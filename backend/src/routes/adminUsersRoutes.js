import express from 'express';
import { getAdminUsers, createAdminUser } from '../controllers/adminUsersController.js'
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);
router.get('/', getAdminUsers);
router.put('/', createAdminUser);
export default router;