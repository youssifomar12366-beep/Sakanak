import type { BookingNotification } from "../../types";
import { createBookingNotification, getNotifications, getOwnerNotifications, getStudentNotifications } from "../../utils/bookings";

export const getUserNotifications = (userId: string) =>
  getNotifications().filter((notification) => notification.studentId === userId || notification.ownerId === userId);
export const createNotification = createBookingNotification;
export { getOwnerNotifications, getStudentNotifications };
export type NotificationRecord = BookingNotification;

const NOTIFICATIONS_KEY = "nest.notifications";
const readStoredNotifications = (): NotificationRecord[] => {
  try {
    const value = localStorage.getItem(NOTIFICATIONS_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const writeStoredNotifications = (notifications: NotificationRecord[]) =>
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

export const markAsRead = (notificationId: string): boolean => {
  const notifications = readStoredNotifications();
  if (!notifications.some((notification) => notification.notificationId === notificationId)) return false;
  writeStoredNotifications(notifications.map((notification) => notification.notificationId === notificationId ? { ...notification, read: true } : notification));
  return true;
};

export const deleteNotification = (notificationId: string): boolean => {
  const notifications = readStoredNotifications();
  const next = notifications.filter((notification) => notification.notificationId !== notificationId);
  if (next.length === notifications.length) return false;
  writeStoredNotifications(next);
  return true;
};
