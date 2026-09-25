export type AuthCredentials = { email: string; password: string };
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  collegeOrWork?: string;
  password?: string;
  role: "STUDENT" | "OWNER" | "BROKER" | "ADMIN";
};
import type { RegistrationData, User } from "../types";
import { createUser, getUsers, updateUser } from "./users/userService";

// Development/Test Verification Code. Replace this local adapter with real email/SMS verification from the Backend.
export const LOCAL_PASSWORD_RESET_CODE = "000000";

const wait = (milliseconds = 300) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

export async function loginUser(
  credentials: AuthCredentials,
  users: AuthUser[],
): Promise<AuthUser | null> {
  await wait();
  return (
    users.find(
      (user) =>
        user.email.toLowerCase() === credentials.email.toLowerCase() &&
        user.password === credentials.password,
    ) || null
  );
}

export const validatePassword = (password: string): boolean => password.trim().length > 0;

export const authenticateUser = (email: string, password: string): User | null =>
  getUsers().find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  ) || null;

export const registerUser = (data: RegistrationData): User => {
  const user: User = { ...data, id: `user-${Date.now()}` };
  return createUser(user);
};

export const getCurrentUser = (authKey = "nest.currentUser"): User | null => {
  try {
    const value = localStorage.getItem(authKey);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
};

export const saveCurrentUser = (user: User, authKey = "nest.currentUser") => {
  localStorage.setItem(authKey, JSON.stringify(user));
};

export const logoutUser = (authKey = "nest.currentUser") => {
  localStorage.removeItem(authKey);
};

export const requestPasswordReset = (identifier: string) =>
  getUsers().some((user) => user.email.toLowerCase() === identifier.toLowerCase() || user.phone === identifier);

export const verifyPasswordResetCode = (_identifier: string, verificationCode: string) =>
  verificationCode === LOCAL_PASSWORD_RESET_CODE;

export function resetPassword(
  identifier: string,
  verificationCode: string,
  newPassword: string,
): boolean {
  if (verificationCode !== LOCAL_PASSWORD_RESET_CODE) return false;
  const user = getUsers().find(
    (item) => item.email.toLowerCase() === identifier.toLowerCase() || item.phone === identifier,
  );
  return Boolean(user && updateUser(user.id, { password: newPassword }));
}
