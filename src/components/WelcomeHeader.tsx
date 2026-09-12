import type { User } from "../types";

function WelcomeHeader({
  user,
  language,
}: {
  user: User;
  language: "en" | "ar";
}) {
  const isOwner = user.role === "OWNER";
  const greeting = language === "ar" ? "مرحبًا بعودتك" : "Welcome back";
  const subtitle =
    language === "ar"
      ? isOwner
        ? "جاهز تدير شققك وطلبات الحجز؟"
        : "جاهز تلاقي سكنك الجديد؟"
      : isOwner
        ? "Ready to manage your properties?"
        : "Ready to find your next home?";
  return (
    <div className="welcome-header">
      <h1>
        {greeting}, {user.name} 👋
      </h1>
      <p className="muted">{subtitle}</p>
    </div>
  );
}

export default WelcomeHeader;
