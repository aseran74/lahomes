-- Crear los tipos enumerados para estados de facturas
CREATE TYPE invoice_type AS ENUM ('common_expenses', 'management_expenses');
CREATE TYPE invoice_bank_status AS ENUM ('pending', 'sent', 'returned');
CREATE TYPE invoice_payment_status AS ENUM ('pending', 'paid', 'returned');

-- Crear la tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL,
  invoice_month INTEGER NOT NULL CHECK (invoice_month BETWEEN 1 AND 12),
  invoice_year INTEGER NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  invoice_type invoice_type NOT NULL,
  bank_status invoice_bank_status NOT NULL DEFAULT 'pending',
  payment_status invoice_payment_status NOT NULL DEFAULT 'pending',
  invoice_number VARCHAR NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_invoices_owner_id ON invoices(owner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_property_id ON invoices(property_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_year_month ON invoices(invoice_year, invoice_month);

-- Crear función para actualizar automaticamente el updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar el updated_at automáticamente
DROP TRIGGER IF EXISTS update_invoices_timestamp ON invoices;
CREATE TRIGGER update_invoices_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Política de seguridad para que solo los administradores puedan manipular facturas
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admins pueden hacer todo
CREATE POLICY admin_invoice_policy ON invoices
FOR ALL
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Owners solo pueden ver sus propias facturas
CREATE POLICY owner_view_policy ON invoices
FOR SELECT
USING (auth.role() = 'authenticated' AND owner_id::text = (auth.jwt() ->> 'sub')); 