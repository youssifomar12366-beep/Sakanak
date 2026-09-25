export const BOOKING_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export const APARTMENT_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const BED_STATUSES = {
  AVAILABLE: "available",
  RESERVED: "reserved",
} as const;

export const ROOM_STATUSES = {
  AVAILABLE: "available",
  PARTIAL: "partial",
  RESERVED: "reserved",
} as const;

export const AVAILABILITY_STATUSES = {
  AVAILABLE: "available",
  RESERVED: "reserved",
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
export type ApartmentStatus = (typeof APARTMENT_STATUSES)[keyof typeof APARTMENT_STATUSES];
export type BedStatus = (typeof BED_STATUSES)[keyof typeof BED_STATUSES];
export type RoomStatus = (typeof ROOM_STATUSES)[keyof typeof ROOM_STATUSES];
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const isApprovedBookingStatus = (status: string): boolean =>
  status === BOOKING_STATUSES.APPROVED || status === BOOKING_STATUSES.CONFIRMED;
