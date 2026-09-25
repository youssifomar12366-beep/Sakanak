import { useEffect } from "react";
import {
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { homes } from "../constants/properties";
import { translate } from "../locales";
import PropertyCard from "../components/PropertyCard";
import "../styles/HomePage.css";

export function Home() {
  const { language } = useStore();
  const location = useLocation();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <main>
      <section className="hero">
        <div>
          <small>✦ {t("betterPlace")}</small>
          <h1>{t("title")}</h1>
          <p>{t("desc")}</p>
          <SearchBox />
        </div>
        <div className="hero-image">
          <img src={homes[0].image} alt={t("studentHome")} />
          <div className="float-card">
            <Star fill="currentColor" size={15} /> <b>4.9</b> {t("topRatedHome")}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <small>{t("curatedForYou")}</small>
            <h2>{t("featured")}</h2>
            <p>{t("selectedSpaces")}</p>
          </div>
          <Link className="outline" to="/apartments">
            {t("viewAllHomes")} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid">
          {homes.slice(0, 3).map((home) => (
            <PropertyCard key={home.id} home={home} />
          ))}
        </div>
      </section>
      <section id="how-it-works" className="how">
        <small>{t("noStressSakanak")}</small>
        <h2>{t("simpleStudentLiving")}</h2>
        <div className="steps">
          <div>
            <b>01</b>
            <h3>{t("searchStep")}</h3>
            <p>{t("searchStepText")}</p>
          </div>
          <div>
            <b>02</b>
            <h3>{t("chooseStep")}</h3>
            <p>{t("chooseStepText")}</p>
          </div>
          <div>
            <b>03</b>
            <h3>{t("moveInStep")}</h3>
            <p>{t("moveInStepText")}</p>
          </div>
        </div>
      </section>
      <section id="for-owners" className="owner">
        <small>{t("propertyOwners")}</small>
        <h2>{t("ownerCtaTitle")}</h2>
        <p>{t("ownerCtaText")}</p>
        <Link className="light" to="/register">
          {t("listApartmentCta")} <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}

export function SearchBox() {
  const { language } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const go = useNavigate();

  const submit = () => {
    const params = new URLSearchParams();
    params.set("minPrice", "1000");
    params.set("maxPrice", "40000");
    go(`/apartments?${params.toString()}`);
  };

  return (
    <div className="search-box">
      <button className="btn" onClick={submit}>
        <Search size={16} />
        {t("search")}
      </button>
    </div>
  );
}
