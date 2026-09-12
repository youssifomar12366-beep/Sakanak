import type { Apartment } from "../types";
import { homes } from "../constants/properties";

export const normalizeLocation = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
export const apartmentLocation = (home: Apartment) =>
  [home.city, home.area, home.district, home.address, home.fullLocation]
    .filter(Boolean)
    .join(" ");
export const locationMatches = (home: Apartment, query: string) =>
  normalizeLocation(apartmentLocation(home)).includes(normalizeLocation(query));
export const locationSuggestions = Array.from(
  new Set(
    homes.flatMap((home) =>
      [
        home.city,
        home.area,
        home.district,
        home.address,
        home.fullLocation,
      ].filter((value): value is string => Boolean(value)),
    ),
  ),
);
