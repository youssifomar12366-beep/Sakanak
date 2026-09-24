import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { homes } from "../constants/properties";
import WelcomeHeader from "../components/WelcomeHeader";
import BookingRequests from "../components/BookingRequests";
import PropertyCard from "../components/PropertyCard";
import {
  APARTMENTS_UPDATED_EVENT,
  getAllApartments,
} from "../utils/apartments";
import {
  BOOKINGS_UPDATED_EVENT,
  getBookings,
  getOwnerBookings,
  getStudentNotifications,
  isBookingApproved,
  formatBookingDate,
} from "../utils/bookings";
import "../styles/DashboardPage.css";
import type { Booking } from "../types";
import { translate } from "../locales";

function bookingLabel(booking: Booking, language: "ar" | "en") {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const quantity = booking.quantity || 1;
  return booking.bookingType === "apartment"
    ? t("apartment")
    : booking.bookingType === "room"
      ? `${quantity} ${t(quantity === 1 ? "room" : "roomsCount")}`
      : `${quantity} ${t(quantity === 1 ? "bed" : "beds")}`;
}

function bookingStatusLabel(status: Booking["status"], language: "ar" | "en") {
  return translate(language, status);
}

export default function Dashboard({
  owner = false,
  broker = false,
  admin = false,
  favoritesView = false,
  bookingsView = false,
}: {
  owner?: boolean;
  broker?: boolean;
  admin?: boolean;
  favoritesView?: boolean;
  bookingsView?: boolean;
}) {
  const { currentUser, logout, language, favorites } = useStore();
  const navigate = useNavigate();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [, setStatsVersion] = useState(0);
  useEffect(() => {
    const refreshStats = () => setStatsVersion((version) => version + 1);
    window.addEventListener(APARTMENTS_UPDATED_EVENT, refreshStats);
    window.addEventListener(BOOKINGS_UPDATED_EVENT, refreshStats);
    window.addEventListener("storage", refreshStats);
    return () => {
      window.removeEventListener(APARTMENTS_UPDATED_EVENT, refreshStats);
      window.removeEventListener(BOOKINGS_UPDATED_EVENT, refreshStats);
      window.removeEventListener("storage", refreshStats);
    };
  }, [currentUser?.id]);
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ authMessage: "You must sign in first to access this page." }}
      />
    );
  }
  const expected = admin
    ? "ADMIN"
    : owner
      ? "OWNER"
      : broker
        ? "BROKER"
        : "STUDENT";
  if (currentUser.role !== expected)
    return (
      <Navigate
        to={
          currentUser.role === "OWNER"
            ? "/owner/dashboard"
            : currentUser.role === "BROKER"
              ? "/broker/dashboard"
              : currentUser.role === "ADMIN"
                ? "/admin/dashboard"
                : "/student/dashboard"
        }
        replace
      />
    );
  const ownerProperties = getAllApartments().filter(
    (apartment) => apartment.ownerId === currentUser.id,
  );
  const ownerBookings = getOwnerBookings(currentUser.id);
  const recentBookings = [...ownerBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pendingBookings = ownerBookings.filter(
    (booking) => booking.status === "pending",
  );
  const confirmedBookings = ownerBookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const roleLabel = currentUser.role === "OWNER"
    ? t("apartmentOwnerRole")
    : currentUser.role === "BROKER"
      ? t("broker")
      : currentUser.role === "ADMIN"
        ? t("admin")
        : t("student");
  const initials =
    currentUser.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const ownerLinks = [
    [t("overviewLink"), "/owner/dashboard"],
    [t("myProperties"), "/owner/properties"],
    [t("bookingRequests"), "/owner/requests"],
    [t("notifications"), "/owner/notifications"],
    [t("myFavorites"), "/owner/favorites"],
    [t("profile"), "/owner/profile"],
  ];
  const brokerLinks = [
    [t("brokerDashboard"), "/broker/dashboard"],
    [t("listedProperties"), "/broker/properties"],
    [t("addNewListing"), "/broker/properties"],
    [t("clientInquiries"), "/broker/requests"],
    [t("myFavorites"), "/broker/favorites"],
    [t("profile"), "/profile"],
  ];
  const adminLinks = [
    [t("overviewLink"), "/admin/dashboard"],
    [t("myFavorites"), "/admin/favorites"],
    [t("profile"), "/profile"],
  ];
  const studentLinks = [
    [t("overviewLink"), "#"],
    [t("searchApartments"), "/apartments"],
    [t("myBookings"), "/student/bookings"],
    [t("myFavorites"), "/student/favorites"],
    [t("notifications"), "#"],
    [t("profile"), "/profile"],
  ];
  const links = admin ? adminLinks : owner ? ownerLinks : broker ? brokerLinks : studentLinks;
  const studentNotifications = !owner && !broker && !admin
    ? getStudentNotifications(currentUser.id)
    : [];

  return (
    <main className="dashboard">
      <aside>
        <div className="current-user">
          <span className="avatar">{initials}</span>
          <span>
            <b>{currentUser.name || "User"}</b>
            <small>{roleLabel}</small>
          </span>
        </div>
        {(owner || broker) && (
          <Link
            className="add-property"
            to={broker ? "/broker/properties" : "/owner/properties/new"}
          >
            <span>+</span> {t("addNewApartment")}
          </Link>
        )}
        {links.map(([label, path], index) => (
          <Link className={index === 0 ? "active" : ""} to={path} key={label}>
            {label}
          </Link>
        ))}
        <button
          className="logout-link"
          onClick={() => {
            logout();
            window.location.assign("/");
          }}
        >
          {t("logout")}
        </button>
      </aside>
      <section>
        <small>
          {admin
              ? t("adminOverview")
            : broker
              ? t("brokerWorkspaceLabel")
              : owner
                ? t("ownerWorkspaceLabel")
                : t("yourDashboard")}
        </small>
        {admin ? (
          <>
            <h1>{t("platformPulse")}</h1>
            <p className="muted">{currentUser.email}</p>
          </>
        ) : (
          <WelcomeHeader user={currentUser} language={language} />
        )}
        <div className="workspace-actions">
          {(owner || broker) && (
            <Link
              className="btn"
              to={broker ? "/broker/properties" : "/owner/properties/new"}
            >
              + {t("addNewApartment")}
            </Link>
          )}
        </div>
        {favoritesView ? (
          <>
            <h2>{t("myFavorites")}</h2>
            {getAllApartments().filter((apartment) => favorites.includes(apartment.id)).length === 0 ? (
              <p className="muted">{t("noFavorites")}</p>
            ) : (
              <div className="grid">
                {getAllApartments()
                  .filter((apartment) => favorites.includes(apartment.id))
                  .map((apartment) => (
                    <PropertyCard key={apartment.id} home={apartment} />
                  ))}
              </div>
            )}
          </>
        ) : bookingsView ? (
          <div className="panel">
            <h2>{t("myBookings")}</h2>
            {getBookings().filter((booking) => booking.studentId === currentUser.id).length === 0 ? (
              <p className="muted">{t("noBookings")}</p>
            ) : (
              getBookings()
                .filter((booking) => booking.studentId === currentUser.id)
                .map((booking) => {
                  const apartment = getAllApartments().find(
                    (item) => item.id === booking.apartmentId,
                  );
                  const confirmedOwner =
                    isBookingApproved(booking.status) &&
                    apartment?.ownerId === booking.ownerId;
                  return (
                    <div className="booking-row" key={booking.bookingId}>
                      {apartment && (
                        <img
                          src={apartment.image}
                          alt={booking.apartmentTitle}
                        />
                      )}
                      <span>
                        <b>{booking.apartmentTitle}</b>
                        <small>
                          {apartment
                            ? `${apartment.area}, ${apartment.city}`
                            : t("apartmentDetailsUnavailable")}
                        </small>
                        <small>
                          {bookingLabel(booking, language)} · {booking.price.toLocaleString()} {t("perMonth")}
                        </small>
                        <small>
                          {t("moveInDateLabel")} {formatBookingDate(booking.bookingDate, language) || t("notProvided")}
                        </small>
                        {booking.collegeOrWork && (
                          <small>{t("collegeOrWork")}: {booking.collegeOrWork}</small>
                        )}
                        {confirmedOwner ? (
                          <small>
                            {t("ownerContact")}: {apartment.publisherName} · {apartment.publisherPhone}
                          </small>
                        ) : booking.status === "rejected" ? (
                            <small>{t("bookingRejected")}</small>
                        ) : (
                          <small>
                            Owner contact information will be available after your booking is confirmed.
                          </small>
                        )}
                      </span>
                      <em>{bookingStatusLabel(booking.status, language)}</em>
                    </div>
                  );
                })
            )}
          </div>
        ) : (
          <>
            <div className="stats">
              <div>
                <small>{t("totalPropertiesLabel")}</small>
                <b>{ownerProperties.length}</b>
              </div>
              <div>
                <small>{t("pendingBookingsLabel")}</small>
                <b>{pendingBookings.length}</b>
              </div>
              <div>
                <small>{t("confirmedBookingsLabel")}</small>
                <b>{confirmedBookings.length}</b>
              </div>
            </div>
            <div className="panel">
              <h2>{owner || broker ? t("recentRequestsLabel") : t("yourCurrentBooking")}</h2>
              {owner || broker ? (
                recentBookings.length === 0 ? (
                  <p className="muted">{t("noBookingRequests")}</p>
                ) : (
                  <div
                    className="booking-row"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(
                        `${broker ? "/broker/requests" : "/owner/requests"}?bookingId=${encodeURIComponent(recentBookings[0].bookingId)}`,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(
                          `${broker ? "/broker/requests" : "/owner/requests"}?bookingId=${encodeURIComponent(recentBookings[0].bookingId)}`,
                        );
                      }
                    }}
                  >
                    {(() => {
                      const booking = recentBookings[0];
                      const apartment = getAllApartments().find(
                        (item) => item.id === booking.apartmentId,
                      );
                      return (
                        <>
                          {apartment && (
                            <img src={apartment.image} alt={booking.apartmentTitle} />
                          )}
                          <span>
                            <b>{booking.apartmentTitle}</b>
                            <small>
                              {booking.studentName || t("student")} · {bookingLabel(booking, language)}
                            </small>
                            {booking.collegeOrWork && (
                              <small>{t("collegeOrWork")}: {booking.collegeOrWork}</small>
                            )}
                            {booking.bookingDate && (
                              <small>{t("moveInDateLabel")}: {formatBookingDate(booking.bookingDate, language)}</small>
                            )}
                          </span>
                          <em>{bookingStatusLabel(booking.status, language)}</em>
                        </>
                      );
                    })()}
                  </div>
                )
              ) : (
                <div className="booking-row">
                  <img src={homes[0].image} alt="home" />
                  <span>
                    <b>The Nook Residence</b>
                    <small>Room 02 · Bed 01</small>
                  </span>
                  <em>{t("pending")}</em>
                </div>
              )}
            </div>
            {(owner || broker) && <BookingRequests user={currentUser} />}
            {!owner && !broker && !admin && (
              <div className="panel">
                <h2>{t("notifications")}</h2>
                {studentNotifications.length === 0 ? (
                  <p className="muted">{t("noNotifications")}</p>
                ) : (
                  studentNotifications.map((notification) => (
                    <div className="booking-row" key={notification.notificationId}>
                      <span>
                        <b>{notification.title}</b>
                        <small>
                          {notification.apartmentTitle} · {notification.quantity || 1} {notification.bookingType === "room" ? t((notification.quantity || 1) === 1 ? "room" : "roomsCount") : notification.bookingType === "bed" ? t((notification.quantity || 1) === 1 ? "bed" : "beds") : t("apartment")}
                        </small>
                        {notification.collegeOrWork && (
                          <small>{t("collegeOrWork")}: {notification.collegeOrWork}</small>
                        )}
                        {notification.bookingDate && (
                          <small>{t("moveInDateLabel")}: {formatBookingDate(notification.bookingDate, language)}</small>
                        )}
                        <small>{notification.price.toLocaleString()} EGP / month · {notification.status}</small>
                      </span>
                      <em>{notification.status}</em>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
