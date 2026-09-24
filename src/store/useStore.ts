import { create } from "zustand";
import type { Language, RegistrationData, Store, User } from "../types";

const AUTH_KEY = "nest.currentUser";
const USERS_KEY = "nest.mockUsers";
const FAVORITES_KEY = "nest.favorites";
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
let mockUsers: User[] = savedUsers();
const savedUser = (): User | null => {
  try {
    const value = localStorage.getItem(AUTH_KEY);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
};
const savedFavorites = (userId: string | undefined): number[] => {
  if (!userId) return [];
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    const favorites = value ? (JSON.parse(value) as Record<string, number[]>) : {};
    return Array.isArray(favorites[userId]) ? favorites[userId] : [];
  } catch {
    return [];
  }
};
const saveFavorites = (userId: string, favorites: number[]) => {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    const allFavorites = value
      ? (JSON.parse(value) as Record<string, number[]>)
      : {};
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify({ ...allFavorites, [userId]: favorites }),
    );
  } catch {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify({ [userId]: favorites }));
  }
};

const initialUser = savedUser();
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
  favorites: savedFavorites(initialUser?.id),
  currentUser: initialUser,
  toggle: (id) =>
    set((s) => {
      if (!s.currentUser) return { favorites: s.favorites };
      const favorites = s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [...s.favorites, id];
      saveFavorites(s.currentUser.id, favorites);
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
    const user: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      collegeOrWork: data.collegeOrWork,
      password: data.password,
      role: data.role,
    };
    mockUsers = [
      ...mockUsers.filter(
        (item) => item.email.toLowerCase() !== user.email.toLowerCase(),
      ),
      user,
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ currentUser: user, favorites: savedFavorites(user.id) });
    return user;
  },
  login: (email, password) => {
    const user =
      mockUsers.find(
        (item) =>
          item.email.toLowerCase() === email.toLowerCase() &&
          item.password === password,
      ) || null;
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ currentUser: user, favorites: savedFavorites(user.id) });
    }
    return user;
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ currentUser: null, favorites: [] });
  },
}));
