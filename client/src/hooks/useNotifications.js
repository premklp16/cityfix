import { useNotifications as useContextNotifications } from '../context/NotificationContext';

export const useNotifications = () => {
  return useContextNotifications();
};
