import type { Apartment, Availability, Bed, Booking, Room } from "../../types";
import { getApartmentBeds, getApartmentRooms } from "../rooms/roomService";
import { getBookings } from "../../utils/bookings";

const bookingUsesBed = (booking: Booking, bed: Bed, room: Room) =>
  booking.bookingType === "apartment" ||
  (booking.bookingType === "room" && (booking.selectedRooms?.includes(room.number) || booking.selectedRoom === room.number)) ||
  (booking.bookingType === "bed" && (booking.selectedBeds?.includes(bed.number) || booking.selectedBed === bed.number));

export const getApartmentAvailability = (apartment: Apartment): Availability => {
  const rooms = getApartmentRooms(apartment);
  const bookings = getBookings().filter((booking) => booking.apartmentId === apartment.id && booking.status !== "rejected" && booking.status !== "cancelled");
  const beds = getApartmentBeds(apartment).map((bed) => {
    const room = rooms.find((item) => item.number === bed.roomNumber) || rooms[0];
    const booking = bookings.find((item) => bookingUsesBed(item, bed, room));
    return { ...bed, status: booking ? "reserved" as const : "available" as const, bookingId: booking?.bookingId };
  });
  return { apartmentId: apartment.id, rooms, beds, status: beds.every((bed) => bed.status === "reserved") ? "reserved" : "available" };
};

export const getBedStatus = (availability: Availability, bedNumber: number) =>
  availability.beds.find((bed) => bed.number === bedNumber)?.status || "available";

export const getRoomStatus = (availability: Availability, roomNumber: number) => {
  const beds = availability.beds.filter((bed) => bed.roomNumber === roomNumber);
  const reserved = beds.filter((bed) => bed.status === "reserved").length;
  if (reserved === 0) return "available" as const;
  if (reserved === beds.length) return "reserved" as const;
  return "partial" as const;
};
