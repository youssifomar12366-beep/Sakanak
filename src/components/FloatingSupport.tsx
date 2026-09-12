import "../styles/FloatingSupport.css";
import { Mail, MessageCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { translate } from "../locales";

function FloatingSupport() {
  const language = useStore((state) => state.language);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  return (
    <div className="floating-support" aria-label={t("supportContacts")}>
      <a
        className="support-button whatsapp-support"
        href="https://wa.me/201050633268"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsappSupport")}
      >
        <MessageCircle size={21} />
        <span className="support-tooltip">{t("whatsappSupport")}</span>
      </a>
      <a
        className="support-button email-support"
        href="mailto:youssifomar123666@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("emailSupport")}
      >
        <Mail size={21} />
        <span className="support-tooltip">{t("emailSupport")}</span>
      </a>
    </div>
  );
}

export default FloatingSupport;
