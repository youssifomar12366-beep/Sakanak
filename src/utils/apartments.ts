import type { Apartment } from "../types";
import { AMENITIES_LIST } from "../constants";
import { homes } from "../constants/properties";

const APARTMENTS_KEY = "nest.apartments";
const DELETED_APARTMENTS_KEY = "nest.deletedApartments";
export const APARTMENTS_UPDATED_EVENT = "nest:apartments-updated";
const validAmenityIds = new Set<string>(
  AMENITIES_LIST.map((amenity) => amenity.id),
);

export const readStoredApartments = (): Apartment[] => {
  try {
    const value = localStorage.getItem(APARTMENTS_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Apartment =>
        Boolean(item && typeof item === "object" && "id" in item),
      )
      .map((apartment) => ({
        ...apartment,
        amenities: Array.isArray(apartment.amenities)
          ? apartment.amenities.filter(
              (amenity): amenity is string =>
                typeof amenity === "string" && validAmenityIds.has(amenity),
            )
          : [],
        allowedGender:
          apartment.allowedGender === "females" ||
          apartment.allowedGender === "males"
            ? apartment.allowedGender
            : "any",
      }));
  } catch {
    return [];
  }
};

export const getAllApartments = (): Apartment[] => [
  ...homes.filter((home) => {
    try {
      const value = localStorage.getItem(DELETED_APARTMENTS_KEY);
      const deleted = value ? (JSON.parse(value) as number[]) : [];
      return !deleted.includes(home.id);
    } catch {
      return true;
    }
  }),
  ...readStoredApartments(),
];

export const getPublicApartments = (): Apartment[] =>
  getAllApartments().filter((apartment) => apartment.status !== "pending" && apartment.status !== "rejected");

export const saveApartment = (apartment: Apartment): void => {
  const apartments = readStoredApartments();
  let nextApartment = apartment;
  while (apartments.some((item) => item.id === nextApartment.id)) {
    nextApartment = { ...nextApartment, id: nextApartment.id + 1 };
  }
  try {
    localStorage.setItem(
      APARTMENTS_KEY,
      JSON.stringify([...apartments, nextApartment]),
    );
    localStorage.setItem("nest.lastApartment", JSON.stringify(nextApartment));
    window.dispatchEvent(new Event(APARTMENTS_UPDATED_EVENT));
  } catch (cause) {
    console.error("Failed to save apartment to localStorage.", cause);
    throw new Error(
      "Unable to save the apartment. Please remove some stored data and try again.",
    );
  }
};

export const deleteApartment = (apartmentId: number, ownerId: string): boolean => {
  const apartments = readStoredApartments();
  const apartment = apartments.find((item) => item.id === apartmentId);
  if (!apartment || apartment.ownerId !== ownerId) return false;
  localStorage.setItem(
    APARTMENTS_KEY,
    JSON.stringify(apartments.filter((item) => item.id !== apartmentId)),
  );
  window.dispatchEvent(new Event(APARTMENTS_UPDATED_EVENT));
  return true;
};

export const updateApartmentStatus = (
  apartmentId: number,
  status: NonNullable<Apartment["status"]>,
): Apartment | undefined => {
  const apartments = readStoredApartments();
  const apartment = apartments.find((item) => item.id === apartmentId);
  if (!apartment) return undefined;
  const updatedApartment = { ...apartment, status };
  localStorage.setItem(
    APARTMENTS_KEY,
    JSON.stringify(
      apartments.map((item) => (item.id === apartmentId ? updatedApartment : item)),
    ),
  );
  window.dispatchEvent(new Event(APARTMENTS_UPDATED_EVENT));
  return updatedApartment;
};

export const deleteApartmentAsAdmin = (apartmentId: number): boolean => {
  const apartments = readStoredApartments();
  if (!apartments.some((item) => item.id === apartmentId)) {
    if (!homes.some((item) => item.id === apartmentId)) return false;
    const value = localStorage.getItem(DELETED_APARTMENTS_KEY);
    const deleted = value ? (JSON.parse(value) as number[]) : [];
    localStorage.setItem(DELETED_APARTMENTS_KEY, JSON.stringify([...new Set([...deleted, apartmentId])]));
    window.dispatchEvent(new Event(APARTMENTS_UPDATED_EVENT));
    return true;
  }
  localStorage.setItem(
    APARTMENTS_KEY,
    JSON.stringify(apartments.filter((item) => item.id !== apartmentId)),
  );
  window.dispatchEvent(new Event(APARTMENTS_UPDATED_EVENT));
  return true;
};
