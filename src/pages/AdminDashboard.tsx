import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import type { Booking, User } from "../types";
import {
  approveApartment,
  deleteAdminApartment,
  deleteAdminUser,
  getAdminApartments,
  getAdminBookings,
  getAdminUsers,
  rejectApartment,
  type AdminApartment,
} from "../services/adminService";
import { APARTMENTS_UPDATED_EVENT, getAllApartments } from "../services/apartments/apartmentService";
import { BOOKINGS_UPDATED_EVENT, cancelBooking, formatBookingDate, getBookings, isBookingApproved } from "../services/bookings/bookingService";
import { createAdminMessage } from "../services/messages/messageService";
import "../styles/DashboardPage.css";
import "../styles/AdminDashboard.css";
import ImageLightbox from "../components/ImageLightbox";

type AdminView = "overview" | "pending" | "apartments" | "users" | "bookings" | "requests";

const labels = {
  en: { overview: "Overview", pending: "Pending Apartments", apartments: "All Apartments", users: "Users", bookings: "Bookings", requests: "Requests", favorites: "My Favorites", totalUsers: "Total Users", totalApartments: "Total Apartments", pendingApartments: "Pending Apartments", totalBookings: "Total Bookings", pendingRequests: "Pending Requests", details: "Details", approve: "Approve", reject: "Reject", delete: "Delete", noData: "No records yet.", role: "Role", status: "Status", phone: "Phone", name: "Name", student: "Student", apartment: "Apartment", publisher: "Owner / Broker", ownerInfo: "Owner / broker details", studentInfo: "Student details", type: "Type", date: "Date", collegeOrWork: "College or workplace", selectedBeds: "Selected beds", selectedRooms: "Selected rooms", confirmDelete: "Are you sure you want to delete this record?", sendMessage: "Send message", send: "Send", cancel: "Cancel", cancelBooking: "Cancel booking", confirmCancelBooking: "Are you sure you want to cancel this booking?", dashboard: "ADMIN DASHBOARD", currency: "EGP" },
  ar: { overview: "نظرة عامة", pending: "الشقق المعلقة", apartments: "كل الشقق", users: "المستخدمون", bookings: "الحجوزات", requests: "الطلبات", favorites: "مفضلتي", totalUsers: "إجمالي المستخدمين", totalApartments: "إجمالي الشقق", pendingApartments: "شقق بانتظار الموافقة", totalBookings: "إجمالي الحجوزات", pendingRequests: "الطلبات المعلقة", details: "التفاصيل", approve: "موافقة", reject: "رفض", delete: "حذف", noData: "لا توجد سجلات بعد.", role: "الدور", status: "الحالة", phone: "الهاتف", name: "الاسم", student: "الطالب", apartment: "الشقة", publisher: "المالك / الوسيط", ownerInfo: "بيانات المالك / الوسيط", studentInfo: "بيانات الطالب", type: "النوع", date: "التاريخ", collegeOrWork: "الكلية أو العمل", selectedBeds: "الأسرة المختارة", selectedRooms: "الغرف المختارة", confirmDelete: "هل أنت متأكد من حذف هذا السجل؟", sendMessage: "إرسال رسالة", send: "إرسال", cancel: "إلغاء", cancelBooking: "إلغاء الحجز", confirmCancelBooking: "هل أنت متأكد من إلغاء هذا الحجز؟", dashboard: "لوحة تحكم الأدمن", currency: "جنيه مصري" },
} as const;
type AdminLabels = { [Key in keyof typeof labels.en]: string };

function statusLabel(status: AdminApartment["status"] | Booking["status"], isArabic: boolean) {
  const values = isArabic
    ? { pending: "معلق", approved: "مقبول", rejected: "مرفوض", confirmed: "مؤكد", cancelled: "ملغى" }
    : { pending: "Pending", approved: "Approved", rejected: "Rejected", confirmed: "Confirmed", cancelled: "Cancelled" };
  return values[status];
}

