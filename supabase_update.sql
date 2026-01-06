-- 1. Create Projects Table (if not exists)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT,
  description TEXT,
  tags TEXT[],
  image TEXT,
  content_images TEXT[],
  size TEXT,
  link TEXT,
  video_url TEXT,
  full_content TEXT,
  gallery JSONB,
  stats JSONB,
  -- Legacy column support
  contentimage TEXT
);

-- 2. Add content_images column if missing (safe migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'content_images') THEN
        ALTER TABLE projects ADD COLUMN content_images TEXT[];
    END IF;
    -- Also add contentimage if it was deleted or missing, just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'contentimage') THEN
        ALTER TABLE projects ADD COLUMN contentimage TEXT;
    END IF;
END $$;

-- 3. Migrate Data
UPDATE projects SET content_images = ARRAY[contentimage] WHERE contentimage IS NOT NULL AND (content_images IS NULL OR content_images = '{}');

-- 4. Projects Table Permissions (Allow Public Access for this simple app)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON projects;
DROP POLICY IF EXISTS "Enable update for all users" ON projects;
DROP POLICY IF EXISTS "Enable delete for all users" ON projects;
DROP POLICY IF EXISTS "Allow Public CRUD" ON projects;

-- Create a blanket "Allow All" policy
CREATE POLICY "Allow Public CRUD" ON projects
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Storage Setup ('portfolio-images' bucket)
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Permissions
-- Allow public access to storage objects in this bucket
DROP POLICY IF EXISTS "Allow Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

CREATE POLICY "Allow Public Select" ON storage.objects
FOR SELECT USING ( bucket_id = 'portfolio-images' );

CREATE POLICY "Allow Public Insert" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'portfolio-images' );

CREATE POLICY "Allow Public Update" ON storage.objects
FOR UPDATE USING ( bucket_id = 'portfolio-images' );

CREATE POLICY "Allow Public Delete" ON storage.objects
FOR DELETE USING ( bucket_id = 'portfolio-images' );

-- 7. Add tools column
ALTER TABLE projects ADD COLUMN tools TEXT[];
