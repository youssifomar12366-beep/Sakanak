export type AllowedGender = "females" | "males" | "any";
export type Language = "ar" | "en";

export type Apartment = {
  id: number;
  status?: "pending" | "approved" | "rejected";
  buildingNumber: string;
  floorNumber: string | number;
  city: string;
  area: string;
  district: string;
  address: string;
  fullLocation?: string;
  images: string[];
  price: number;
  rating: number;
  image: string;
  beds: number;
  rooms: number;
  amenities: string[];
  allowedGender: AllowedGender;
  publisherRole: "OWNER" | "BROKER";
  ownerId?: string;
  publisherName: string;
  publisherPhone: string;
};

export type UserRole = "STUDENT" | "OWNER" | "BROKER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  collegeOrWork?: string;
  password?: string;
  role: UserRole;
};

export type RegistrationData = {
  name: string;
  email: string;
  phone: string;
  collegeOrWork?: string;
  password: string;
  role: UserRole;
};

export type Store = {
  dark: boolean;
  language: Language;
  favorites: number[];
  currentUser: User | null;
  toggle: (id: number) => void;
  theme: () => void;
  lang: () => void;
  register: (data: RegistrationData) => User;
  login: (email: string, password: string) => User | null;
  logout: () => void;
};

export type AppText = {
  home: string;
  explore: string;
  how: string;
  owners: string;
  sign: string;
  join: string;
  title: string;
  desc: string;
  search: string;
  featured: string;
  buildingNumber?: string;
  floorNumber?: string;
};

export type BookingType = "apartment" | "room" | "bed";

export type Booking = {
  bookingId: string;
  apartmentId: number;
  apartmentTitle: string;
  ownerId: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  collegeOrWork?: string;
  bookingType: BookingType;
  quantity: number;
  selectedRoom?: number;
  selectedRooms?: number[];
  selectedBed?: number;
  selectedBeds?: number[];
  price: number;
  bookingDate?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "approved" | "rejected";
};

export type BookingNotification = {
  notificationId: string;
  ownerId?: string;
  bookingId: string;
  studentId?: string;
  title: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  collegeOrWork?: string;
  apartmentTitle: string;
  bookingType: BookingType;
  quantity: number;
  selectedRoom?: number;
  selectedRooms?: number[];
  selectedBed?: number;
  selectedBeds?: number[];
  price: number;
  bookingDate?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "approved" | "rejected";
};
