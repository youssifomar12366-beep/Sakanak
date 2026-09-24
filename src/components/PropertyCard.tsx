import {
  ArrowRight,
  BedDouble,
  Heart,
  Home as HomeIcon,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Apartment } from "../types";
import { useStore } from "../store/useStore";
import { apartmentTitle } from "../utils/apartment";
import { translate } from "../locales";
import "../styles/PropertyCard.css";

function PropertyCard({ home }: { home: Apartment }) {
  const { favorites, toggle, language, currentUser } = useStore();
  const navigate = useNavigate();
  const liked = favorites.includes(home.id);
  const title = apartmentTitle(home, language);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const broker = home.publisherRole === "BROKER";
  const openDetails = () => navigate(`/apartments/${home.id}`);
  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) {
      return;
    }
    openDetails();
  };
  return (
    <article
      className="card"
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
          openDetails();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={title}
    >
      <div className="card-img">
        <img src={home.image} alt={title} />
        <button
          className={liked ? "heart liked" : "heart"}
          aria-label={liked ? t("removeFavorite") : t("addFavorite")}
          onClick={() => {
            if (!currentUser) {
              navigate("/login", {
                state: {
                  authMessage: t("loginFavorite"),
                },
              });
              return;
            }
            toggle(home.id);
          }}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <em>
          <ShieldCheck size={12} /> {t("verified")}
        </em>
        <span
          className={
            broker
              ? "publisher-badge broker-badge"
              : "publisher-badge owner-badge"
          }
        >
          {broker ? t("listedBroker") : t("directOwner")}
        </span>
      </div>
      <div className="card-body">
        <div className="row">
          <h3>{title}</h3>
        </div>
        <p className="muted">{home.area}, {home.city}</p>
        <div className="meta">
          <span>
            <BedDouble size={14} />
            {home.beds} {t("beds")}
          </span>
          <span>
            <HomeIcon size={14} />
            {home.rooms} {t("roomsCount")}
          </span>
        </div>
        <div className="row">
          <strong>
            {home.price.toLocaleString()} <small>{t("perMonth")}</small>
          </strong>
          <Link className="round" to={`/apartments/${home.id}`}>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
