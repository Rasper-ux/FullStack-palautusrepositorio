import { useNotificationValue } from '../NotificationContext';

const Notification = () => {
  const notification = useNotificationValue();

  if (!notification) {
    return null;
  }

  return <div className={notification.type}>{notification.message}</div>;
};

export default Notification;