function roleLabel(role: User["role"], language: "ar" | "en") {
  const key = role === "OWNER" ? "roleOwner" : role === "BROKER" ? "roleBroker" : role === "STUDENT" ? "roleStudent" : "roleAdmin";
  return translate(language, key);
}

function bookingTypeLabel(type: Booking["bookingType"], language: "ar" | "en") {
  return translate(language, type);
}

function genderLabel(gender: AdminApartment["allowedGender"], language: "ar" | "en") {
  return translate(language, gender === "females" ? "femalesOnly" : gender === "males" ? "malesOnly" : "anyBoth");
}

export default function AdminDashboard() {
  const { currentUser, logout, language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const text = labels[language];
  const isArabic = language === "ar";
  const [view, setView] = useState<AdminView>("overview");
  const [version, setVersion] = useState(0);
  const [selectedApartment, setSelectedApartment] = useState<AdminApartment | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageUser, setMessageUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const apartments = getAdminApartments();
  const users = getAdminUsers();
  const bookings = getAdminBookings();
  const pendingApartments = apartments.filter((apartment) => apartment.status === "pending");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const confirmedBookings = bookings.filter((booking) => isBookingApproved(booking.status));
  const requestBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "rejected",
  );

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener(APARTMENTS_UPDATED_EVENT, refresh);
    window.addEventListener(BOOKINGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(APARTMENTS_UPDATED_EVENT, refresh);
      window.removeEventListener(BOOKINGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "ADMIN") {
    return <Navigate to={currentUser.role === "OWNER" ? "/owner/dashboard" : currentUser.role === "BROKER" ? "/broker/dashboard" : "/student/dashboard"} replace />;
  }

  const removeApartment = (apartmentId: number) => {
    if (!window.confirm(text.confirmDelete)) return;
    if (deleteAdminApartment(apartmentId)) setVersion((value) => value + 1);
  };
  const removeUser = (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user || user.role === "ADMIN" || !window.confirm(text.confirmDelete)) return;
    if (deleteAdminUser(userId)) setVersion((value) => value + 1);
  };
  const sendMessage = () => {
    if (!messageUser || messageUser.role === "ADMIN" || !message.trim()) return;
    createAdminMessage(messageUser.id, message.trim());
    setMessage("");
    setMessageUser(null);
  };
  const menu: [AdminView, string][] = [["overview", text.overview], ["pending", text.pending], ["apartments", text.apartments], ["users", text.users], ["bookings", text.bookings], ["requests", text.requests]];

  return (
    <main className="dashboard admin-dashboard" key={version}>
      <aside>
        <div className="current-user">
          <span className="avatar">AD</span>
          <span><b>{currentUser.name}</b><small>{text.dashboard}</small></span>
        </div>
        {menu.map(([key, label]) => <button className={view === key ? "active" : ""} key={key} onClick={() => setView(key)}>{label}</button>)}
        <Link to="/profile">{t("profile")}</Link>
        <Link to="/admin/favorites">{text.favorites}</Link>
        <button className="logout-link" onClick={() => { logout(); window.location.assign("/"); }}>{t("logout")}</button>
      </aside>
      <section>
        <small>{text.dashboard}</small>
        <h1>{view === "overview" ? t("platformPulse") : menu.find(([key]) => key === view)?.[1]}</h1>
        {view === "overview" && <Overview text={text} apartments={apartments} pendingApartments={pendingApartments} bookings={bookings} pendingBookings={pendingBookings} users={users.length} />}
        {view === "pending" && <ApartmentList apartments={pendingApartments} text={text} isArabic={isArabic} onDetails={setSelectedApartment} onApprove={(id) => { approveApartment(id); setVersion((value) => value + 1); }} onReject={(id) => { rejectApartment(id); setVersion((value) => value + 1); }} onDelete={removeApartment} />}
        {view === "apartments" && <ApartmentList apartments={apartments} text={text} isArabic={isArabic} onDetails={setSelectedApartment} onDelete={removeApartment} />}
        {view === "users" && <UserList users={users} text={text} language={language} currentUserId={currentUser.id} onDetails={setSelectedUser} onMessage={setMessageUser} onDelete={removeUser} />}
        {(view === "bookings" || view === "requests") && <BookingList bookings={view === "requests" ? requestBookings : confirmedBookings} text={text} isArabic={isArabic} />}
      </section>
      {selectedApartment && <ApartmentDetailsModal apartment={selectedApartment} text={text} isArabic={isArabic} onClose={() => setSelectedApartment(null)} />}
      {selectedUser && <UserDetailsModal user={selectedUser} text={text} onClose={() => setSelectedUser(null)} />}
      {messageUser && <MessageModal user={messageUser} text={text} message={message} onChange={setMessage} onSend={sendMessage} onClose={() => { setMessage(""); setMessageUser(null); }} />}
    </main>
  );
}

