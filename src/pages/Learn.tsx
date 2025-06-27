import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Clock, User, Star, Play, FileText, Video, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_url: string | null;
  content_text: string | null;
  access_type: string;
  difficulty: string;
  tags: string[];
  image_url: string;
  categories: { name: string } | null;
  profiles: { full_name: string | null } | null;
}

const DEFAULT_IMAGE_URL = 'https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg';

// Sample course data (matches the Browse page)
const dummyCourseData: { [key: string]: any } = {
  '1': {
    id: '1',
    title: 'Complete React Development Course',
    description: 'Master React from basics to advanced concepts including hooks, context, and state management. This comprehensive course covers everything you need to become a React developer.',
    content_type: 'video',
    content_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    access_type: 'public',
    difficulty: 'intermediate',
    tags: ['React', 'JavaScript', 'Frontend'],
    instructor: 'Sarah Johnson',
    duration: '12 hours',
    rating: 4.8,
    students: 1250,
    image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    modules: [
      { title: 'Introduction to React', duration: '45 min', completed: true },
      { title: 'Components and JSX', duration: '60 min', completed: true },
      { title: 'State and Props', duration: '75 min', completed: false },
      { title: 'Event Handling', duration: '50 min', completed: false },
      { title: 'Hooks in Detail', duration: '90 min', completed: false }
    ]
  },
  '2': {
    id: '2',
    title: 'Python for Data Science',
    description: 'Learn Python programming with focus on data analysis, pandas, numpy, and machine learning basics.',
    content_type: 'pdf',
    content_url: 'https://example.com/python-data-science.pdf',
    access_type: 'premium',
    difficulty: 'beginner',
    tags: ['Python', 'Data Science', 'Machine Learning'],
    instructor: 'Dr. Michael Chen',
    duration: '15 hours',
    rating: 4.9,
    students: 890,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    modules: [
      { title: 'Python Basics', duration: '60 min', completed: false },
      { title: 'Data Structures', duration: '80 min', completed: false },
      { title: 'NumPy Fundamentals', duration: '70 min', completed: false },
      { title: 'Pandas for Data Analysis', duration: '90 min', completed: false },
      { title: 'Introduction to ML', duration: '100 min', completed: false }
    ]
  }
};

