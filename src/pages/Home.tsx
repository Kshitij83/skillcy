import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Star, Rocket, Library, Award, BarChart3 } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper for auth-aware navigation
  const handleNav = (path: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Rich Learning Content",
      description: "Access videos, PDFs, and interactive materials"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Learn from and contribute to our growing community"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Premium Features",
      description: "Unlock exclusive content and advanced features"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
          {user
            ? `Welcome to Skillcy, ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner'}`
            : 'Welcome to Skillcy'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          The ultimate community-driven learning management system where anyone can learn, share, and grow together.
        </p>
        
        {/* Action Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10 max-w-5xl mx-auto mb-12">
          <Card className="group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-lg hover:shadow-xl">
            {/* Start Learning */}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-600 text-white rounded-full group-hover:bg-blue-700 transition-colors">
                <Rocket className="h-8 w-8" />
              </div>
              <CardTitle className="text-blue-600 dark:text-blue-400">Start Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Discover thousands of courses and resources
              </CardDescription>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleNav('/browse')}
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-lg hover:shadow-xl">
            {/* Dashboard */}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600 text-white rounded-full group-hover:bg-purple-700 transition-colors">
                <Library className="h-8 w-8" />
              </div>
              <CardTitle className="text-purple-600 dark:text-purple-400">Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Track your progress and manage your library
              </CardDescription>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => handleNav('/dashboard')}
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg hover:shadow-xl">
            {/* Library */}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-600 text-white rounded-full group-hover:bg-green-700 transition-colors">
                <Library className="h-8 w-8" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">Your Library</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                View and review your saved courses
              </CardDescription>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleNav('/library')}
              >
                View Library
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-0 shadow-lg hover:shadow-xl">
            {/* Premium */}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-pink-600 text-white rounded-full group-hover:bg-pink-700 transition-colors">
                <Award className="h-8 w-8" />
              </div>
              <CardTitle className="text-pink-600 dark:text-pink-400">Go Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Unlock exclusive content and features
              </CardDescription>
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={() => handleNav('/premium')}
              >
                Explore Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students in our learning community</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Today
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
