import { Router } from 'express';
import { checkNotifications } from '../controllers/notificationController.js';

const router = Router();

router.get('/notifications/check', checkNotifications);

export default router;