function Overview({ text, apartments, pendingApartments, bookings, pendingBookings, users }: { text: AdminLabels; apartments: AdminApartment[]; pendingApartments: AdminApartment[]; bookings: Booking[]; pendingBookings: Booking[]; users: number }) {
  return <div className="admin-content"><div className="stats"><div><small>{text.totalUsers}</small><b>{users}</b></div><div><small>{text.totalApartments}</small><b>{apartments.length}</b></div><div><small>{text.pendingApartments}</small><b>{pendingApartments.length}</b></div><div><small>{text.totalBookings}</small><b>{bookings.length}</b></div><div><small>{text.pendingRequests}</small><b>{pendingBookings.length}</b></div></div><div className="panel"><h2>{text.pendingApartments}</h2>{pendingApartments.length === 0 ? <p className="muted">{text.noData}</p> : pendingApartments.slice(0, 3).map((apartment) => <div className="booking-row" key={apartment.id}><img src={apartment.image} alt={apartment.area} /><span><b>{apartment.area}, {apartment.city}</b><small>{apartment.publisherName} · {apartment.price.toLocaleString()} {text.currency}</small></span><em>{statusLabel(apartment.status, false)}</em></div>)}</div></div>;
}

function ApartmentList({ apartments, text, isArabic, onDetails, onApprove, onReject, onDelete }: { apartments: AdminApartment[]; text: AdminLabels; isArabic: boolean; onDetails: (apartment: AdminApartment) => void; onApprove?: (id: number) => void; onReject?: (id: number) => void; onDelete: (id: number) => void }) {
  if (apartments.length === 0) return <p className="muted">{text.noData}</p>;
  return <div className="panel admin-list">{apartments.map((apartment) => <div className="admin-record" key={apartment.id}><img src={apartment.image} alt={apartment.area} /><span><b>{apartment.area}, {apartment.city}</b><small>{apartment.publisherName} · {apartment.publisherRole} · {apartment.price.toLocaleString()} {text.currency}</small><em>{statusLabel(apartment.status, isArabic)}</em></span><div className="admin-actions"><button className="btn" onClick={() => onDetails(apartment)}>{text.details}</button>{onApprove && <button className="btn" onClick={() => onApprove(apartment.id)}>{text.approve}</button>}{onReject && <button className="btn" onClick={() => onReject(apartment.id)}>{text.reject}</button>}<button className="btn" onClick={() => onDelete(apartment.id)}>{text.delete}</button></div></div>)}</div>;
}

function UserList({ users, text, language, currentUserId, onDetails, onMessage, onDelete }: { users: ReturnType<typeof getAdminUsers>; text: AdminLabels; language: "ar" | "en"; currentUserId: string; onDetails: (user: User) => void; onMessage: (user: User) => void; onDelete: (id: string) => void }) {
  return <div className="panel admin-list">{users.map((user) => <div className="admin-record" key={user.id}><span><b>{user.name}</b><small>{user.email} · {user.phone || text.noData}</small><em>{roleLabel(user.role, language)}</em></span><div className="admin-actions"><button className="btn" onClick={() => onDetails(user)}>{text.details}</button>{user.role !== "ADMIN" && <button className="btn" onClick={() => onMessage(user)}>{text.sendMessage}</button>}{user.role !== "ADMIN" && user.id !== currentUserId && <button className="btn" onClick={() => onDelete(user.id)}>{text.delete}</button>}</div></div>)}</div>;
}

