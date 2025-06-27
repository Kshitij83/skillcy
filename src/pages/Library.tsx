
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

interface UserCourse {
  id: string;
  completed: boolean;
  completed_at: string | null;
  added_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    content_type: string;
    access_type: string;
    image_url: string;
    content_url: string | null;
    content_text: string | null;
  };
}

const DEFAULT_IMAGE_URL = 'https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg';

export const Library: React.FC = () => {
  const { user } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLibraryCourses();
    }
  }, [user]);

  const fetchLibraryCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses(id, title, description, content_type, access_type, image_url, content_url, content_text)
        `)
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setUserCourses(data || []);
    } catch (error) {
      console.error('Error fetching library courses:', error);
      toast({
        title: "Error",
        description: "Failed to load library courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseCompletion = async (userCourseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_courses')
        .update({
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', userCourseId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: !currentStatus ? "Course marked as completed!" : "Course marked as incomplete",
      });

      fetchLibraryCourses();
    } catch (error) {
      console.error('Error updating course completion:', error);
      toast({
        title: "Error",
        description: "Failed to update course completion",
        variant: "destructive",
      });
    }
  };

  const removeCourseFromLibrary = async (userCourseId: string) => {
    try {
      const { error } = await supabase
        .from('user_courses')
        .delete()
        .eq('id', userCourseId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course removed from library",
      });

      fetchLibraryCourses();
    } catch (error) {
      console.error('Error removing course from library:', error);
      toast({
        title: "Error",
        description: "Failed to remove course from library",
        variant: "destructive",
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

  const completedCount = userCourses.filter(uc => uc.completed).length;
  const completionPercentage = userCourses.length > 0 ? Math.round((completedCount / userCourses.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Courses you've added to your personal library
        </p>
        {userCourses.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {completedCount} of {userCourses.length} completed ({completionPercentage}%)
            </Badge>
          </div>
        )}
      </div>

      {userCourses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
            <p className="text-gray-600 mb-4">
              Start adding courses to your library to track your learning progress
            </p>
            <Link to="/browse">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourses.map((userCourse) => (
            <Card key={userCourse.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={userCourse.courses.image_url || DEFAULT_IMAGE_URL}
                  alt={userCourse.courses.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={userCourse.courses.access_type === 'premium' ? 'secondary' : 'default'}>
                    {userCourse.courses.access_type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeCourseFromLibrary(userCourse.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {userCourse.completed && (
                  <div className="absolute top-2 left-2">
                    <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{userCourse.courses.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {userCourse.courses.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`complete-${userCourse.id}`}
                      checked={userCourse.completed}
                      onCheckedChange={() => toggleCourseCompletion(userCourse.id, userCourse.completed)}
                    />
                    <label
                      htmlFor={`complete-${userCourse.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark as completed
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {userCourse.courses.content_type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Added {new Date(userCourse.added_at).toLocaleDateString()}
                    </span>
                  </div>

                  {userCourse.completed && userCourse.completed_at && (
                    <p className="text-xs text-green-600">
                      Completed on {new Date(userCourse.completed_at).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/learn/${userCourse.courses.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        {userCourse.completed ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </Link>
                    {(userCourse.courses.content_url || userCourse.courses.content_text) && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={userCourse.courses.content_url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Access {userCourse.courses.content_type}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
