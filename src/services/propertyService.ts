export type PropertyRecord = {
  id: number;
  buildingNumber: string;
  floorNumber: string | number;
  city: string;
  area: string;
  district: string;
  address: string;
  fullLocation?: string;
  images: string[];
  price: number;
  rating: number;
  image: string;
  beds: number;
  rooms: number;
  amenities: string[];
  allowedGender: "females" | "males" | "any";
  publisherRole: "OWNER" | "BROKER";
  publisherName: string;
  publisherPhone: string;
};

const PROPERTIES_KEY = "sakanak.properties";
const wait = (milliseconds = 300) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const readStoredProperties = (): PropertyRecord[] => {
  try {
    const stored = localStorage.getItem(PROPERTIES_KEY);
    return stored ? (JSON.parse(stored) as PropertyRecord[]) : [];
  } catch {
    return [];
  }
};

export async function getProperties(
  fallback: PropertyRecord[] = [],
): Promise<PropertyRecord[]> {
  await wait();
  const stored = readStoredProperties();
  return stored.length ? stored : fallback;
}

export async function getPropertyById(
  id: number,
  fallback: PropertyRecord[] = [],
): Promise<PropertyRecord | undefined> {
  const properties = await getProperties(fallback);
  return properties.find((property) => property.id === id);
}

export async function createProperty(
  data: PropertyRecord,
): Promise<PropertyRecord> {
  await wait();
  const properties = readStoredProperties();
  const nextProperties = [...properties, data];
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(nextProperties));
  return data;
}
