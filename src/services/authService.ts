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
const PASSWORD_RESET_FLOW_KEY = "nest.password-reset-flow";

type LocalPasswordResetFlow = {
  email: string;
  verified: boolean;
};

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

export const requestPasswordReset = (email: string): boolean => {
  const normalizedEmail = email.trim().toLowerCase();
  const exists = getUsers().some((user) => user.email.toLowerCase() === normalizedEmail);
  if (!exists) return false;
  localStorage.setItem(
    PASSWORD_RESET_FLOW_KEY,
    JSON.stringify({ email: normalizedEmail, verified: false } satisfies LocalPasswordResetFlow),
  );
  return true;
};

export const verifyPasswordResetCode = (email: string, verificationCode: string): boolean => {
  if (verificationCode !== LOCAL_PASSWORD_RESET_CODE) return false;
  try {
    const stored = localStorage.getItem(PASSWORD_RESET_FLOW_KEY);
    const flow = stored ? (JSON.parse(stored) as LocalPasswordResetFlow) : null;
    if (!flow || flow.email !== email.trim().toLowerCase()) return false;
    localStorage.setItem(PASSWORD_RESET_FLOW_KEY, JSON.stringify({ ...flow, verified: true }));
    return true;
  } catch {
    return false;
  }
};

export function resetPassword(email: string, newPassword: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const stored = localStorage.getItem(PASSWORD_RESET_FLOW_KEY);
    const flow = stored ? (JSON.parse(stored) as LocalPasswordResetFlow) : null;
    if (!flow || !flow.verified || flow.email !== normalizedEmail) return false;
  } catch {
    return false;
  }
  const user = getUsers().find(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );
  const updated = Boolean(user && updateUser(user.id, { password: newPassword }));
  if (updated) localStorage.removeItem(PASSWORD_RESET_FLOW_KEY);
  return updated;
}
