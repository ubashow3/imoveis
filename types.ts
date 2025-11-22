

export type PropertyType = 'sale' | 'rent_seasonal';

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[]; // Changed from imageUrl to images array
  features: string[];
  views: number;
}

export type ThemeOption = 'ocean' | 'nature' | 'sunset' | 'dark';

export interface SiteSettings {
  siteName: string;
  logoUrl?: string; // URL for custom logo
  primaryColor: ThemeOption;
  contact: {
    address: string;
    phone: string; // General contact/Sales
    bookingPhone?: string; // Specific for reservations
    email: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
}

export enum ViewState {
  HOME = 'HOME',
  DETAILS = 'DETAILS',
  ADMIN_PROPERTIES = 'ADMIN_PROPERTIES',
  ADMIN_FORM = 'ADMIN_FORM', // Renamed from ADMIN_ADD to handle Edit/Add
  ADMIN_SETTINGS = 'ADMIN_SETTINGS'
}