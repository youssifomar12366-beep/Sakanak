import type { Apartment } from "../types";

export const apartmentTitle = (home: Apartment, language: "en" | "ar") =>
  language === "ar"
    ? `عمارة ${home.buildingNumber} - الدور ${home.floorNumber}`
    : `Building ${home.buildingNumber} - Floor ${home.floorNumber}`;
