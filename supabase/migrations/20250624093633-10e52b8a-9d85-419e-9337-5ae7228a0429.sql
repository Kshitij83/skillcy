
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'text')),
  content_url TEXT,
  content_text TEXT,
  category_id UUID REFERENCES public.categories,
  uploader_id UUID REFERENCES auth.users NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'public' CHECK (access_type IN ('private', 'public', 'premium')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_courses table for tracking enrolled/saved courses
CREATE TABLE public.user_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES public.courses NOT NULL,
  progress DECIMAL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES
  ('Web Development', 'HTML, CSS, JavaScript, React, and more'),
  ('Data Structures & Algorithms', 'DSA concepts and problem solving'),
  ('Artificial Intelligence', 'AI, ML, and related technologies'),
  ('Mobile Development', 'iOS, Android, and cross-platform development'),
  ('Database Systems', 'SQL, NoSQL, and database design'),
  ('Computer Networks', 'Networking protocols and concepts');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories policies (public read access)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Courses policies
CREATE POLICY "Anyone can view approved public courses" ON public.courses 
  FOR SELECT USING (is_approved = true AND access_type = 'public');

CREATE POLICY "Premium users can view premium courses" ON public.courses 
  FOR SELECT USING (
    is_approved = true AND 
    (access_type = 'public' OR 
     (access_type = 'premium' AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE user_id = auth.uid() AND role IN ('premium', 'admin')
     )))
  );

CREATE POLICY "Users can view own private courses" ON public.courses 
  FOR SELECT USING (uploader_id = auth.uid());

CREATE POLICY "Users can insert own courses" ON public.courses 
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own courses" ON public.courses 
  FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own courses" ON public.courses 
  FOR DELETE USING (auth.uid() = uploader_id);

-- User courses policies
CREATE POLICY "Users can view own enrolled courses" ON public.user_courses 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON public.user_courses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON public.user_courses 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove courses from library" ON public.user_courses 
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
