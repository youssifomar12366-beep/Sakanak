import logo1Url from "../logo/logo1.svg";
import logo2Url from "../logo/logo2.svg";
import { useStore } from "../store/useStore";

export default function SiteLogo() {
  const dark = useStore((state) => state.dark);

  return (
    <div className="site-logo">
      <img src={dark ? logo2Url : logo1Url} alt="سكنك" />
    </div>
  );
}