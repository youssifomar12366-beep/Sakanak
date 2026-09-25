export const API_BASE_URL = "";

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("nest.authToken");
  } catch {
    return null;
  }
};
