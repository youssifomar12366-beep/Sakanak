import "../styles/NotFound.css";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { translate } from "../locales";

function NotFound() {
  const language = useStore((state) => state.language);
  return (
    <main className="not-found">
      <small>404</small>
      <h1>{translate(language, "notFound")}</h1>
      <Link className="btn" to="/">
        {translate(language, "backHome")}
      </Link>
    </main>
  );
}

export default NotFound;
