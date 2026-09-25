import type { Booking, BookingNotification } from "../types";

const BOOKINGS_KEY = "nest.bookings";
const NOTIFICATIONS_KEY = "nest.notifications";
export const BOOKINGS_UPDATED_EVENT = "nest:bookings-updated";
const ADMIN_MESSAGES_KEY = "nest.admin-messages";
export const NOTIFICATIONS_UPDATED_EVENT = "nest:notifications-updated";

export type AdminMessage = {
  messageId: string;
  userId: string;
  message: string;
  createdAt: string;
};

export const formatBookingDate = (date: string | undefined, language: "ar" | "en") => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const isBookingApproved = (status: Booking["status"]): boolean =>
  status === "confirmed" || status === "approved";

const readList = <T,>(key: string): T[] => {
  try {
    const value = localStorage.getItem(key);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const getBookings = (): Booking[] => readList<Booking>(BOOKINGS_KEY);

export const getNotifications = (): BookingNotification[] =>
  readList<BookingNotification>(NOTIFICATIONS_KEY);

export const getApartmentBookings = (apartmentId: number): Booking[] =>
  getBookings().filter(
    (booking) =>
      booking.apartmentId === apartmentId &&
      (booking.status === "pending" || isBookingApproved(booking.status)),
  );

export const getOwnerBookings = (ownerId: string): Booking[] =>
  getBookings().filter((booking) => booking.ownerId === ownerId);

export const getStudentNotifications = (studentId: string) =>
  getNotifications().filter(
    (notification) => notification.studentId === studentId,
  );

export const createBooking = (
  booking: Omit<Booking, "bookingId" | "createdAt">,
): Booking => {
  const createdAt = new Date().toISOString();
  const nextBooking: Booking = {
    ...booking,
    bookingId: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
  };
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify([...getBookings(), nextBooking]),
  );
  window.dispatchEvent(new Event(BOOKINGS_UPDATED_EVENT));
  return nextBooking;
};

export const updateBooking = (
  bookingId: string,
  changes: Partial<Pick<Booking, "status">>,
): Booking | undefined => {
  const bookings = getBookings();
  const booking = bookings.find((item) => item.bookingId === bookingId);
  if (!booking) return undefined;
  const updatedBooking = { ...booking, ...changes };
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(
      bookings.map((item) =>
        item.bookingId === bookingId ? updatedBooking : item,
      ),
    ),
  );
  window.dispatchEvent(new Event(BOOKINGS_UPDATED_EVENT));
  return updatedBooking;
};

export const createBookingNotification = (
  notification: Omit<BookingNotification, "notificationId" | "createdAt">,
): BookingNotification => {
  const nextNotification: BookingNotification = {
    ...notification,
    notificationId: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify([...getNotifications(), nextNotification]),
  );
  return nextNotification;
};

export const getOwnerNotifications = (ownerId: string) =>
  getNotifications().filter((notification) => notification.ownerId === ownerId);

export const getAdminMessages = (userId: string): AdminMessage[] =>
  readList<AdminMessage>(ADMIN_MESSAGES_KEY).filter(
    (message) => message.userId === userId,
  );

export const createAdminMessage = (userId: string, message: string): AdminMessage => {
  const nextMessage: AdminMessage = {
    messageId: `admin-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    message,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
    ADMIN_MESSAGES_KEY,
    JSON.stringify([
      ...readList<AdminMessage>(ADMIN_MESSAGES_KEY),
      nextMessage,
    ]),
  );
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  return nextMessage;
};
