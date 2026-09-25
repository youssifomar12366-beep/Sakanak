import type { Bed, Room } from "../../types";
import type { Apartment } from "../../types";

export const getApartmentRooms = (apartment: Apartment): Room[] => {
  const count = Math.max(1, apartment.rooms || 1);
  const beds = Math.max(1, apartment.beds || 1);
  const base = Math.floor(beds / count);
  const remainder = beds % count;
  let nextBed = 1;
  return Array.from({ length: count }, (_, index) => {
    const bedCount = base + (index < remainder ? 1 : 0);
    const roomBeds = Array.from({ length: bedCount }, () => nextBed++);
    return { number: index + 1, beds: roomBeds };
  });
};

export const getApartmentBeds = (apartment: Apartment): Bed[] =>
  getApartmentRooms(apartment).flatMap((room) => room.beds.map((number) => ({ number, roomNumber: room.number, status: "available" as const })));
