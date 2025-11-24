
export type PropertyType = 'sale' | 'rent_seasonal';

export interface Property {
  id: string;
  created_at?: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
  views: number;
  // Novos campos administrativos
  active: boolean;      // Se false, não aparece no site público
  featured: boolean;    // Se true, aparece com destaque/topo
  owner_notes?: string; // Observações internas (não aparece no site)
}

export type ThemeOption = 'ocean' | 'nature' | 'sunset' | 'dark';

export interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  primaryColor: ThemeOption;
  contact: {
    address: string;
    phone: string;
    bookingPhone?: string;
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
  ADMIN_FORM = 'ADMIN_FORM',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS'
}
