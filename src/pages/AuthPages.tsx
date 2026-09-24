import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import type { UserRole } from "../types";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import "../styles/AuthPages.css";

export function Auth({ register = false }: { register?: boolean }) {
  const go = useNavigate();
  const location = useLocation();
  const {
    language,
    register: saveRegistration,
    login,
    currentUser,
  } = useStore();
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState(
    (location.state as { authMessage?: string } | null)?.authMessage || "",
  );
  const isArabic = language === "ar";
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  if (currentUser) return <Navigate to="/" replace />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (register && !role) {
      setError(
        isArabic ? "يرجى اختيار نوع الحساب." : "Please select an account type.",
      );
      return;
    }
    if (!register) {
      const user = login(
        String(form.get("email") || ""),
        String(form.get("password") || ""),
      );
      if (!user) {
        setError(
          isArabic ? "بيانات الدخول غير صحيحة." : "Invalid email or password.",
        );
        return;
      }
      go(
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "BROKER"
            ? "/broker/dashboard"
            : "/",
      );
      return;
    }
    const collegeOrWork = String(form.get("collegeOrWork") || "").trim();
    if (!collegeOrWork) {
      setError(
        isArabic
          ? "يرجى إدخال الكلية أو جهة العمل."
          : "Please enter your college or workplace.",
      );
      return;
    }
    saveRegistration({
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      collegeOrWork,
      password: String(form.get("password") || ""),
      role: role || "STUDENT",
    });
    go(role === "BROKER" ? "/broker/dashboard" : "/");
  };

  return (
    <main className="auth">
      <div>
        <small>{t("welcomeToSakanak")}</small>
        <h1>{t("welcomeToSakanakTitle")}</h1>
        <p className="muted">
          {t("authDescription")}
        </p>
        <form onSubmit={submit}>
          {register && (
            <>
              <input
                dir="auto"
                required
                name="name"
                placeholder={isArabic ? "الاسم الكامل" : "Full name"}
              />
              <input
                dir="auto"
                required
                name="email"
                type="email"
                placeholder={isArabic ? "البريد الإلكتروني" : "Email address"}
              />
              <input
                dir="auto"
                required
                name="phone"
                type="tel"
                placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
              />
              <input
                dir="auto"
                required
                name="collegeOrWork"
                placeholder={isArabic ? "الكلية أو العمل" : "College or workplace"}
              />
              <input
                dir="auto"
                required
                name="password"
                type="password"
                placeholder={isArabic ? "كلمة المرور" : "Password"}
              />
              <section
                className="account-type"
                aria-labelledby="account-type-title"
              >
                <div className="account-type-heading">
                  <h2 id="account-type-title">{t("accountType")}</h2>
                  <span>{t("selectOption")}</span>
                </div>
                <div className="role-cards">
                  <button
                    type="button"
                    className={
                      role === "STUDENT" ? "role-card selected" : "role-card"
                    }
                    onClick={() => {
                      setRole("STUDENT");
                      setError("");
                    }}
                  >
                    <span className="role-icon">
                      <GraduationCap />
                    </span>
                    <strong>{t("studentTenant")}</strong>
                    <small>{t("studentRoleDescription")}</small>
                    <span className="role-indicator">
                      {role === "STUDENT" ? <Check size={14} /> : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      role === "OWNER" ? "role-card selected" : "role-card"
                    }
                    onClick={() => {
                      setRole("OWNER");
                      setError("");
                    }}
                  >
                    <span className="role-icon">
                      <Building2 />
                    </span>
                    <strong>{t("apartmentOwner")}</strong>
                    <small>{t("ownerRoleDescription")}</small>
                    <span className="role-indicator">
                      {role === "OWNER" ? <Check size={14} /> : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      role === "BROKER" ? "role-card selected" : "role-card"
                    }
                    onClick={() => {
                      setRole("BROKER");
                      setError("");
                    }}
                  >
                    <span className="role-icon">
                      <Building2 />
                    </span>
                    <strong>{t("brokerAgent")}</strong>
                    <small>{t("brokerRoleDescription")}</small>
                    <span className="role-indicator">
                      {role === "BROKER" ? <Check size={14} /> : null}
                    </span>
                  </button>
                </div>
                {error && (
                  <p className="role-error" role="alert">
                    {error}
                  </p>
                )}
              </section>
            </>
          )}
          {!register && (
            <>
              <input
                dir="auto"
                required
                name="email"
                type="email"
                placeholder={t("email")}
              />
              <input
                dir="auto"
                required
                name="password"
                type="password"
                placeholder={t("password")}
              />
              {error && (
                <p className="role-error" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
          <button className="btn wide">
            {register ? t("createAccount") : t("sign")} <ArrowRight size={15} />
          </button>
        </form>
        <p className="muted">
          {register ? t("alreadyHaveAccount") : t("newToSakanak")}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? t("sign") : t("createAccount")}
          </Link>
        </p>
      </div>
    </main>
  );
}

export function ImageUploader({
  images,
  onChange,
  language,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  language: "en" | "ar";
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024;
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [imageSizes, setImageSizes] = useState<number[]>(
    images.map((image) => {
      const base64 = image.split(",")[1] || "";
      return Math.floor((base64.length * 3) / 4);
    }),
  );

  const compressImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxDimension = 1280;
          const scale = Math.min(
            1,
            maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
          );
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        image.onerror = () => reject(new Error("Unable to read image."));
        image.src = String(reader.result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.find(
      (file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type),
    );
    if (invalidFile) {
      setError(
        language === "ar"
          ? "يسمح فقط بصور PNG وJPG وWEBP."
          : "Only PNG, JPG, and WEBP images are allowed.",
      );
      return;
    }
    const existingTotalBytes = imageSizes.reduce(
      (total, size) => total + size,
      0,
    );
    const selectedTotalBytes = selectedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );
    if (existingTotalBytes + selectedTotalBytes > MAX_TOTAL_IMAGE_BYTES) {
      const totalMegabytes = (
        (existingTotalBytes + selectedTotalBytes) /
        (1024 * 1024)
      ).toFixed(2);
      const message =
        language === "ar"
          ? `إجمالي حجم الصور ${totalMegabytes}MB، والحد الأقصى هو 10MB.`
          : `The total image size is ${totalMegabytes}MB. The maximum is 10MB.`;
      setError(message);
      console.error(message);
      return;
    }
    const valid: string[] = [];
    const validSizes: number[] = [];
    let nextError = "";
    for (const file of selectedFiles) {
      try {
        const dataUrl = await compressImage(file);
        valid.push(dataUrl);
        validSizes.push(file.size);
      } catch (cause) {
        console.error("Failed to process apartment image.", cause);
        nextError =
          language === "ar"
            ? t("imageProcessingError")
            : t("imageProcessingError");
      }
    }
    setError(nextError);
    if (valid.length) {
      onChange([...images, ...valid]);
      setImageSizes([...imageSizes, ...validSizes]);
    }
  };

  return (
    <section className="image-uploader">
      <div className="image-uploader-title">
        <h2>
          {t("uploadApartmentImages")}
        </h2>
        <span>
          {t("imageFormats")}
        </span>
      </div>
      <label
        className={dragging ? "upload-dropzone dragging" : "upload-dropzone"}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud size={25} />
        <strong>
          {t("dragPhotos")}
        </strong>
        <small>
          {t("chooseMultipleImages")}
        </small>
        <input
          dir="auto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image, index) => (
            <div className="image-preview" key={image}>
              <img
                src={image}
                alt={`${t("imageAlt")} ${index + 1}`}
              />
              {index === 0 && (
                <span className="main-image-badge">
                  {t("mainImage")}
                </span>
              )}
              <button
                type="button"
                aria-label={t("removeImage")}
                onClick={() => {
                  onChange(
                    images.filter((_, imageIndex) => imageIndex !== index),
                  );
                  setImageSizes(
                    imageSizes.filter((_, imageIndex) => imageIndex !== index),
                  );
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
