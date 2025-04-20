-- Create the roles enum type
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'owner', 'user');

-- Create the user_roles table to manage role assignments
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on existing tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles table
CREATE POLICY "Admins can do everything on user_roles" ON user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policies for properties table
CREATE POLICY "Admins full access to properties" ON properties
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Agents can view and update assigned properties" ON properties
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'agent'
            AND agent_id = auth.uid()
        )
    );

CREATE POLICY "Owners can view and update their properties" ON properties
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'owner'
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view available properties" ON properties
    FOR SELECT
    TO authenticated
    USING (
        estado = 'disponible'
        OR EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'agent')
        )
    );

-- Policies for agents table
CREATE POLICY "Admins full access to agents" ON agents
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Agents can view and update their own profile" ON agents
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'agent'
            AND id = auth.uid()
        )
    );

CREATE POLICY "Public can view agent profiles" ON agents
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial admin role for admin@test.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE email = 'admin@test.com';

-- Create helper function to check user role
CREATE OR REPLACE FUNCTION check_user_role(role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
        AND role = $1
    );
END;
$$ language plpgsql security definer;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialty VARCHAR(50),
    experience_years INTEGER,
    rating NUMERIC,
    properties_count INTEGER DEFAULT 0,
    linkedin_url VARCHAR(255),
    instagram_url VARCHAR(255),
    whatsapp VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    city TEXT,
    postal_code TEXT,
    photo_url TEXT,
    specialization VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    toilets INTEGER DEFAULT 0,
    square_feet NUMERIC DEFAULT 0,
    year_built INTEGER,
    category VARCHAR(50) NOT NULL,
    total_price NUMERIC NOT NULL DEFAULT 0,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_shares INTEGER NOT NULL DEFAULT 4,
    estado VARCHAR(20) DEFAULT 'disponible',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    agent_id UUID REFERENCES agents(id),
    commission_percentage NUMERIC,
    commission_status VARCHAR(10) DEFAULT 'pendiente',
    share1_status VARCHAR(10) DEFAULT 'disponible',
    share2_status VARCHAR(10) DEFAULT 'disponible',
    share3_status VARCHAR(10) DEFAULT 'disponible',
    share4_status VARCHAR(10) DEFAULT 'disponible',
    share1_price NUMERIC DEFAULT 0,
    share2_price NUMERIC DEFAULT 0,
    share3_price NUMERIC DEFAULT 0,
    share4_price NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS property_amenities (
    property_id UUID REFERENCES properties(id),
    amenity_id UUID REFERENCES amenities(id),
    PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS agents_commission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    agent_id UUID REFERENCES agents(id),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    commission_percentage NUMERIC NOT NULL DEFAULT 1,
    payment_status VARCHAR DEFAULT 'pendiente' NOT NULL
);

CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    dni VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE,
    ocupacion VARCHAR(100),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos en amenities
INSERT INTO amenities (id, name) VALUES
    ('c5138e6e-ac9e-49bd-8059-64f7b0d4d359', 'Piscina'),
    ('b504b130-e147-4d5d-aeda-2544f49fe02f', 'Gimnasio'),
    ('16983547-2184-4450-adb4-f2d2d1c7a698', 'Seguridad 24/7'),
    ('a23f3059-fc7c-4cfd-a333-663b46eb95cf', 'Parqueadero'),
    ('7abc45e0-1249-4cf7-9621-f8c280db4718', 'Área BBQ'),
    ('3b8b46e1-5614-461e-b165-ca691562e20e', 'Zona Social'),
    ('2951bf16-d29c-4177-94af-62abb61268f0', 'WiFi'),
    ('f1e6d62b-2dcc-4372-8846-10082cb030b3', 'Aire Acondicionado'),
    ('043181c1-a87b-45c9-87ee-7c6b423b8dff', 'Vista al Mar'),
    ('b66029d1-8bb5-4aaa-a7c6-8b5402f91c88', 'Terraza'); 