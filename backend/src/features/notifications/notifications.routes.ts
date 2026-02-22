import { Router } from 'express';
import { getNotifications, updateNotifications } from './notifications.controller';

const router = Router();

router.get('/:userId/notifications',  getNotifications);
router.put('/:userId/notifications',  updateNotifications);

export default router;
