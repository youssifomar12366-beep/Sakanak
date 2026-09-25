import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import type { FormEvent } from "react";
import type { AllowedGender, Apartment } from "../types";
import { AMENITIES_LIST } from "../constants";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import { createApartment as saveApartment } from "../services/apartments/apartmentService";
import { ImageUploader } from "./AuthPages";
import "../styles/OwnerApartmentForm.css";

function OwnerApartmentForm({ broker = false }: { broker?: boolean }) {
  const { currentUser, language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [allowedGender, setAllowedGender] = useState<AllowedGender>("any");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ authMessage: t("authRequired") }}
      />
    );
  }
  if (currentUser.role !== "OWNER" && currentUser.role !== "BROKER") {
    return (
      <Navigate
        to={
          currentUser.role === "STUDENT"
            ? "/student/dashboard"
            : "/admin/dashboard"
        }
        replace
      />
    );
  }

  const toggleAmenity = (id: string) => {
    setAmenities((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (images.length === 0) {
      setError(
          t("addMainImage"),
      );
      return;
    }
    const form = new FormData(event.currentTarget);
    const property: Apartment = {
      id: Date.now(),
      status: "pending",
      buildingNumber: String(form.get("buildingNumber")),
      floorNumber: String(form.get("floorNumber")),
      city: String(form.get("city")),
      area: String(form.get("district")),
      district: String(form.get("district")),
      address: String(form.get("address")),
      fullLocation: `${String(form.get("city"))} ${String(form.get("district"))} ${String(form.get("address"))}`,
      images,
      price: Number(form.get("price")),
      rating: 0,
      image: images[0],
      beds: Number(form.get("beds")),
      rooms: Number(form.get("rooms")),
      amenities,
      allowedGender,
      publisherRole: broker ? "BROKER" : "OWNER",
      ownerId: currentUser.id,
      publisherName: currentUser.name,
      publisherPhone: currentUser.phone || "",
    };
    try {
      saveApartment(property);
      setSaved(true);
      setError("");
      event.currentTarget.reset();
    } catch (cause) {
      console.error("Apartment submission failed.", cause);
      setSaved(false);
      setError(
        t("apartmentSaveError"),
      );
    }
  };

  return (
    <main className="auth owner-form-page">
      <div>
        <small>{t("addNewApartment")}</small>
        <h1>
          {t("listApartment")}
        </h1>
        <p className="muted">
          {t("addDetails")}
        </p>
        <form onSubmit={submit}>
          <label className="form-field-label">
            {t("buildingNumber")}
            <input
              dir="auto"
              required
              name="buildingNumber"
              placeholder={t("buildingNumber")}
            />
          </label>
          <label className="form-field-label">
            {t("floorNumber")}
            <input
              dir="auto"
              required
              name="floorNumber"
              type="text"
              placeholder={t("floorNumber")}
            />
          </label>
          <label className="form-field-label">
            {t("city")}
            <input
              dir="auto"
              required
              name="city"
              placeholder={t("city")}
            />
          </label>
          <label className="form-field-label">
            {t("district")}
            <input
              dir="auto"
              required
              name="district"
              placeholder={t("district")}
            />
          </label>
          <label className="form-field-label">
            {t("address")}
            <input
              dir="auto"
              required
              name="address"
              placeholder={t("address")}
            />
          </label>
          <label className="form-field-label">
            {t("monthlyRent")}
            <input
              dir="auto"
              required
              name="price"
              type="number"
              min="0"
              placeholder={t("monthlyRent")}
            />
          </label>
          <div className="form-row">
            <label className="form-field-label">
              {t("availableBeds")}
              <input
                dir="auto"
                required
                name="beds"
                type="number"
                min="1"
                placeholder={t("availableBeds")}
              />
            </label>
            <label className="form-field-label">
              {t("rooms")}
              <input
                dir="auto"
                required
                name="rooms"
                type="number"
                min="1"
                placeholder={t("rooms")}
              />
            </label>
          </div>
         
          <label className="form-field-label">
            {t("residentGender")}
            <select
              name="allowedGender"
              value={allowedGender}
              onChange={(event) =>
                setAllowedGender(event.target.value as AllowedGender)
              }
            >
              <option value="females">
                {t("femalesOnly")}
              </option>
              <option value="males">
                {t("malesOnly")}
              </option>
              <option value="any">
                {t("anyBoth")}
              </option>
            </select>
          </label>
          

          <div className="checks">
            <b>{t("amenities")}</b>
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity.id} className="form-field-label">
                <input
                  dir="auto"
                  type="checkbox"
                  checked={amenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                />
                {t(amenity.translationKey)}
              </label>
            ))}
          </div>
          <ImageUploader
            images={images}
            onChange={(value) => {
              setImages(value);
              setError("");
            }}
            language={language}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="form-success" role="status">
              {t("apartmentSaved")}
            </p>
          )}
          <button className="btn wide" type="submit">
            {t("saveApartment")} {" "}
            <ArrowRight size={15} />
          </button>
        </form>
        <Link className="back" to="/owner/dashboard">
          {t("backDashboard")}
        </Link>
      </div>
    </main>
  );
}

export default OwnerApartmentForm;
