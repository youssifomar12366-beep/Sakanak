import { create } from "zustand";
import type { Language, RegistrationData, Store, User } from "../types";
import { authenticateUser, getCurrentUser, logoutUser, registerUser, saveCurrentUser } from "../services/authService";
import { addFavorite, getUserFavorites, removeFavorite } from "../services/favorites/favoriteService";

const AUTH_KEY = "nest.currentUser";
const USERS_KEY = "nest.mockUsers";
const LANGUAGE_KEY = "nest.language";
const TEMP_ADMIN_EMAIL = "youssifomar123666@gmail.com";
const temporaryAdmin: User = {
  id: "user-admin-youssif-test",
  name: "Youssif Admin",
  email: TEMP_ADMIN_EMAIL,
  password: "Youssif@1",
  role: "ADMIN",
};
const defaultUsers: User[] = [
  {
    id: "user-student-001",
    name: "Youssif Omar",
    email: "youssif@test.com",
    phone: "01000000000",
    password: "password",
    role: "STUDENT",
  },
  {
    id: "user-owner-001",
    name: "Ahmed Ali",
    email: "ahmed@test.com",
    phone: "01000000001",
    password: "password",
    role: "OWNER",
  },
  {
    id: "user-broker-001",
    name: "Omar Hassan",
    email: "omar@test.com",
    phone: "01000000002",
    password: "password",
    role: "BROKER",
  },
  {
    id: "user-admin-001",
    name: "Sakanak Admin",
    email: "admin@test.com",
    password: "password",
    role: "ADMIN",
  },
];
const savedUsers = (): User[] => {
  try {
    const value = localStorage.getItem(USERS_KEY);
    const users = value ? (JSON.parse(value) as User[]) : defaultUsers;
    const hasTemporaryAdmin = users.some(
      (user) => user.email.toLowerCase() === TEMP_ADMIN_EMAIL,
    );
    if (hasTemporaryAdmin) return users;
    const usersWithTemporaryAdmin = [...users, temporaryAdmin];
    localStorage.setItem(USERS_KEY, JSON.stringify(usersWithTemporaryAdmin));
    return usersWithTemporaryAdmin;
  } catch {
    const usersWithTemporaryAdmin = [...defaultUsers, temporaryAdmin];
    localStorage.setItem(USERS_KEY, JSON.stringify(usersWithTemporaryAdmin));
    return usersWithTemporaryAdmin;
  }
};
savedUsers();
const initialUser = getCurrentUser(AUTH_KEY);
const savedLanguage = (): Language => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
};

export const useStore = create<Store>((set) => ({
  dark: false,
  language: savedLanguage(),
  favorites: initialUser ? getUserFavorites(initialUser.id) : [],
  currentUser: initialUser,
  toggle: (id) =>
    set((s) => {
      if (!s.currentUser) return { favorites: s.favorites };
      const favorites = s.favorites.includes(id)
        ? removeFavorite(s.currentUser.id, id)
        : addFavorite(s.currentUser.id, id);
      return { favorites };
    }),
  theme: () => set((s) => ({ dark: !s.dark })),
  lang: () =>
    set((s) => {
      const language: Language = s.language === "en" ? "ar" : "en";
      localStorage.setItem(LANGUAGE_KEY, language);
      return { language };
    }),
  register: (data: RegistrationData) => {
    const user: User = registerUser(data);
    saveCurrentUser(user, AUTH_KEY);
    set({ currentUser: user, favorites: getUserFavorites(user.id) });
    return user;
  },
  login: (email, password) => {
    const user = authenticateUser(email, password);
    if (user) {
      saveCurrentUser(user, AUTH_KEY);
      set({ currentUser: user, favorites: getUserFavorites(user.id) });
    }
    return user;
  },
  logout: () => {
    logoutUser(AUTH_KEY);
    set({ currentUser: null, favorites: [] });
  },
}));
