import Notification from '../models/notification.js';

export const checkNotifications = async (req, res) => {
  try {
    const { deliveryId } = req.query;

    const pendingNotifications = await Notification.find({
      userId: deliveryId,
      status: 'pending'
    }).sort({ createdAt: 'asc' });

    if (pendingNotifications.length === 0) {
      return res.status(204).send();
    }

    const notificationIds = pendingNotifications.map(n => n._id);

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { status: 'delivered' } }
    );

    res.status(200).json(pendingNotifications);

  } catch (error) {
    console.error('Error checking notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createNotification = async (deliveryId, title, body, data = {}) => {
  try {
    const newNotification = new Notification({
      deliveryId,
      title,
      body,
      data,
    });
    await newNotification.save();
    console.log(`Notification created for user ${deliveryId}`);
  } catch (error) {
    console.error(`Failed to create notification for user ${deliveryId}:`, error);
  }
};
