import type { Apartment, Booking, User } from "../types";
import {
  deleteApartmentAsAdmin,
  getAllApartments,
  updateApartmentStatus,
} from "../utils/apartments";
import { getBookings } from "../utils/bookings";

const USERS_KEY = "nest.mockUsers";
const fallbackUsers: User[] = [
  { id: "user-student-001", name: "Youssif Omar", email: "youssif@test.com", phone: "01000000000", role: "STUDENT" },
  { id: "user-owner-001", name: "Ahmed Ali", email: "ahmed@test.com", phone: "01000000001", role: "OWNER" },
  { id: "user-broker-001", name: "Omar Hassan", email: "omar@test.com", phone: "01000000002", role: "BROKER" },
  { id: "user-admin-001", name: "Sakanak Admin", email: "admin@test.com", role: "ADMIN" },
];

export const getAdminUsers = (): User[] => {
  try {
    const value = localStorage.getItem(USERS_KEY);
    const users = value ? JSON.parse(value) : fallbackUsers;
    return Array.isArray(users) ? users : fallbackUsers;
  } catch {
    return fallbackUsers;
  }
};

export const deleteAdminUser = (userId: string): boolean => {
  const users = getAdminUsers();
  const user = users.find((item) => item.id === userId);
  if (!user || user.role === "ADMIN") return false;
  localStorage.setItem(USERS_KEY, JSON.stringify(users.filter((user) => user.id !== userId)));
  return true;
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