export const Learn: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(40);
  const [inLibrary, setInLibrary] = useState(false);
  const [userCourseId, setUserCourseId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (user && courseId) {
      checkLibraryStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId, loading]);

  const fetchCourse = async (id: string) => {
    try {
      setLoading(true);
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!fk_courses_uploader_profiles(full_name)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        // Fallback to dummy data
        const dummyCourse = dummyCourseData[id];
        if (dummyCourse) {
          setCourse({
            ...dummyCourse,
            categories: null,
            profiles: { full_name: dummyCourse.instructor }
          });
        } else {
          setCourse(null);
        }
      } else {
        setCourse({
          ...data,
          image_url: data.image_url || DEFAULT_IMAGE_URL,
          tags: data.tags || [],
          categories: null,
          profiles: data.profiles ? { full_name: data.profiles.full_name } : null
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const checkLibraryStatus = async () => {
    const { data, error } = await supabase
      .from('user_courses')
      .select('id, completed')
      .eq('user_id', user?.id)
      .eq('course_id', courseId)
      .single();
    if (data) {
      setInLibrary(true);
      setUserCourseId(data.id);
      setCompleted(data.completed);
    } else {
      setInLibrary(false);
      setUserCourseId(null);
      setCompleted(false);
    }
  };

  const handleAccessContent = () => {
    if (!course) return;

    if (course.access_type === 'premium' && user && !['premium', 'admin'].includes(user.user_metadata?.role)) {
      toast({
        title: "Premium Required",
        description: "This is a premium course. Please upgrade to access the content.",
        variant: "destructive",
      });
      return;
    }

    if (course.content_type === 'text' && course.content_text) {
      // Display text content in a modal or new section
      toast({
        title: "Text Content",
        description: "Text content will be displayed below",
      });
    } else if (course.content_url) {
      // Open PDF or video link in new tab
      window.open(course.content_url, '_blank');
    } else {
      toast({
        title: "No Content Available",
        description: "This course doesn't have accessible content yet.",
        variant: "destructive",
      });
    }
  };

  const handleAddToLibrary = async () => {
    if (!user || !courseId) return;
    const { error } = await supabase
      .from('user_courses')
      .insert([{ user_id: user.id, course_id: courseId, completed: false }]);
    if (!error) {
      setInLibrary(true);
      checkLibraryStatus();
      toast({
        title: "Added to Library",
        description: "Course added to your library. You can now access and track progress.",
      });
    }
  };

  const handleMarkCompleted = async () => {
    if (!userCourseId) return;
    const { error } = await supabase
      .from('user_courses')
      .update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null })
      .eq('id', userCourseId);
    if (!error) {
      setCompleted(!completed);
      toast({
        title: !completed ? "Marked as Completed" : "Marked as Incomplete",
        description: !completed ? "Course marked as completed!" : "Course marked as incomplete.",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link to="/browse">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const dummyCourse = dummyCourseData[course.id];
  const completedModules = dummyCourse?.modules?.filter((m: any) => m.completed).length || 0;
  const totalModules = dummyCourse?.modules?.length || 5;
  const courseProgress = (completedModules / totalModules) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/browse">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <img
                src={course.image_url || DEFAULT_IMAGE_URL}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = DEFAULT_IMAGE_URL;
                }}
              />
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={course.access_type === 'premium' ? 'secondary' : 'default'}>
                  {course.access_type === 'premium' ? '✨ Premium' : '🆓 Free'}
                </Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
                <Badge variant="outline">
                  {course.content_type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                  {course.content_type}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {course.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {course.profiles?.full_name || 'Anonymous'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {dummyCourse?.duration || 'Self-paced'}
                </div>
                {dummyCourse?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {dummyCourse.rating} ({dummyCourse.students} students)
                  </div>
                )}
              </div>

              {user && dummyCourse?.modules && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(courseProgress)}% Complete</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                </div>
              )}

              {/* Content Access Button and Add/Mark as Completed */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4">
                <Button 
                  onClick={handleAccessContent}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  size="lg"
                  disabled={!inLibrary}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access {course.content_type === 'video' ? 'Video' : course.content_type === 'pdf' ? 'PDF' : 'Content'}
                </Button>
                {user && (
                  inLibrary ? (
                    <Button
                      variant={completed ? "outline" : "default"}
                      className="ml-0 mt-2 md:mt-0 md:ml-2"
                      onClick={handleMarkCompleted}
                    >
                      {completed ? "Mark as Incomplete" : "Mark as Completed"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="ml-0 mt-2 md:mt-0 md:ml-2"
                      onClick={handleAddToLibrary}
                    >
                      Add to Library to access material
                    </Button>
                  )
                )}
              </div>

              {/* Display text content if available */}
              {course.content_type === 'text' && course.content_text && (
                <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{course.content_text}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Course Modules (if available) */}
            {dummyCourse?.modules && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Content
                  </CardTitle>
                  <CardDescription>
                    {totalModules} modules • {dummyCourse.duration} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dummyCourse.modules.map((module: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            module.completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {module.completed ? '✓' : index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{module.title}</h4>
                            <p className="text-sm text-gray-500">{module.duration}</p>
                          </div>
                        </div>
                        <Button size="sm" variant={module.completed ? "outline" : "default"} onClick={handleAccessContent}>
                          <Play className="h-4 w-4 mr-2" />
                          {module.completed ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!user && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
                <CardHeader>
                  <CardTitle>Sign in to track progress</CardTitle>
                  <CardDescription>
                    Create an account to save your progress and access premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/auth">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign In / Sign Up
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {course.access_type === 'premium' && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✨ Premium Course
                  </CardTitle>
                  <CardDescription>
                    Upgrade to premium to access this course and many more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/premium">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Upgrade to Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Content Type</span>
                  <span className="font-medium capitalize">{course.content_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                  <span className="font-medium capitalize">{course.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Access</span>
                  <span className="font-medium capitalize">{course.access_type}</span>
                </div>
                {dummyCourse?.students && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Students</span>
                    <span className="font-medium">{dummyCourse.students.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
