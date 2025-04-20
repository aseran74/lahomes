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