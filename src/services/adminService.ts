import type { Apartment, Booking } from "../types";
import {
  deleteApartmentAsAdmin,
  getAllApartments,
  updateApartmentStatus,
} from "../utils/apartments";
import { getBookings } from "../utils/bookings";
import { deleteUser, getUsers } from "./users/userService";

export const getAdminUsers = getUsers;

export const deleteAdminUser = (userId: string): boolean => {
  const users = getAdminUsers();
  const user = users.find((item) => item.id === userId);
  if (!user || user.role === "ADMIN") return false;
  return deleteUser(userId);
};

export type AdminApartment = Apartment & { status: "pending" | "approved" | "rejected" };

export const getAdminApartments = (): AdminApartment[] =>
  getAllApartments().map((apartment) => ({
    ...apartment,
    status: apartment.status || "approved",
  }));

export const approveApartment = (apartmentId: number) =>
  updateApartmentStatus(apartmentId, "approved");

export const rejectApartment = (apartmentId: number) =>
  updateApartmentStatus(apartmentId, "rejected");

export const deleteAdminApartment = (apartmentId: number) =>
  deleteApartmentAsAdmin(apartmentId);

export const getAdminBookings = (): Booking[] => getBookings();