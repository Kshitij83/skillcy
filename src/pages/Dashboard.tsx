
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Upload, BarChart3, Clock, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { UploadCourseModal } from '@/components/UploadCourseModal';
import { EditCourseModal } from '@/components/EditCourseModal';

interface UserCourse {
  id: string;
  completed: boolean;
  added_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    content_type: string;
    access_type: string;
  };
}

interface UploadedCourse {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_url: string;
  content_text: string;
  access_type: string;
  difficulty: string;
  tags: string[];
  image_url: string;
  created_at: string;
  uploader_email: string;
}

interface ProfileStats {
  completed: number;
  enrolled: number;
  uploads: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [uploadedCourses, setUploadedCourses] = useState<UploadedCourse[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>({ completed: 0, enrolled: 0, uploads: 0 });
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<UploadedCourse | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's enrolled courses
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses(id, title, description, content_type, access_type)
        `)
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (enrolledError) throw enrolledError;

      // Fetch user's uploaded courses
      const { data: uploadedData, error: uploadedError } = await supabase
        .from('courses')
        .select('*')
        .eq('uploader_id', user?.id)
        .order('created_at', { ascending: false });

      if (uploadedError) throw uploadedError;

      // Fetch profile stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('completed, enrolled, uploads')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Calculate stats manually if profile fetch fails
        const enrolledCount = enrolledData?.length || 0;
        const completedCount = enrolledData?.filter(uc => uc.completed).length || 0;
        const uploadsCount = uploadedData?.length || 0;
        setProfileStats({ completed: completedCount, enrolled: enrolledCount, uploads: uploadsCount });
      } else {
        setProfileStats({
          completed: profileData?.completed || 0,
          enrolled: profileData?.enrolled || 0,
          uploads: profileData?.uploads || 0
        });
      }

      setUserCourses(enrolledData || []);
      setUploadedCourses(uploadedData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDashboardData();
    setShowUploadModal(false);
  };

  const handleEditSuccess = () => {
    fetchDashboardData();
    setShowEditModal(false);
    setSelectedCourse(null);
  };

  const handleEditCourse = (course: UploadedCourse) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete from user_courses table
      await supabase
        .from('user_courses')
        .delete()
        .eq('course_id', courseId);

      // Then delete the course itself
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('uploader_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
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

  const completionPercentage = profileStats.enrolled > 0 
    ? Math.round((profileStats.completed / profileStats.enrolled) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning progress and manage your content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{profileStats.enrolled}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profileStats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Uploads</CardTitle>
            <Upload className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{profileStats.uploads}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{completionPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Library */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Library
              </CardTitle>
              <div className="flex gap-2">
                <Link to="/library">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" size="sm">
                    Browse More
                  </Button>
                </Link>
              </div>
            </div>
            <CardDescription>
              Courses you've added to your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userCourses.slice(0, 3).map((userCourse) => (
                <div key={userCourse.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{userCourse.courses.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={userCourse.courses.access_type === 'premium' ? 'secondary' : 'default'}>
                        {userCourse.courses.access_type}
                      </Badge>
                      {userCourse.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {userCourse.courses.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {userCourse.courses.content_type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {userCourse.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <Link to={`/learn/${userCourse.courses.id}`} className="inline-block mt-2">
                    <Button size="sm" variant="outline">
                      {userCourse.completed ? 'Review Course' : 'Continue Learning'}
                    </Button>
                  </Link>
                </div>
              ))}
              {userCourses.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No courses in your library yet. Browse courses to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Uploads */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                My Uploads
              </CardTitle>
              <Button 
                onClick={() => setShowUploadModal(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
            <CardDescription>
              Courses you've shared with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{course.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.access_type === 'premium' ? 'secondary' : 'default'}>
                        {course.access_type}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCourse(course)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline">
                      {course.content_type}
                    </Badge>
                  </div>
                  <Link to={`/learn/${course.id}`} className="inline-block mt-2">
                    <Button size="sm" variant="outline">
                      View Course
                    </Button>
                  </Link>
                </div>
              ))}
              {uploadedCourses.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  You haven't uploaded any courses yet. Share your knowledge with the community!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <UploadCourseModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <EditCourseModal
        course={selectedCourse}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};
