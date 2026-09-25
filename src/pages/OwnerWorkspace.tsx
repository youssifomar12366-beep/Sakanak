import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import { getOwnerNotifications } from "../services/notifications/notificationService";
import BookingRequests from "../components/BookingRequests";
import "../styles/AuthPages.css";
import "../styles/DashboardPage.css";
import PropertyCard from "../components/PropertyCard";
import {
  APARTMENTS_UPDATED_EVENT,
  deleteApartment,
  readStoredApartments,
} from "../services/apartments/apartmentService";

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
        state={{ authMessage: t("authRequired") }}
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
          <small>{currentUser.role === "BROKER" ? t("brokerWorkspaceLabel") : t("ownerWorkspace")}</small>
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
                      {notification.studentName || t("student")} · {notification.apartmentTitle}
                    </small>
                    <small>
                      {notification.quantity || 1} {notification.bookingType === "room" ? t((notification.quantity || 1) === 1 ? "room" : "roomsCount") : notification.bookingType === "bed" ? t((notification.quantity || 1) === 1 ? "bed" : "beds") : t("apartment")} · {notification.price.toLocaleString()} {t("perMonth")} · {t("pending")}
                    </small>
                    {notification.collegeOrWork && (
                      <small>{t("collegeOrWork")}: {notification.collegeOrWork}</small>
                    )}
                    {notification.status === "confirmed" || notification.status === "approved" ? (
                      notification.studentPhone && <small>{t("phone")}: {notification.studentPhone}</small>
                    ) : null}
                  </span>
                  <em>{t("pending")}</em>
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
          <small>{currentUser.role === "BROKER" ? t("brokerWorkspaceLabel") : t("ownerWorkspace")}</small>
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
          <small>{currentUser.role === "BROKER" ? t("brokerWorkspaceLabel") : t("ownerWorkspace")}</small>
          <h1>{displayTitle}</h1>
          <p className="muted">{t("manageHousingActivity")}</p>
          <Link className="btn" to="/owner/dashboard">
            {t("backDashboard")}
          </Link>
        </div>
      </main>
    );
  const removeProperty = (apartmentId: number) => {
    if (!window.confirm(t("confirmDeleteApartment"))) {
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
          <small>{currentUser.role === "BROKER" ? t("brokerWorkspaceLabel") : t("ownerWorkspace")}</small>
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
