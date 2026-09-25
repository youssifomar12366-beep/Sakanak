import type { User } from "../../types";

const USERS_KEY = "nest.mockUsers";

export const getUsers = (): User[] => {
  try {
    const value = localStorage.getItem(USERS_KEY);
    const users = value ? (JSON.parse(value) as User[]) : [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

export const getUserById = (userId: string) =>
  getUsers().find((user) => user.id === userId);

export const createUser = (user: User): User => {
  const users = getUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify([
    ...users.filter((item) => item.email.toLowerCase() !== user.email.toLowerCase()),
    user,
  ]));
  return user;
};

export const updateUser = (userId: string, changes: Partial<User>) => {
  const users = getUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) return undefined;
  const updatedUser = { ...user, ...changes };
  localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === userId ? updatedUser : item)));
  return updatedUser;
};

export const deleteUser = (userId: string): boolean => {
  const users = getUsers();
  if (!users.some((user) => user.id === userId)) return false;
  localStorage.setItem(USERS_KEY, JSON.stringify(users.filter((user) => user.id !== userId)));
  return true;
};
