import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import { getOwnerNotifications } from "../utils/bookings";
import BookingRequests from "../components/BookingRequests";
import "../styles/AuthPages.css";
import "../styles/DashboardPage.css";
import PropertyCard from "../components/PropertyCard";
import {
  APARTMENTS_UPDATED_EVENT,
  deleteApartment,
  readStoredApartments,
} from "../utils/apartments";

export default function OwnerWorkspace({
  title,
}: {
  title: string;
  broker?: boolean;
}) {
  const { currentUser, language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const displayTitle = title === "My Properties" ? t("myProperties") : title === "Booking Requests" ? t("bookingRequests") : title === "Client Inquiries" ? t("clientInquiries") : t("notifications");
  const [properties, setProperties] = useState(() =>
    currentUser
      ? readStoredApartments().filter(
          (apartment) => apartment.ownerId === currentUser.id,
        )
      : [],
  );
  useEffect(() => {
    if (!currentUser) return;
    const refresh = () =>
      setProperties(
        readStoredApartments().filter(
          (apartment) => apartment.ownerId === currentUser.id,
        ),
      );
    window.addEventListener(APARTMENTS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(APARTMENTS_UPDATED_EVENT, refresh);
  }, [currentUser]);
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ authMessage: "You must sign in first to access this page." }}
      />
    );
  }
  if (currentUser.role !== "OWNER" && currentUser.role !== "BROKER")
    return (
      <Navigate
        to={
          currentUser.role === "STUDENT"
            ? "/student/dashboard"
            : "/admin/dashboard"
        }
        replace
      />
    );
  if (title === "Notifications") {
    const notifications = getOwnerNotifications(currentUser.id);
    return (
      <main className="auth">
        <div>
          <small>OWNER WORKSPACE</small>
          <h1>{displayTitle}</h1>
          <div className="panel">
            {notifications.length === 0 ? (
              <p className="muted">{t("noNotifications")}</p>
            ) : (
              notifications.map((notification) => (
                <div className="booking-row" key={notification.notificationId}>
                  <span>
                    <b>{notification.title}</b>
                    <small>
                      {notification.studentName || "Student"} · {notification.apartmentTitle}
                    </small>
                    <small>
                      {notification.quantity || 1} {notification.bookingType === "room" ? t((notification.quantity || 1) === 1 ? "room" : "roomsCount") : notification.bookingType === "bed" ? t((notification.quantity || 1) === 1 ? "bed" : "beds") : t("apartment")} · {notification.price.toLocaleString()} EGP · Pending
                    </small>
                  </span>
                  <em>Pending</em>
                </div>
              ))
            )}
          </div>
          <Link className="btn" to="/owner/dashboard">{t("backDashboard")}</Link>
        </div>
      </main>
    );
  }
  if (title === "Booking Requests" || title === "Client Inquiries") {
    return (
      <main className="auth">
        <div>
          <small>OWNER WORKSPACE</small>
          <h1>{displayTitle}</h1>
          <BookingRequests user={currentUser} />
          <Link className="btn" to="/owner/dashboard">{t("backDashboard")}</Link>
        </div>
      </main>
    );
  }
  if (title !== "My Properties")
    return (
      <main className="auth">
        <div>
          <small>OWNER WORKSPACE</small>
          <h1>{displayTitle}</h1>
          <p className="muted">
            Manage your student housing activity from one place.
          </p>
          <Link className="btn" to="/owner/dashboard">
            {t("backDashboard")}
          </Link>
        </div>
      </main>
    );
  const removeProperty = (apartmentId: number) => {
    if (!window.confirm("Are you sure you want to delete this apartment?")) {
      return;
    }
    if (deleteApartment(apartmentId, currentUser.id)) {
      setProperties((current) =>
        current.filter((apartment) => apartment.id !== apartmentId),
      );
    }
  };

  return (
    <main className="auth">
      <div>
        <small>OWNER WORKSPACE</small>
        <h1>{t("myProperties")}</h1>
        <p className="muted">
          {t("manageProperties")}
        </p>
        <Link className="btn" to="/owner/properties/new">
          + {t("addNewApartment")}
        </Link>
        {properties.length === 0 ? (
          <p className="muted">{t("noProperties")}</p>
        ) : (
          <div className="grid">
            {properties.map((property) => (
              <div key={property.id}>
                <PropertyCard home={property} />
                <button
                  className="btn"
                  type="button"
                  onClick={() => removeProperty(property.id)}
                >
                  {t("delete")}
                </button>
              </div>
            ))}
          </div>
        )}
        <Link className="back" to="/owner/dashboard">
          {t("backDashboard")}
        </Link>
      </div>
    </main>
  );
}