function MessageModal({ user, text, message, onChange, onSend, onClose }: { user: User; text: AdminLabels; message: string; onChange: (value: string) => void; onSend: () => void; onClose: () => void }) {
  return <div className="admin-modal" role="dialog" aria-modal="true" aria-label={text.sendMessage}>
    <div className="panel admin-user-modal">
      <button className="admin-close" onClick={onClose} aria-label={text.details}>×</button>
      <h2>{text.sendMessage}</h2>
      <p className="muted">{user.name}</p>
      <textarea value={message} onChange={(event) => onChange(event.target.value)} rows={5} autoFocus />
      <div className="admin-actions">
        <button className="btn" type="button" onClick={onSend} disabled={!message.trim()}>{text.send}</button>
        <button className="btn" type="button" onClick={onClose}>{text.cancel}</button>
      </div>
    </div>
  </div>;
}

function UserDetailsModal({ user, text, onClose }: { user: User; text: AdminLabels; onClose: () => void }) {
  return <div className="admin-modal" role="dialog" aria-modal="true" aria-label={text.details}>
    <div className="panel admin-user-modal">
      <button className="admin-close" onClick={onClose} aria-label={text.details}>×</button>
      <h2>{text.details}</h2>
      <div className="admin-user-facts">
        <p><b>{text.name}:</b> {user.name}</p>
        <p><b>{text.phone}:</b> {user.phone || text.noData}</p>
        <p><b>Email:</b> {user.email}</p>
        {user.collegeOrWork && <p><b>{text.collegeOrWork}:</b> {user.collegeOrWork}</p>}
        <p><b>{text.role}:</b> {user.role}</p>
      </div>
    </div>
  </div>;
}

function BookingList({ bookings, text, isArabic }: { bookings: Booking[]; text: AdminLabels; isArabic: boolean }) {
  if (bookings.length === 0) return <p className="muted">{text.noData}</p>;
  return <div className="panel admin-list">{bookings.map((booking) => {
    const apartment = getAllApartments().find((item) => item.id === booking.apartmentId);
    const ownerName = apartment?.publisherName || booking.ownerId;
    const ownerPhone = apartment?.publisherPhone || text.noData;
    const selectedBeds = booking.selectedBeds?.join(", ");
    const selectedRooms = booking.selectedRooms?.join(", ");
    return <div className="admin-record" key={booking.bookingId}>
      <span>
        <b>{booking.apartmentTitle}</b>
        <small><strong>{text.ownerInfo}</strong></small>
        <small>{text.name}: {ownerName}</small>
        <small>{text.phone}: {ownerPhone}</small>
        <small><strong>{text.studentInfo}</strong></small>
        <small>{text.name}: {booking.studentName || text.noData}</small>
        <small>{text.phone}: {booking.studentPhone || text.noData}</small>
        <small>{text.collegeOrWork}: {booking.collegeOrWork || text.noData}</small>
        <small>{text.type}: {bookingTypeLabel(booking.bookingType, isArabic ? "ar" : "en")} · {text.date}: {formatBookingDate(booking.bookingDate, isArabic ? "ar" : "en") || text.noData}</small>
        {selectedBeds && <small>{text.selectedBeds}: {selectedBeds}</small>}
        {selectedRooms && <small>{text.selectedRooms}: {selectedRooms}</small>}
      </span>
      <em>{statusLabel(booking.status, isArabic)}</em>
    </div>;
  })}</div>;
}

type BedState = {
  number: number;
  booking?: Booking;
};

