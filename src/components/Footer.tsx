import { useLocation, useNavigate } from "react-router-dom";
import { handleSectionNavigation } from "../utils/navigation";
import { useStore } from "../store/useStore";
import { translate } from "../locales";
import SiteLogo from "./SiteLogo";
import "../styles/Footer.css";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useStore((state) => state.language);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  return (
    <footer>
      <div className="logo">
        <SiteLogo />
      </div>
      <p>{language === "ar" ? "سكن طلابي صُمم بعناية." : "Student housing, thoughtfully made."}</p>
      <button
        className="footer-how-link"
        onClick={() =>
          handleSectionNavigation(navigate, location.pathname, "how-it-works")
        }
      >
        {t("how")}
      </button>
      <button
        className="footer-how-link"
        onClick={() =>
          handleSectionNavigation(navigate, location.pathname, "for-owners")
        }
      >
        {t("owners")}
      </button>
      <small>
        © 2026 سكنك |{" "}
        <span className="developer-credit">
          تم تنفيذه بواسطة مهندس يوسف الريدي
          
        </span>
      </small>
    </footer>
  );
}

export default Footer;
