// Tipos de facturas
export type InvoiceType = 'common_expenses' | 'management_expenses';

// Estados bancarios de facturas
export type InvoiceBankStatus = 'pending' | 'sent' | 'returned';

// Estados de pago de facturas
export type InvoicePaymentStatus = 'paid' | 'pending' | 'returned';

// Interfaz para la factura
export interface Invoice {
  id?: string;
  owner_id: string;
  property_id: string;
  invoice_date: string;
  invoice_month: number;
  invoice_year: number;
  amount: number;
  invoice_type: InvoiceType;
  bank_status: InvoiceBankStatus;
  payment_status: InvoicePaymentStatus;
  invoice_number: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para propietario
export interface Owner {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
}

// Interfaz para propiedad actualizada según la estructura real
export interface Property {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  square_feet?: number;
  year_built?: number;
  category?: string;
  total_price?: number;
  features?: string[];
  amenities?: string[];
  total_shares?: number;
  agent_id?: string;
  estado?: string;
  commission_percentage?: number;
  commission_status?: string;
  owner_id?: string | null;
} 