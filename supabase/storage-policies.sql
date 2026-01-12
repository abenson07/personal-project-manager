-- Storage policies for subproject-images bucket
-- Run this in Supabase Dashboard > SQL Editor
-- Note: Make sure the bucket is set to "Public" in Storage settings for these policies to work

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to subproject-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from subproject-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from subproject-images" ON storage.objects;

-- Policy 1: Allow public uploads to subproject-images bucket
CREATE POLICY "Allow public uploads to subproject-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'subproject-images'
);

-- Policy 2: Allow public reads from subproject-images bucket
CREATE POLICY "Allow public reads from subproject-images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'subproject-images'
);

-- Policy 3: Allow public deletes from subproject-images bucket
CREATE POLICY "Allow public deletes from subproject-images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'subproject-images'
);

