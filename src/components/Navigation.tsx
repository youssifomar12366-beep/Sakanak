import { useState } from "react";
import {
  ChevronDown,
  Languages,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  UserCircle,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { handleSectionNavigation } from "../utils/navigation";
import { translate } from "../locales";
import SiteLogo from "./SiteLogo";
import "../styles/Navigation.css";

export default function Navigation() {
  const { dark, theme, currentUser, logout, language, lang } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const initials =
    currentUser?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="nav">
      <Link to="/" className="logo">
        <SiteLogo />
      </Link>
      <nav className={open ? "open" : ""}>
        <Link to="/">{t("home")}</Link>
        <Link className="explore-link" to="/apartments">{t("navExplore")}</Link>
        <a
          href="#how-it-works"
          onClick={(event) => {
            event.preventDefault();
            handleSectionNavigation(
              navigate,
              location.pathname,
              "how-it-works",
            );
          }}
        >
          {t("how")}
        </a>
        <a
          href="#for-owners"
          onClick={(event) => {
            event.preventDefault();
            handleSectionNavigation(navigate, location.pathname, "for-owners");
          }}
        >
          {t("owners")}
        </a>
        <button
          onClick={lang}
          className="mobile-nav-link icon mobile-language"
          aria-label={t("language")}
          title={t("language")}
        >
          {language === "ar" ? t("languageEnglish") : t("languageArabic")}
        </button>
        {!currentUser && (
          <>
            <Link className="mobile-nav-link" to="/login">
              {t("sign")}
            </Link>
            <Link className="mobile-nav-link" to="/register">
              {t("join")}
            </Link>
          </>
        )}
      </nav>
      <div className="nav-buttons">
        <button
          onClick={lang}
          className="icon language-toggle"
          aria-label={t("language")}
          title={t("language")}
        >
          <Languages size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={theme}
          className={`theme-toggle${dark ? " is-dark" : ""}`}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={dark}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb">
              <Sun className="theme-toggle-sun" size={14} />
              <Moon className="theme-toggle-moon" size={14} />
            </span>
          </span>
        </button>
        {currentUser && (
          <button
            className="dashboard-action"
            aria-label={t("dashboard")}
            title={t("dashboard")}
            onClick={() =>
              navigate(
                currentUser.role === "OWNER"
                  ? "/owner/dashboard"
                  : currentUser.role === "BROKER"
                    ? "/broker/dashboard"
                    : currentUser.role === "ADMIN"
                      ? "/admin/dashboard"
                      : "/student/dashboard",
              )
            }
          >
            <LayoutDashboard size={18} />
            <span className="dashboard-tooltip">{t("dashboard")}</span>
          </button>
        )}
        {currentUser ? (
          <div className="account-menu">
            <button
              className="account-trigger"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen}
            >
              <span className="nav-avatar">{initials}</span>
              <span className="account-name">{currentUser.name || "User"}</span>
              <ChevronDown size={14} />
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                <strong>{currentUser.name || "User"}</strong>
                <small>{currentUser.email}</small>
                <small>{currentUser.role}</small>
                <Link
                  to={
                    currentUser.role === "OWNER" ? "/owner/profile" : "/profile"
                  }
                  onClick={() => setAccountOpen(false)}
                >
                  <UserCircle size={14} /> {t("profile")}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setAccountOpen(false);
                    window.location.assign("/");
                  }}
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="sign desktop" to="/login">
              {t("sign")}
            </Link>
            <Link className="btn desktop" to="/register">
              {t("join")}
            </Link>
          </>
        )}
        <button className="menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
