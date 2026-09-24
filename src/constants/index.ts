
import type { TranslationKey } from "../locales/en";

export const AMENITIES_LIST = [
  { id: "wifi", translationKey: "amenityWifi" },
  { id: "air-conditioning", translationKey: "amenityAirConditioning" },
  { id: "private-bathroom", translationKey: "amenityPrivateBathroom" },
  { id: "security", translationKey: "amenitySecurity" },
  { id: "natural-gas", translationKey: "amenityNaturalGas" },
  { id: "elevator", translationKey: "amenityElevator" },
] as const satisfies ReadonlyArray<{ id: string; translationKey: TranslationKey }>;
