import express from 'express';
import NotificationController from './notification.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect); // All notification routes are for authenticated users

router.get('/', NotificationController.getMyNotifications);
router.patch('/:notificationId/read', NotificationController.markNotificationAsRead);
router.patch('/read-all', NotificationController.markAllMyNotificationsAsRead); // Mark all as read

export default router;