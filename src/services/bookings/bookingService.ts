import type { Booking } from "../../types";
import {
  BOOKINGS_UPDATED_EVENT,
  NOTIFICATIONS_UPDATED_EVENT,
  createBooking,
  createBookingNotification,
  getApartmentBookings,
  getBookings,
  getOwnerBookings,
  formatBookingDate,
  isBookingApproved,
  updateBooking,
} from "../../utils/bookings";

export { BOOKINGS_UPDATED_EVENT, NOTIFICATIONS_UPDATED_EVENT, createBooking, createBookingNotification, formatBookingDate, getApartmentBookings, getBookings, getOwnerBookings, isBookingApproved, updateBooking };
export const getBookingById = (bookingId: string) =>
  getBookings().find((booking) => booking.bookingId === bookingId);
export const getStudentBookings = (studentId: string) =>
  getBookings().filter((booking) => booking.studentId === studentId);
export const approveBooking = (bookingId: string) => updateBooking(bookingId, { status: "confirmed" });
export const rejectBooking = (bookingId: string) => updateBooking(bookingId, { status: "rejected" });
export const cancelBooking = (bookingId: string) => updateBooking(bookingId, { status: "cancelled" });
export type BookingServiceRecord = Booking;
