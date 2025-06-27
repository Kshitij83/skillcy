import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UploadCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_IMAGE_URL = 'https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg';

export const UploadCourseModal: React.FC<UploadCourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageValidating, setImageValidating] = useState(false);
  const [contentUrlValid, setContentUrlValid] = useState(true);
  const [contentUrlValidating, setContentUrlValidating] = useState(false);
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

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return true; // Empty URL is valid (we'll use default)
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 5 seconds
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

  // Validate content URL (for video/pdf)
  const handleContentUrlChange = (url: string) => {
    setFormData({ ...formData, content_url: url });
    if (!url) {
      setContentUrlValid(true);
      return;
    }
    setContentUrlValidating(true);
    // Simple HEAD request to check if URL is reachable
    fetch(url, { method: "HEAD" })
      .then((res) => {
        setContentUrlValid(res.ok);
        if (!res.ok) {
          toast({
            title: "Invalid Content URL",
            description: "The content URL provided is not accessible. Please provide a valid URL.",
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        setContentUrlValid(false);
        toast({
          title: "Invalid Content URL",
          description: "The content URL provided is not accessible. Please provide a valid URL.",
          variant: "destructive",
        });
      })
      .finally(() => setContentUrlValidating(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Required fields check
    if (
      !formData.title ||
      !formData.description ||
      !formData.content_type ||
      (formData.content_type === "text" && !formData.content_text) ||
      ((formData.content_type === "video" || formData.content_type === "pdf") && !formData.content_url) ||
      !formData.access_type ||
      !formData.difficulty ||
      !formData.tags
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    // Content URL validation for video/pdf
    if (
      (formData.content_type === "video" || formData.content_type === "pdf") &&
      (!formData.content_url || !contentUrlValid)
    ) {
      toast({
        title: "Invalid Content URL",
        description: "Please provide a valid and reachable content URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Validate image URL if provided
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
        .insert([{
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          content_url: formData.content_url || null,
          content_text: formData.content_text || null,
          uploader_id: user.id,
          access_type: formData.access_type,
          difficulty: formData.difficulty || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          image_url: finalImageUrl,
          uploader_email: user.email,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course uploaded successfully!",
      });

      setFormData({
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

      onSuccess();
    } catch (error) {
      console.error('Error uploading course:', error);
      toast({
        title: "Error",
        description: "Failed to upload course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Course</DialogTitle>
          <DialogDescription>
            Share your knowledge with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
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
            <p className="text-sm text-gray-500 mt-1">
              If not provided or invalid, a default image will be used
            </p>
          </div>

          <div>
            <Label>
              Content Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData({ ...formData, content_type: value })}
              required
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

          {formData.content_type === "text" ? (
            <div>
              <Label htmlFor="content_text">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content_text"
                value={formData.content_text}
                onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                rows={6}
                placeholder="Write your content here..."
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="content_url">
                Content URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="content_url"
                type="url"
                value={formData.content_url}
                onChange={(e) => {
                  handleContentUrlChange(e.target.value);
                }}
                placeholder="https://example.com/your-content"
                required
              />
              {contentUrlValidating && (
                <p className="text-sm text-gray-500 mt-1">Validating content URL...</p>
              )}
              {!contentUrlValid && (
                <p className="text-sm text-red-500 mt-1">Content URL is not reachable or invalid. Please provide a valid URL.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Access Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.access_type}
                onValueChange={(value) => setFormData({ ...formData, access_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Free)</SelectItem>
                  <SelectItem value="premium" disabled>
                    Premium (only for premium+ users)
                  </SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                required
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
            <Label htmlFor="tags">
              Tags (comma-separated) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="react, javascript, web development"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.title ||
                !formData.description ||
                !formData.content_type ||
                (formData.content_type === "text" && !formData.content_text) ||
                ((formData.content_type === "video" || formData.content_type === "pdf") &&
                  (!formData.content_url || !contentUrlValid || contentUrlValidating)) ||
                !formData.access_type ||
                !formData.difficulty ||
                !formData.tags
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Uploading..." : "Upload Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
