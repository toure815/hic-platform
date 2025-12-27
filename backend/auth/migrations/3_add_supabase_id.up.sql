ALTER TABLE users ADD COLUMN supabase_id TEXT UNIQUE;

-- Create index for efficient lookups
CREATE INDEX idx_users_supabase_id ON users(supabase_id);

-- Update existing admin user with a placeholder supabase_id
UPDATE users 
SET supabase_id = 'admin-placeholder-' || id::text 
WHERE email = 'admin@example.com' AND supabase_id IS NULL;