function ApartmentDetailsModal({ apartment, text, isArabic, onClose }: { apartment: AdminApartment; text: AdminLabels; isArabic: boolean; onClose: () => void }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const images = apartment.images.length ? apartment.images : [apartment.image];
  const bookings = getBookings().filter(
    (booking) => booking.apartmentId === apartment.id && (booking.status === "pending" || isBookingApproved(booking.status)),
  );
  const rooms = createRoomBedGroups(apartment.rooms, apartment.beds).map((beds, index) => ({
    number: index + 1,
    beds: beds.map((number): BedState => ({
      number,
      booking: bookings.find((booking) => bookingForBed(booking, number, index + 1, beds)),
    })),
  }));
  const roomStatuses = rooms.map((room) => getRoomStatus(room.beds));
  const availableBeds = rooms.flatMap((room) => room.beds).filter((bed) => !bed.booking).length;
  const reservedBeds = apartment.beds - availableBeds;
  const availableRooms = roomStatuses.filter((status) => status === "available").length;
  const partialRooms = roomStatuses.filter((status) => status === "partial").length;
  const fullRooms = roomStatuses.filter((status) => status === "full").length;
  const statusText = isArabic
    ? { available: "متاحة", partial: "محجوزة جزئيًا", full: "محجوزة بالكامل", reserved: "محجوز", bed: "سرير", room: "غرفة", summary: "ملخص سريع", price: "السعر", city: "المحافظة / المدينة", area: "المنطقة", district: "الحي", address: "العنوان", building: "رقم المبنى", floor: "رقم الدور", rooms: "إجمالي الغرف", beds: "إجمالي السراير", availableRooms: "الغرف المتاحة", partialRooms: "الغرف المحجوزة جزئيًا", fullRooms: "الغرف المحجوزة بالكامل", availableBeds: "السراير المتاحة", reservedBeds: "السراير المحجوزة", amenities: "المرافق", allowedGender: "النوع المسموح", publisher: "المالك / الوسيط", booking: "الحجز", student: "الطالب", phone: "الهاتف", college: "الكلية أو العمل", type: "نوع الحجز", status: "الحالة" }
    : { available: "Available", partial: "Partially Reserved", full: "Fully Reserved", reserved: "Reserved", bed: "Bed", room: "Room", summary: "Quick summary", price: "Price", city: "City / governorate", area: "Area", district: "District", address: "Address", building: "Building number", floor: "Floor number", rooms: "Total rooms", beds: "Total beds", availableRooms: "Available rooms", partialRooms: "Partially reserved rooms", fullRooms: "Fully reserved rooms", availableBeds: "Available beds", reservedBeds: "Reserved beds", amenities: "Amenities", allowedGender: "Allowed gender", publisher: "Owner / broker", booking: "Booking", student: "Student", phone: "Phone", college: "College or workplace", type: "Booking type", status: "Status" };
  const statusLabelForRoom = (status: RoomStatus) => statusText[status];

  return <div className="admin-modal" role="dialog" aria-modal="true">
    <div className="panel admin-property-modal">
      <button className="admin-close" onClick={onClose} aria-label={text.details}>×</button>
      <div className="gallery-grid">
        <div className="gallery-stage">
          <img
            className="gallery"
            src={images[activeImageIndex]}
            alt={`${apartment.publisherName} ${activeImageIndex + 1}`}
            role="button"
            tabIndex={0}
            onClick={() => setLightboxOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setLightboxOpen(true);
            }}
          />
          {images.length > 1 && (
            <>
              <button
                className="round gallery-nav gallery-nav-prev"
                type="button"
                aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
                onClick={() => setActiveImageIndex((current) => (current - 1 + images.length) % images.length)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="round gallery-nav gallery-nav-next"
                type="button"
                aria-label={isArabic ? "الصورة التالية" : "Next image"}
                onClick={() => setActiveImageIndex((current) => (current + 1) % images.length)}
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
        title={apartment.publisherName}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onActiveImageChange={setActiveImageIndex}
        renderInPortal
        labels={{ previous: isArabic ? "الصورة السابقة" : "Previous image", next: isArabic ? "الصورة التالية" : "Next image", preview: isArabic ? "معاينة الصورة" : "Image preview", close: isArabic ? "إغلاق الصورة" : "Close image", zoomIn: isArabic ? "تكبير" : "Zoom in", zoomOut: isArabic ? "تصغير" : "Zoom out" }}
      />
      <h2>{apartment.area}, {apartment.city}</h2>
      <p className="muted">{apartment.fullLocation || apartment.address}</p>
      <div className="admin-property-summary"><h3>{statusText.summary}</h3><div className="stats"><div><small>{statusText.rooms}</small><b>{apartment.rooms}</b></div><div><small>{statusText.beds}</small><b>{apartment.beds}</b></div><div><small>{statusText.availableRooms}</small><b>{availableRooms}</b></div><div><small>{statusText.partialRooms}</small><b>{partialRooms}</b></div><div><small>{statusText.fullRooms}</small><b>{fullRooms}</b></div><div><small>{statusText.availableBeds}</small><b>{reservedBeds ? availableBeds : apartment.beds}</b></div><div><small>{statusText.reservedBeds}</small><b>{reservedBeds}</b></div></div></div>
      <div className="admin-property-facts"><p><b>{statusText.price}:</b> {apartment.price.toLocaleString()} {text.currency}</p><p><b>{statusText.city}:</b> {apartment.city}</p><p><b>{statusText.area}:</b> {apartment.area}</p><p><b>{statusText.district}:</b> {apartment.district}</p><p><b>{statusText.address}:</b> {apartment.address}</p><p><b>{statusText.building}:</b> {apartment.buildingNumber}</p><p><b>{statusText.floor}:</b> {apartment.floorNumber}</p><p><b>{statusText.allowedGender}:</b> {genderLabel(apartment.allowedGender, isArabic ? "ar" : "en")}</p><p><b>{statusText.publisher}:</b> {apartment.publisherName} · {apartment.publisherPhone || text.noData}</p><p><b>{statusText.amenities}:</b> {apartment.amenities.join(", ") || text.noData}</p></div>
      <div className="admin-room-list">{rooms.map((room) => <div className="admin-room" key={room.number}><div className="admin-room-heading"><h3>{statusText.room} {room.number}</h3><em>{statusLabelForRoom(getRoomStatus(room.beds))}</em></div>{room.beds.map((bed) => <div className="admin-bed" key={bed.number}><span>{statusText.bed} {bed.number}</span><em>{bed.booking ? statusText.reserved : statusText.available}</em>{bed.booking && <><small>{statusText.booking}: {bed.booking.studentName || text.noData} · {statusText.phone}: {bed.booking.studentPhone || text.noData} · {statusText.college}: {bed.booking.collegeOrWork || text.noData} · {statusText.type}: {bookingTypeLabel(bed.booking.bookingType, isArabic ? "ar" : "en")} · {statusText.status}: {statusLabel(bed.booking.status, isArabic)}</small><button className="btn" type="button" onClick={() => { if (!window.confirm(text.confirmCancelBooking)) return; cancelBooking(bed.booking!.bookingId); }}>{text.cancelBooking}</button></>}</div>)}</div>)}</div>
    </div>
  </div>;
}

type RoomStatus = "available" | "partial" | "full";

function createRoomBedGroups(roomCount: number, bedCount: number): number[][] {
  const safeRooms = Math.max(1, roomCount || 1);
  const safeBeds = Math.max(1, bedCount || 1);
  const base = Math.floor(safeBeds / safeRooms);
  const remainder = safeBeds % safeRooms;
  let nextBed = 1;
  return Array.from({ length: safeRooms }, (_, index) => {
    const count = base + (index < remainder ? 1 : 0);
    const beds = Array.from({ length: count }, () => nextBed++);
    return beds;
  });
}

function bookingForBed(booking: Booking, bedNumber: number, roomNumber: number, roomBeds: number[]): boolean {
  if (booking.bookingType === "apartment") return true;
  if (booking.bookingType === "room") return booking.selectedRooms?.includes(roomNumber) || booking.selectedRoom === roomNumber || false;
  return booking.selectedBeds?.includes(bedNumber) || booking.selectedBed === bedNumber || roomBeds.includes(bedNumber) && booking.selectedRooms?.includes(roomNumber) || false;
}

function getRoomStatus(beds: BedState[]): RoomStatus {
  const reserved = beds.filter((bed) => bed.booking).length;
  if (reserved === 0) return "available";
  if (reserved === beds.length) return "full";
  return "partial";
}