-- ============================================================================
-- Livestock Antimicrobial Monitoring System - Database Setup Script
-- PostgreSQL 14+
-- ============================================================================

-- Connect to default database first to create the new database
-- Run this section separately if needed:
-- DROP DATABASE IF EXISTS livestock_monitoring_db;
-- CREATE DATABASE livestock_monitoring_db;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('FARMER', 'VET', 'INSPECTOR', 'ADMIN');
    END IF;
END$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_users_name_not_empty CHECK (TRIM(name) <> '')
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_farms_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    
    CONSTRAINT chk_farms_name_not_empty CHECK (TRIM(name) <> ''),
    CONSTRAINT chk_farms_location_not_empty CHECK (TRIM(location) <> '')
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    species VARCHAR(100) NOT NULL,
    age INTEGER,
    weight NUMERIC(10, 2),
    tag_number VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_animals_farm
        FOREIGN KEY (farm_id)
        REFERENCES farms(id)
        ON DELETE CASCADE,
    
    CONSTRAINT chk_animals_species_not_empty CHECK (TRIM(species) <> ''),
    CONSTRAINT chk_animals_age_positive CHECK (age IS NULL OR age >= 0),
    CONSTRAINT chk_animals_weight_positive CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT chk_animals_tag_not_empty CHECK (TRIM(tag_number) <> '')
);

-- Antimicrobial usage table
CREATE TABLE IF NOT EXISTS antimicrobial_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    compound VARCHAR(255) NOT NULL,
    dosage_mg NUMERIC(12, 4) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_antimicrobial_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_antimicrobial_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,
    
    CONSTRAINT chk_antimicrobial_drug_not_empty CHECK (TRIM(drug_name) <> ''),
    CONSTRAINT chk_antimicrobial_compound_not_empty CHECK (TRIM(compound) <> ''),
    CONSTRAINT chk_antimicrobial_dosage_positive CHECK (dosage_mg > 0),
    CONSTRAINT chk_antimicrobial_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

-- MRL (Maximum Residue Limits) table
CREATE TABLE IF NOT EXISTS mrl_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compound VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    mrl_value_mg_per_kg NUMERIC(10, 6) NOT NULL,
    withdrawal_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT chk_mrl_compound_not_empty CHECK (TRIM(compound) <> ''),
    CONSTRAINT chk_mrl_species_not_empty CHECK (TRIM(species) <> ''),
    CONSTRAINT chk_mrl_product_type_valid CHECK (product_type IN ('milk', 'meat', 'eggs', 'honey')),
    CONSTRAINT chk_mrl_value_positive CHECK (mrl_value_mg_per_kg > 0),
    CONSTRAINT chk_mrl_withdrawal_positive CHECK (withdrawal_days >= 0),
    
    CONSTRAINT uq_mrl_compound_species_product UNIQUE (compound, species, product_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Foreign key indexes for query performance
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_farm_id ON animals(farm_id);
CREATE INDEX IF NOT EXISTS idx_antimicrobial_animal_id ON antimicrobial_usage(animal_id);
CREATE INDEX IF NOT EXISTS idx_antimicrobial_created_by ON antimicrobial_usage(created_by);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_tag_number ON animals(tag_number);
CREATE INDEX IF NOT EXISTS idx_antimicrobial_compound ON antimicrobial_usage(compound);
CREATE INDEX IF NOT EXISTS idx_antimicrobial_start_date ON antimicrobial_usage(start_date);
CREATE INDEX IF NOT EXISTS idx_mrl_compound_species ON mrl_limits(compound, species);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert users (admin, farmer, vet)
INSERT INTO users (id, name, email, role) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'System Administrator', 'admin@agrovanta.com', 'ADMIN'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'John Smith', 'john.smith@farmmail.com', 'FARMER'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Dr. Sarah Johnson', 'sarah.johnson@vetclinic.com', 'VET')
ON CONFLICT (email) DO NOTHING;

-- Insert MRL limits for cattle (Oxytetracycline, Enrofloxacin, Penicillin)
INSERT INTO mrl_limits (compound, species, product_type, mrl_value_mg_per_kg, withdrawal_days) VALUES
    -- Oxytetracycline
    ('Oxytetracycline', 'cattle', 'meat', 0.100, 28),
    ('Oxytetracycline', 'cattle', 'milk', 0.100, 7),
    
    -- Enrofloxacin
    ('Enrofloxacin', 'cattle', 'meat', 0.100, 14),
    ('Enrofloxacin', 'cattle', 'milk', 0.100, 5),
    
    -- Penicillin G
    ('Penicillin G', 'cattle', 'meat', 0.050, 10),
    ('Penicillin G', 'cattle', 'milk', 0.004, 4)
ON CONFLICT (compound, species, product_type) DO NOTHING;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Active antimicrobial treatments (within withdrawal period)
CREATE OR REPLACE VIEW v_active_treatments AS
SELECT 
    au.id AS treatment_id,
    a.tag_number,
    a.species,
    f.name AS farm_name,
    au.drug_name,
    au.compound,
    au.dosage_mg,
    au.start_date,
    au.end_date,
    ml.withdrawal_days,
    COALESCE(au.end_date, au.start_date) + ml.withdrawal_days AS withdrawal_end_date,
    u.name AS prescribed_by
FROM antimicrobial_usage au
JOIN animals a ON au.animal_id = a.id
JOIN farms f ON a.farm_id = f.id
JOIN users u ON au.created_by = u.id
LEFT JOIN mrl_limits ml ON au.compound = ml.compound 
    AND a.species = ml.species 
    AND ml.product_type = 'meat'
WHERE CURRENT_DATE <= COALESCE(au.end_date, au.start_date) + COALESCE(ml.withdrawal_days, 0);

-- View: MRL compliance check
CREATE OR REPLACE VIEW v_mrl_compliance AS
SELECT 
    a.id AS animal_id,
    a.tag_number,
    a.species,
    f.name AS farm_name,
    au.compound,
    au.start_date,
    au.end_date,
    ml.product_type,
    ml.mrl_value_mg_per_kg,
    ml.withdrawal_days,
    COALESCE(au.end_date, au.start_date) + ml.withdrawal_days AS safe_date,
    CASE 
        WHEN CURRENT_DATE > COALESCE(au.end_date, au.start_date) + ml.withdrawal_days 
        THEN 'COMPLIANT'
        ELSE 'IN_WITHDRAWAL'
    END AS compliance_status
FROM antimicrobial_usage au
JOIN animals a ON au.animal_id = a.id
JOIN farms f ON a.farm_id = f.id
JOIN mrl_limits ml ON au.compound = ml.compound AND a.species = ml.species;

-- ============================================================================
-- GRANTS (Uncomment and modify as needed for your environment)
-- ============================================================================

-- CREATE ROLE livestock_app_user WITH LOGIN PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE livestock_monitoring_db TO livestock_app_user;
-- GRANT USAGE ON SCHEMA public TO livestock_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO livestock_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO livestock_app_user;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    mrl_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO mrl_count FROM mrl_limits;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Users seeded: %', user_count;
    RAISE NOTICE 'MRL records seeded: %', mrl_count;
    RAISE NOTICE '============================================';
END$$;
