import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  content_type: string;
  access_type: string;
  difficulty: string;
  tags: string[];
  image_url: string;
  created_at: string;
  uploader_email: string | null;
  profiles: { full_name: string } | null;
}

const DEFAULT_IMAGE_URL = 'https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg';

export const Browse: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userLibrary, setUserLibrary] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch courses with proper joins
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_uploader_id_fkey(full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Courses error:', coursesError);
        // Fallback to basic query if join fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        // Transform fallback data to match Course interface
        const transformedCourses: Course[] = (fallbackData || []).map(course => ({
          ...course,
          profiles: null,
          tags: course.tags || []
        }));
        setCourses(transformedCourses);
      } else {
        // Transform the data to ensure proper typing
        const transformedCourses: Course[] = (coursesData || []).map(course => ({
          id: course.id,
          title: course.title,
          description: course.description || '',
          content_type: course.content_type,
          access_type: course.access_type,
          difficulty: course.difficulty || '',
          tags: course.tags || [],
          image_url: course.image_url || '',
          created_at: course.created_at,
          uploader_email: course.uploader_email,
          profiles: course.profiles && 
                   typeof course.profiles === 'object' && 
                   course.profiles !== null &&
                   course.profiles !== undefined
            ? { full_name: (course.profiles as any).full_name }
            : null
        }));
        setCourses(transformedCourses);
      }

      // Fetch user's library if logged in
      if (user) {
        const { data: libraryData, error: libraryError } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', user.id);

        if (libraryError) throw libraryError;
        setUserLibrary(new Set(libraryData?.map(item => item.course_id) || []));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add courses to your library",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_courses')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          completed: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course added to your library!",
      });

      setUserLibrary(prev => new Set([...prev, courseId]));
    } catch (error) {
      console.error('Error adding course to library:', error);
      toast({
        title: "Error",
        description: "Failed to add course to library",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    const matchesContentType = !selectedContentType || selectedContentType === 'all' || course.content_type === selectedContentType;

    return matchesSearch && matchesDifficulty && matchesContentType;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Browse Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and learn from our extensive course library
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="text">Text/Article</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={course.image_url || DEFAULT_IMAGE_URL}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
                style={{ objectFit: 'fill'}} // h-48 = 192px
              />
              <div className="absolute top-2 right-2">
                <Badge variant={course.access_type === 'premium' ? 'secondary' : 'default'}>
                  {course.access_type}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
              <CardDescription
                className="line-clamp-2 min-h-[3em]" // Reserve space for 2 lines
                style={{ minHeight: '3em' }}
              >
                {course.description || <span>&nbsp;</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <Badge variant="outline">{course.content_type}</Badge>
                  {course.difficulty && (
                    <Badge variant="outline">{course.difficulty}</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/learn/${course.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      View Course
                    </Button>
                  </Link>
                  {user && !userLibrary.has(course.id) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToLibrary(course.id)}
                      title="Add to Library"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {user && userLibrary.has(course.id) && (
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      title="Already in Library"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all courses
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
