
-- Add image_url column to courses table
ALTER TABLE public.courses ADD COLUMN image_url TEXT;

-- Add foreign key relationship between courses.uploader_id and profiles.user_id
-- First, let's make sure we have the proper foreign key constraint
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_uploader_profiles 
FOREIGN KEY (uploader_id) REFERENCES public.profiles(user_id);
