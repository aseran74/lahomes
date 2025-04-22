export interface PropertyShare {
  id: string;
  property_id: string;
  share_number: number;
  estado: 'disponible' | 'reservada' | 'vendida';
  price: number;
  created_at?: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_main: boolean;
  file_size?: number;
  file_type?: string;
  width?: number;
  height?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  total_price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  square_feet: number;
  year_built: number;
  category: string;
  features: string[];
  amenities: string[];
  total_shares: number;
  estado: 'disponible' | 'reservada' | 'vendida';
  agent_id: string | null;
  images?: PropertyImage[];
  property_images?: PropertyImage[];
  shares?: PropertyShare[];
  created_at?: string;
  updated_at?: string;
  commission_percentage: number;
  commission_status: 'pagada' | 'pendiente';
  destacada?: boolean;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  share1_status: 'disponible' | 'reservada' | 'vendida';
  share2_status: 'disponible' | 'reservada' | 'vendida';
  share3_status: 'disponible' | 'reservada' | 'vendida';
  share4_status: 'disponible' | 'reservada' | 'vendida';
  share1_price: number;
  share2_price: number;
  share3_price: number;
  share4_price: number;
}

export interface PropertyFilters {
  minPrice?: string;
  maxPrice?: string;
  estado?: string;
  status?: string;
  category?: string;
  copropiedades?: string;
  searchTerm?: string;
} 