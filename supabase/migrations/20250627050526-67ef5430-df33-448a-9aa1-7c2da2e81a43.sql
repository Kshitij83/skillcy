
-- First, let's update the profiles table to include the new fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enrolled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS uploads INTEGER DEFAULT 0;

-- Update the courses table to include uploader email
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS uploader_email TEXT;

-- Update existing courses with uploader emails from auth.users if possible
-- This will be done via a function since we can't directly access auth.users
CREATE OR REPLACE FUNCTION update_course_uploader_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update courses with uploader emails from profiles
  UPDATE public.courses 
  SET uploader_email = (
    SELECT auth.email 
    FROM auth.users auth 
    WHERE auth.id = courses.uploader_id
  )
  WHERE uploader_email IS NULL;
END;
$$;

-- Add a completion status to user_courses
ALTER TABLE public.user_courses 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Remove the progress column as we'll use boolean completion instead
ALTER TABLE public.user_courses 
DROP COLUMN IF EXISTS progress;

-- Drop the categories table since it's not needed
DROP TABLE IF EXISTS public.categories CASCADE;

-- Update the foreign key constraint for courses.category_id since we're removing categories
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS category_id;

-- Create a function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    completed = (
      SELECT COUNT(*) 
      FROM public.user_courses 
      WHERE user_id = user_uuid AND completed = TRUE
    ),
    enrolled = (
      SELECT COUNT(*) 
      FROM public.user_courses 
      WHERE user_id = user_uuid
    ),
    uploads = (
      SELECT COUNT(*) 
      FROM public.courses 
      WHERE uploader_id = user_uuid
    )
  WHERE user_id = user_uuid;
END;
$$;

-- Create a trigger to automatically update profile stats when user_courses changes
CREATE OR REPLACE FUNCTION trigger_update_profile_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update stats for the affected user
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_profile_stats(NEW.user_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_profile_stats(OLD.user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_user_courses_stats ON public.user_courses;
CREATE TRIGGER trigger_user_courses_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.user_courses
  FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_stats();

-- Create trigger for courses table to update upload stats
CREATE OR REPLACE FUNCTION trigger_update_upload_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update stats for the affected user
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_profile_stats(NEW.uploader_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_profile_stats(OLD.uploader_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_courses_upload_stats ON public.courses;
CREATE TRIGGER trigger_courses_upload_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION trigger_update_upload_stats();
