import type { User } from "../types";
import { translate } from "../locales";

function WelcomeHeader({
  user,
  language,
}: {
  user: User;
  language: "en" | "ar";
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const isOwner = user.role === "OWNER";
  const greeting = t("welcomeBack");
  const subtitle = isOwner ? t("ownerWelcomeSubtitle") : t("studentWelcomeSubtitle");
  return (
    <div className="welcome-header">
      <h1>
         {user.name} ,{greeting}👋
      </h1>
      <p className="muted">{subtitle}</p>
    </div>
  );
}

export default WelcomeHeader;
