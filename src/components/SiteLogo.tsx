import logo1Url from "../logo/logo1.svg";
import logo2Url from "../logo/logo2.svg";
import { useStore } from "../store/useStore";
import { translate } from "../locales";

export default function SiteLogo() {
  const language = useStore((state) => state.language);
  const dark = useStore((state) => state.dark);

  return (
    <div className="site-logo">
      <img src={dark ? logo2Url : logo1Url} alt={translate(language, "logoAlt")} />
    </div>
  );
}