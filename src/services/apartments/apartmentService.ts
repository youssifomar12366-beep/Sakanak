import type { Apartment } from "../../types";
import {
  APARTMENTS_UPDATED_EVENT,
  deleteApartment,
  deleteApartmentAsAdmin,
  getAllApartments,
  getPublicApartments,
  readStoredApartments,
  saveApartment,
  updateApartmentStatus,
} from "../../utils/apartments";

export { APARTMENTS_UPDATED_EVENT };

export const getApartments = (): Apartment[] => getAllApartments();
export { getAllApartments };
export const getApartmentById = (id: number) => getApartments().find((apartment) => apartment.id === id);
export { getPublicApartments, readStoredApartments, saveApartment as createApartment, updateApartmentStatus };
export const updateApartment = updateApartmentStatus;
export { deleteApartment, deleteApartmentAsAdmin };
export const approveApartment = (id: number) => updateApartmentStatus(id, "approved");
export const rejectApartment = (id: number) => updateApartmentStatus(id, "rejected");
