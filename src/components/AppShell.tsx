import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import FloatingSupport from "./FloatingSupport";
import { useStore } from "../store/useStore";
import Profile from "../pages/Profile";
import Footer from "./Footer";
import NotFound from "./NotFound";
import { Home } from "../pages/HomePage";
import ApartmentDetails from "../pages/ApartmentDetails";
import { Auth } from "../pages/AuthPages";
import Dashboard from "../pages/DashboardPage";
import OwnerWorkspace from "../pages/OwnerWorkspace";
import Apartments from "../pages/Apartments";
import OwnerApartmentForm from "../pages/OwnerApartmentForm";
import AdminDashboard from "../pages/AdminDashboard";
import Navigation from "./Navigation";
import "../styles/Responsive.css";

export function AppShell() {
  const { dark, language } = useStore();
  const { pathname } = useLocation();
  const authScreen = pathname === "/register" || pathname === "/login";
  const showApplicationChrome = !authScreen;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <div
      className={dark ? "app dark" : "app"}
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {showApplicationChrome && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Auth register />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/apartments" element={<Apartments />} />
        <Route path="/apartments/:id" element={<ApartmentDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route
          path="/student/favorites"
          element={<Dashboard favoritesView />}
        />
        <Route
          path="/owner/favorites"
          element={<Dashboard owner favoritesView />}
        />
        <Route
          path="/broker/favorites"
          element={<Dashboard broker favoritesView />}
        />
        <Route
          path="/admin/favorites"
          element={<Dashboard admin favoritesView />}
        />
        <Route
          path="/student/bookings"
          element={<Dashboard bookingsView />}
        />
        <Route path="/owner/dashboard" element={<Dashboard owner />} />
        <Route
          path="/owner/properties"
          element={<OwnerWorkspace title="My Properties" />}
        />
        <Route path="/owner/properties/new" element={<OwnerApartmentForm />} />
        <Route
          path="/owner/requests"
          element={<OwnerWorkspace title="Booking Requests" />}
        />
        <Route
          path="/owner/notifications"
          element={<OwnerWorkspace title="Notifications" />}
        />
        <Route path="/owner/profile" element={<Profile />} />
        <Route path="/broker/dashboard" element={<Dashboard broker />} />
        <Route
          path="/broker/properties"
          element={<OwnerApartmentForm broker />}
        />
        <Route
          path="/broker/requests"
          element={<OwnerWorkspace title="Client Inquiries" broker />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showApplicationChrome && (
        <>
          <Footer />
          <FloatingSupport />
        </>
      )}
    </div>
  );
}
