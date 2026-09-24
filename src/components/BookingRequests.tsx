import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Booking, User } from "../types";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import {
  createBookingNotification,
  getOwnerBookings,
  isBookingApproved,
  updateBooking,
  formatBookingDate,
} from "../utils/bookings";
import "../styles/DashboardPage.css";

function bookingLabel(booking: Booking, language: "ar" | "en") {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const quantity = booking.quantity || 1;
  return booking.bookingType === "apartment"
    ? t("apartment")
    : booking.bookingType === "room"
      ? `${quantity} ${t(quantity === 1 ? "room" : "roomsCount")}`
      : `${quantity} ${t(quantity === 1 ? "bed" : "beds")}`;
}

export default function BookingRequests({ user }: { user: User }) {
  const [version, setVersion] = useState(0);
  const [searchParams] = useSearchParams();
  const language = useStore((state) => state.language);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const bookings = getOwnerBookings(user.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const selectedBookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!selectedBookingId) return;
    const selectedRow = Array.from(
      document.querySelectorAll<HTMLElement>("[data-booking-id]"),
    ).find((row) => row.dataset.bookingId === selectedBookingId);
    selectedRow?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedBookingId, bookings.length]);

  const updateStatus = (booking: Booking, status: "confirmed" | "rejected") => {
    if (booking.status !== "pending") return;
    const updatedBooking = updateBooking(booking.bookingId, { status });
    if (!updatedBooking) return;
    if (booking.studentId) {
      createBookingNotification({
        bookingId: booking.bookingId,
        studentId: booking.studentId,
        title:
          status === "confirmed"
            ? "تم قبول طلب الحجز الخاص بك"
            : "تم رفض طلب الحجز الخاص بك",
        studentName: booking.studentName,
        studentEmail: booking.studentEmail,
        studentPhone: booking.studentPhone,
        collegeOrWork: booking.collegeOrWork,
        apartmentTitle: booking.apartmentTitle,
        bookingType: booking.bookingType,
        quantity: booking.quantity,
        selectedRoom: booking.selectedRoom,
        selectedRooms: booking.selectedRooms,
        selectedBed: booking.selectedBed,
        selectedBeds: booking.selectedBeds,
        price: booking.price,
        bookingDate: booking.bookingDate,
        status,
      });
    }
    setVersion((value) => value + 1);
  };

  return (
    <div className="panel">
      <h2>{t("bookingRequests")}</h2>
      {bookings.length === 0 ? (
        <p className="muted">{t("noBookingRequests")}</p>
      ) : (
        bookings.map((booking) => (
          <div
            className="booking-row"
            data-booking-id={booking.bookingId}
            key={`${booking.bookingId}-${version}`}
          >
            <span>
              <b>{booking.apartmentTitle}</b>
              <small>
                {booking.studentName || t("student")} · {bookingLabel(booking, language)}
              </small>
              {booking.collegeOrWork && (
                <small>{t("collegeOrWork")}: {booking.collegeOrWork}</small>
              )}
              {isBookingApproved(booking.status) && booking.studentPhone && (
                <small>{t("phone")}: {booking.studentPhone}</small>
              )}
              <small>
                {booking.price.toLocaleString()} {t("perMonth")} · {t(booking.status)}
              </small>
              {booking.bookingDate && <small>{t("moveInDateLabel")}: {formatBookingDate(booking.bookingDate, language)}</small>}
            </span>
            {booking.status === "pending" ? (
              <span>
                <button
                  className="btn"
                  type="button"
                  onClick={() => updateStatus(booking, "confirmed")}
                >
                  {t("accept")}
                </button>{" "}
                <button
                  className="btn"
                  type="button"
                  onClick={() => updateStatus(booking, "rejected")}
                >
                  {t("reject")}
                </button>
              </span>
            ) : (
              <em>{t(booking.status)}</em>
            )}
          </div>
        ))
      )}
    </div>
  );
}
