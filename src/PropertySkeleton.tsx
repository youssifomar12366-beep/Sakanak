import { useStore } from "./store/useStore";
import { translate } from "./locales";

function PropertySkeleton() {
  const language = useStore((state) => state.language);
  return (
    <article className="card property-skeleton" aria-label={translate(language, "loadingApartment")}>
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <span />
        <span />
        <span className="short" />
      </div>
    </article>
  );
}

export default PropertySkeleton;
