import { Navigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import "../styles/AuthPages.css";

function Profile() {
  const { currentUser, language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ authMessage: t("authRequired") }}
      />
    );
  }
  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <main className="auth">
      <div>
        <small>{t("yourProfile")}</small>
        <h1>{currentUser.name}</h1>
        <div className="panel">
          <div className="current-user">
            <span className="avatar">{initials}</span>
            <span>
              <b>{currentUser.name}</b>
              <small>{currentUser.role === "OWNER" ? t("apartmentOwnerRole") : currentUser.role === "BROKER" ? t("broker") : currentUser.role === "ADMIN" ? t("admin") : t("student")}</small>
            </span>
          </div>
          <p>
            <strong>{t("fullName")}</strong>
            <br />
            {currentUser.name}
          </p>
          <p>
            <strong>{t("email")}</strong>
            <br />
            {currentUser.email}
          </p>
          <p>
            <strong>{t("phone")}</strong>
            <br />
            {currentUser.phone || t("notProvided")}
          </p>
          <p>
            <strong>{t("collegeOrWork")}</strong>
            <br />
            {currentUser.collegeOrWork || t("notProvided")}
          </p>
          <p>
            <strong>{t("resident")}</strong>
            <br />
            {currentUser.role}
          </p>
        </div>
      </div>
    </main>
  );
}

export default Profile;
