
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Course {
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
}

interface EditCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_IMAGE_URL = 'https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg';

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageValidating, setImageValidating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    content_url: '',
    content_text: '',
    access_type: 'public',
    difficulty: '',
    tags: '',
    image_url: '',
  });

  useEffect(() => {
    if (isOpen && course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        content_type: course.content_type || '',
        content_url: course.content_url || '',
        content_text: course.content_text || '',
        access_type: course.access_type || 'public',
        difficulty: course.difficulty || '',
        tags: course.tags ? course.tags.join(', ') : '',
        image_url: course.image_url || '',
      });
    }
  }, [isOpen, course]);

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return true;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      setTimeout(() => resolve(false), 5000);
    });
  };

  const handleImageUrlChange = async (url: string) => {
    setFormData({ ...formData, image_url: url });
    
    if (url) {
      setImageValidating(true);
      const isValid = await validateImageUrl(url);
      setImageValidating(false);
      
      if (!isValid) {
        toast({
          title: "Invalid Image URL",
          description: "The image URL provided is not accessible. Default image will be used.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setLoading(true);
    try {
      let finalImageUrl = DEFAULT_IMAGE_URL;
      if (formData.image_url) {
        const isValid = await validateImageUrl(formData.image_url);
        if (isValid) {
          finalImageUrl = formData.image_url;
        }
      }

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('courses')
        .update({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          content_url: formData.content_url || null,
          content_text: formData.content_text || null,
          access_type: formData.access_type,
          difficulty: formData.difficulty || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          image_url: finalImageUrl,
        })
        .eq('id', course.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully!",
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update your course information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image_url">Course Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageValidating && (
              <p className="text-sm text-gray-500 mt-1">Validating image...</p>
            )}
          </div>

          <div>
            <Label>Content Type</Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData({ ...formData, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="text">Text/Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.content_type === 'text' ? (
            <div>
              <Label htmlFor="content_text">Content</Label>
              <Textarea
                id="content_text"
                value={formData.content_text}
                onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                rows={6}
                placeholder="Write your content here..."
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="content_url">Content URL</Label>
              <Input
                id="content_url"
                type="url"
                value={formData.content_url}
                onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                placeholder="https://example.com/your-content"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Access Type</Label>
              <Select
                value={formData.access_type}
                onValueChange={(value) => setFormData({ ...formData, access_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Free)</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="react, javascript, web development"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.content_type}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Updating...' : 'Update Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
