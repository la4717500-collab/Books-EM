export type BookStatus = 'disponible' | 'bajo_pedido' | 'agotado';

export type CurrencyCode = 'USD' | 'EUR' | 'VES';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  currency?: CurrencyCode;
  status: BookStatus;
  featured: boolean;
  coverUrl: string;
  images?: string[];
  synopsis: string;
  editorial?: string;
  pages?: number;
  publishedYear?: number;
  isbn?: string;
  createdAt: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  currencySymbol: string;
  defaultCurrency?: CurrencyCode;
  paymentMethods: string;
  contactEmail: string;
  storeLocation: string;
  adminUsername: string;
  adminPassword: string;
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'title_asc' | 'recent';

export interface FilterState {
  search: string;
  genre: string;
  author: string;
  status: string; // 'all' | 'disponible' | 'bajo_pedido' | 'agotado'
  featuredOnly: boolean;
  sortBy: SortOption;
}
