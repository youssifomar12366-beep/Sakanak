import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../store/useStore";
import type { AllowedGender } from "../types";
import { AMENITIES_LIST } from "../constants";
import {
  APARTMENTS_UPDATED_EVENT,
  getPublicApartments,
} from "../utils/apartments";
import { locationMatches } from "../utils/location";
import PropertyCard from "../components/PropertyCard";
import LocationInput from "../components/LocationInput";
import { translate } from "../locales";
import "../styles/Apartments.css";

function Apartments() {
  const [params, setParams] = useSearchParams();
  const initialMin = Math.max(1000, Number(params.get("minPrice") || 1000));
  const initialMax = Math.min(
    40000,
    Math.max(1000, Number(params.get("maxPrice") || 40000)),
  );
  const initialBeds = Number(params.get("beds") || 0);
  const initialRooms = Number(params.get("rooms") || 0);
  const [q, setQ] = useState(params.get("q") || "");
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [beds, setBeds] = useState(initialBeds);
  const [rooms, setRooms] = useState(initialRooms);
  const [sort, setSort] = useState("recommended");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<AllowedGender>("any");
  const [apartments, setApartments] = useState(getPublicApartments);
  const { language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    const refreshApartments = () => setApartments(getPublicApartments());

    window.addEventListener(APARTMENTS_UPDATED_EVENT, refreshApartments);
    window.addEventListener("storage", refreshApartments);

    return () => {
      window.removeEventListener(APARTMENTS_UPDATED_EVENT, refreshApartments);
      window.removeEventListener("storage", refreshApartments);
    };
  }, []);

  const applyFilters = (next: {
    q?: string;
    min?: number;
    max?: number;
    beds?: number;
    rooms?: number;
  }) => {
    const nextParams = new URLSearchParams(params);
    const nextQ = next.q ?? q;
    const nextMin = next.min ?? minPrice;
    const nextMax = next.max ?? maxPrice;
    const nextBeds = next.beds ?? beds;
    const nextRooms = next.rooms ?? rooms;
    if (nextQ) nextParams.set("q", nextQ);
    else nextParams.delete("q");
    nextParams.set("minPrice", String(nextMin));
    nextParams.set("maxPrice", String(nextMax));
    if (nextBeds) nextParams.set("beds", String(nextBeds));
    else nextParams.delete("beds");
    if (nextRooms) nextParams.set("rooms", String(nextRooms));
    else nextParams.delete("rooms");
    setParams(nextParams);
  };

  const result = useMemo(
    () =>
      apartments
        .filter(
          (home) =>
            locationMatches(home, q) &&
            home.price >= minPrice &&
            home.price <= maxPrice &&
            home.beds >= beds &&
            (rooms === 0 ||
              (rooms >= 5 ? home.rooms >= 5 : home.rooms === rooms)) &&
            selectedAmenities.every((amenity) =>
              home.amenities.includes(amenity),
            ) &&
            (selectedGender === "any" ||
              home.allowedGender === "any" ||
              home.allowedGender === selectedGender),
        )
        .sort((a, b) =>
          sort === "price"
            ? a.price - b.price
            : sort === "rating"
              ? b.rating - a.rating
              : 0,
        ),
    [
      apartments,
      q,
      minPrice,
      maxPrice,
      beds,
      rooms,
      selectedAmenities,
      selectedGender,
      sort,
    ],
  );
  const toggleAmenity = (id: string) =>
    setSelectedAmenities((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  return (
    <main className="listing">
      <div className="listing-head">
        <div>
          <small>{t("explore")}</small>
          <h1>{t("discoverNextSpace")}</h1>
          <p className="muted">{result.length} {t("showingHomes")}</p>
        </div>
      </div>
      <div className="listing-layout">
        <aside>
          <h3>{t("filterHomes")}</h3>
          <label>
            {t("searchLocation")}
            <LocationInput
              value={q}
              onChange={(value) => {
                setQ(value);
                applyFilters({ q: value });
              }}
              placeholder={t("cityOrArea")}
            />
          </label>
          <label>
            {t("priceRange")}
            <div className="price-inputs sidebar-price">
              <input
                dir="auto"
                aria-label={t("minPrice")}
                type="number"
                min="1000"
                max={maxPrice}
                value={minPrice}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), maxPrice);
                  setMinPrice(value);
                  applyFilters({ min: value });
                }}
              />
              <input
                dir="auto"
                aria-label={t("maxPrice")}
                type="number"
                min={minPrice}
                max="40000"
                value={maxPrice}
                onChange={(e) => {
                  const value = Math.min(
                    40000,
                    Math.max(Number(e.target.value), minPrice),
                  );
                  setMaxPrice(value);
                  applyFilters({ max: value });
                }}
              />
            </div>
            <input
              dir="auto"
              type="range"
              min="1000"
              max="40000"
              step="100"
              value={minPrice}
              onChange={(e) => {
                const value = Math.min(+e.target.value, maxPrice);
                setMinPrice(value);
                applyFilters({ min: value });
              }}
            />
            <input
              dir="auto"
              type="range"
              min="1000"
              max="40000"
              step="100"
              value={maxPrice}
              onChange={(e) => {
                const value = Math.max(+e.target.value, minPrice);
                setMaxPrice(value);
                applyFilters({ max: value });
              }}
            />
            <small>
              {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} جنيه مصري
            </small>
          </label>
          <label>
            {t("availableBeds")}
            <select
              value={beds}
              onChange={(e) => {
                const value = Number(e.target.value);
                setBeds(value);
                applyFilters({ beds: value });
              }}
            >
              <option value="0">{t("allHomes")}</option>
              <option value="1">1+ {t("beds")}</option>
              <option value="2">2+ {t("beds")}</option>
              <option value="3">3+ {t("beds")}</option>
              <option value="4">4+ {t("beds")}</option>
              <option value="5">5+ {t("beds")}</option>
              <option value="6">6+ {t("beds")}</option>
            </select>
          </label>
          <label>
            {t("rooms")}
            <select
              value={rooms}
              onChange={(e) => {
                const value = Number(e.target.value);
                setRooms(value);
                applyFilters({ rooms: value });
              }}
            >
              <option value="0">{t("allHomes")}</option>
              <option value="1">1 {t("roomsCount")}</option>
              <option value="2">2 {t("roomsCount")}</option>
              <option value="3">3 {t("roomsCount")}</option>
              <option value="4">4 {t("roomsCount")}</option>
              <option value="5">5 {t("roomsCount")}</option>
              <option value="6">6 {t("roomsCount")}</option>
            </select>
          </label>
          <label>
            {t("residentGender")}
            <select
              value={selectedGender}
              onChange={(e) =>
                setSelectedGender(e.target.value as AllowedGender)
              }
            >
              <option value="any">{t("anyBoth")}</option>
              <option value="females">{t("femalesOnly")}</option>
              <option value="males">{t("malesOnly")}</option>
            </select>
          </label>
          <div className="checks">
            <b>{t("amenities")}</b>
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity.id}>
                <input
                  dir="auto"
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                />
                {t(amenity.translationKey)}
              </label>
            ))}
          </div>
        </aside>
        <div className="results">
          <div className="toolbar">
            {t("showingHomes")} <b>{result.length}</b>{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">{t("recommended")}</option>
              <option value="price">{t("lowestPrice")}</option>
              <option value="rating">{t("highestRated")}</option>
            </select>
          </div>
          <div className="grid">
            {result.map((home) => (
              <PropertyCard key={home.id} home={home} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Apartments;
