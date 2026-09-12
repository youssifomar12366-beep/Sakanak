import {
  ArrowRight,
  BedDouble,
  Heart,
  Home as HomeIcon,
  ShieldCheck,
  Star,
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
  return (
    <article className="card">
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
          <span className="rating">
            <Star size={13} fill="currentColor" />
            {home.rating}
          </span>
        </div>
        <p className="muted">
          {home.area}, {home.city} · {t("walkFromUniversity")}
        </p>
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
