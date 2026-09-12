export function handleSectionNavigation(
  navigate: (path: string, options?: { state?: { scrollTo: string } }) => void,
  pathname: string,
  targetId: string,
) {
  if (pathname === "/") {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  } else {
    navigate("/", { state: { scrollTo: targetId } });
  }
}
