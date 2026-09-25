const FAVORITES_KEY = "nest.favorites";

const readFavorites = (): Record<string, number[]> => {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeFavorites = (favorites: Record<string, number[]>) =>
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

export const getUserFavorites = (userId: string): number[] => readFavorites()[userId] || [];
export const isFavorite = (userId: string, apartmentId: number) => getUserFavorites(userId).includes(apartmentId);
export const addFavorite = (userId: string, apartmentId: number) => {
  const favorites = readFavorites();
  const current = favorites[userId] || [];
  if (!current.includes(apartmentId)) favorites[userId] = [...current, apartmentId];
  writeFavorites(favorites);
  return favorites[userId];
};
export const removeFavorite = (userId: string, apartmentId: number) => {
  const favorites = readFavorites();
  favorites[userId] = (favorites[userId] || []).filter((id) => id !== apartmentId);
  writeFavorites(favorites);
  return favorites[userId];
};
