export type AuthCredentials = { email: string; password: string };
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: "STUDENT" | "OWNER" | "BROKER" | "ADMIN";
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
