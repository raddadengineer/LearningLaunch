-- Initialize the database with required extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Drizzle migrations
-- This file is just for any initial setup if needed

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance
-- These will be added after tables are created by the application