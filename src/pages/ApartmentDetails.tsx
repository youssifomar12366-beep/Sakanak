import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BedDouble, Check, Home, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store/useStore";
import { apartmentTitle } from "../utils/apartment";
import { getPublicApartments } from "../utils/apartments";
import {
  createBooking,
  createBookingNotification,
  getApartmentBookings,
  getBookings,
  isBookingApproved,
  formatBookingDate,
} from "../utils/bookings";
import type { BookingType } from "../types";
import { AMENITIES_LIST } from "../constants";
import { translate } from "../locales";
import ImageLightbox from "../components/ImageLightbox";
import "../styles/ApartmentDetails.css";

export default function ApartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, currentUser } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const apartments = getPublicApartments();
  const home = apartments.find((item) => item.id === +id!) || apartments[0];
  const [selectedBeds, setSelectedBeds] = useState<number[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [bookingType, setBookingType] = useState<BookingType>("bed");
  const [bookingDate, setBookingDate] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [book, setBook] = useState(false);
  const [error, setError] = useState("");
  const [, setBookingVersion] = useState(0);

  const images = home.images?.length ? home.images : [home.image];
  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxOpen(false);
  }, [home.id]);
  const totalBeds = Math.max(1, home.beds || 1);
  const totalRooms = Math.max(1, home.rooms || 1);
  const bedNumbers = Array.from({ length: totalBeds }, (_, index) => index + 1);
  const bedPrice = home.price / totalBeds;
  const roomPrice = home.price / totalRooms;
  const pendingBookings = getApartmentBookings(home.id);
  const pendingBeds = new Set(
    pendingBookings
      .filter((booking) => booking.bookingType === "bed")
      .flatMap((booking) => booking.selectedBeds || (booking.selectedBed ? [booking.selectedBed] : [])),
  );
  const pendingRooms = new Set(
    pendingBookings
      .filter((booking) => booking.bookingType === "room")
      .flatMap((booking) => booking.selectedRooms || (booking.selectedRoom ? [booking.selectedRoom] : [])),
  );
  const isBedUnavailable = (bed: number) => pendingBeds.has(bed);
  const isRoomUnavailable = (room: number) => pendingRooms.has(room);
  const apartmentUnavailable = pendingBookings.some(
    (booking) => booking.bookingType === "apartment",
  );
  const hasConfirmedBooking = Boolean(
    currentUser &&
      getBookings().some(
        (booking) =>
          booking.studentId === currentUser.id &&
          booking.apartmentId === home.id &&
          isBookingApproved(booking.status),
      ),
  );
  const selectedQuantity = bookingType === "room" ? selectedRooms.length : selectedBeds.length;
  const quantity = bookingType === "apartment" ? 1 : selectedQuantity;
  const bookingPrice = bookingType === "apartment"
    ? home.price
    : (bookingType === "room" ? roomPrice : bedPrice) * (selectedQuantity || 1);

  const closeLightbox = () => setLightboxOpen(false);
  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % images.length);
  };
  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const submitBooking = () => {
    if (!currentUser) {
      navigate("/login", {
        state: { authMessage: t("loginRequired") },
      });
      return;
    }
    if (!bookingDate) {
      setError(t("selectMoveInDate"));
      return;
    }
    if (bookingType === "bed" && (selectedBeds.length === 0 || selectedBeds.some(isBedUnavailable))) {
      setError(t("selectAvailableBed"));
      return;
    }
    if (bookingType === "room" && (selectedRooms.length === 0 || selectedRooms.some(isRoomUnavailable))) {
      setError(t("selectAvailableRoom"));
      return;
    }
    if (bookingType === "apartment" && apartmentUnavailable) {
      setError(t("apartmentUnavailable"));
      return;
    }
    const ownerId = home.ownerId || `publisher-${home.publisherName}`;
    const createdBooking = createBooking({
      apartmentId: home.id,
      apartmentTitle: apartmentTitle(home, language),
      ownerId,
      studentId: currentUser?.id,
      studentName: currentUser?.name,
      studentEmail: currentUser?.email,
      studentPhone: currentUser?.phone,
      collegeOrWork: currentUser?.collegeOrWork,
      bookingType,
      quantity,
      selectedRoom: bookingType === "room" ? selectedRooms[0] : undefined,
      selectedRooms: bookingType === "room" ? selectedRooms : undefined,
      selectedBed: bookingType === "bed" ? selectedBeds[0] : undefined,
      selectedBeds: bookingType === "bed" ? selectedBeds : undefined,
      price: bookingPrice,
      bookingDate,
      status: "pending",
    });
    createBookingNotification({
      ownerId,
      bookingId: createdBooking.bookingId,
      studentId: currentUser?.id,
      title: "لديك طلب حجز جديد",
      studentName: currentUser?.name,
      studentEmail: currentUser?.email,
      studentPhone: currentUser?.phone,
      collegeOrWork: currentUser?.collegeOrWork,
      apartmentTitle: apartmentTitle(home, language),
      bookingType,
      quantity: createdBooking.quantity,
      selectedRoom: createdBooking.selectedRoom,
      selectedRooms: createdBooking.selectedRooms,
      selectedBed: createdBooking.selectedBed,
      selectedBeds: createdBooking.selectedBeds,
      price: bookingPrice,
      bookingDate: createdBooking.bookingDate,
      status: "pending",
    });
    setError("");
    setBookingVersion((value) => value + 1);
    setBook(false);
  };

  return (
    <main className="details">
      <Link to="/apartments" className="back">{t("allHomes")}</Link>
      <div className="gallery-grid">
        <div className="gallery-stage">
          <img
            className="gallery"
            src={images[activeImageIndex]}
            alt={`${apartmentTitle(home, language)} ${activeImageIndex + 1}`}
            role="button"
            tabIndex={0}
            onClick={openLightbox}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") openLightbox();
            }}
          />
          {images.length > 1 && (
            <>
              <button
                className="round gallery-nav gallery-nav-prev"
                type="button"
                aria-label={t("previousImage")}
                onClick={showPreviousImage}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="round gallery-nav gallery-nav-next"
                type="button"
                aria-label={t("nextImage")}
                onClick={showNextImage}
              >
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      <ImageLightbox
        images={images}
        activeImageIndex={activeImageIndex}
        title={apartmentTitle(home, language)}
        open={lightboxOpen}
        onClose={closeLightbox}
        onActiveImageChange={setActiveImageIndex}
        labels={{ previous: t("previousImage"), next: t("nextImage"), preview: t("imagePreview"), close: t("closeImage"), zoomIn: t("zoomIn"), zoomOut: t("zoomOut") }}
      />
      <div className="detail-layout">
        <div>
          <small>{t("verifiedListing")}</small>
          <h1>{apartmentTitle(home, language)}</h1>
          <p className="muted">{home.area}, {home.city} · {t("walkFromUniversity")}</p>
          <p className="description">{t("description")}</p>
          {hasConfirmedBooking && <div className="publisher-contact"><strong>{home.publisherRole === "BROKER" ? t("brokerContact") : t("directOwnerContact")}</strong><span>{home.publisherName}</span><a href={`tel:${home.publisherPhone}`}>{home.publisherPhone}</a></div>}
          <h2>{t("whatsIncluded")}</h2>
          <div className="amenities">
            {AMENITIES_LIST.filter((amenity) => home.amenities.includes(amenity.id)).map((amenity) => (
              <span key={amenity.id}>{t(amenity.translationKey)}</span>
            ))}
          </div>
          <h2>{t("chooseYourRoom")}</h2>
          <div className="room">
            <div><b>{totalRooms} {t("roomUnit")} · {totalBeds} {t("bedUnit")}</b><p className="muted">{t("chooseRoomOrBed")}</p></div>
            <strong>{bookingPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>{t("perMonth")}</small></strong>
            {bookingType === "bed" && <div className="beds">{bedNumbers.map((bed) => { const unavailable = isBedUnavailable(bed); const selected = selectedBeds.includes(bed); return <button id={`bed-${bed}`} disabled={unavailable} className={selected ? "selected" : ""} onClick={() => {setSelectedBeds((current) => selected ? current.filter((item) => item !== bed) : [...current, bed]);setError("")}} key={`bed-${bed}`}><BedDouble size={15}/>{t("bed")} {bed}<small>{unavailable ? t("booked") : selected ? t("selected") : t("available")}</small></button>; })}</div>}
            {bookingType === "room" && <div className="beds">{Array.from({ length: totalRooms }, (_, index) => index + 1).map((room) => { const unavailable = isRoomUnavailable(room); const selected = selectedRooms.includes(room); return <button disabled={unavailable} className={selected ? "selected" : ""} onClick={() => {setSelectedRooms((current) => selected ? current.filter((item) => item !== room) : [...current, room]);setError("")}} key={room}><Home size={15}/>{t("room")} {room}<small>{unavailable ? t("booked") : selected ? t("selected") : t("available")}</small></button>; })}</div>}
          </div>
        </div>
        <aside className="booking">
          <div className="tabs"><button className={bookingType === "bed" ? "selected" : ""} onClick={() => {setBookingType("bed");setSelectedRooms([]);setError("")}}>{t("bookBed")}</button><button className={bookingType === "room" ? "selected" : ""} onClick={() => {setBookingType("room");setSelectedBeds([]);setError("")}}>{t("bookRoom")}</button><button className={bookingType === "apartment" ? "selected" : ""} onClick={() => {setBookingType("apartment");setSelectedBeds([]);setSelectedRooms([]);setError("")}}>{t("bookApartment")}</button></div>
          <small>{t("startingFromLabel")}</small><h2>{bookingPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>{t("perMonth")}</small></h2>
          <label>{t("moveInDateLabel")}<input dir="auto" type="date" value={bookingDate} onChange={(event) => { setBookingDate(event.target.value); setError(""); }} /></label>
          <p>{t("freeToRequest")}</p>
          <button className="btn wide" disabled={bookingType === "apartment" && apartmentUnavailable} onClick={() => {if (!currentUser) {navigate("/login", {state: {authMessage: t("loginRequired")}}); return;} setError("");setBook(true)}}>{t("continueRequest")} <ArrowRight size={15} /></button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </aside>
      </div>
      {book && <div className="modal-bg"><div className="modal"><button onClick={() => setBook(false)} className="close"><X /></button><div className="success"><Check /></div><small>{t("almostThere")}</small><h2>{t("reviewRequest")}</h2><p className="muted">{t("requesting")} {quantity} {bookingType === "room" ? t(quantity === 1 ? "room" : "roomsCount") : bookingType === "bed" ? t(quantity === 1 ? "bed" : "beds") : t("apartment")} at {apartmentTitle(home, language)}.</p><hr /><p>{t("moveInDateLabel")} <b>{formatBookingDate(bookingDate, language)}</b></p><p>{t("monthlyPrice")} <b>{bookingPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} EGP</b></p><label><input dir="auto" type="checkbox" defaultChecked /> {t("bookingTerms")}</label><button className="btn wide" onClick={submitBooking}>{t("sendBooking")}</button></div></div>}
    </main>
  );
}
