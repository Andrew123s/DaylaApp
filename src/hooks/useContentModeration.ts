import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [moderationStats, setModerationStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchContent = useCallback(async (
    query: string,
    contentType: string,
    status: string,
    page: number,
    perPage: number
  ) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      // For demo purposes, we'll simulate the data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock flagged content
      const contentTypes = ['post', 'comment', 'image', 'trip'];
      const severities = ['high', 'medium', 'low'];
      const statuses = ['pending', 'approved', 'rejected'];
      
      const mockContent = Array.from({ length: 50 }, (_, i) => {
        const type = contentTypes[i % contentTypes.length];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        return {
          id: `content-${i + 1}`,
          content_type: type,
          title: type === 'post' ? `${['Amazing', 'Beautiful', 'Wonderful', 'Terrible'][i % 4]} ${['Paris', 'Tokyo', 'New York', 'London'][i % 4]}` : undefined,
          content_preview: `This is a preview of the ${type} content that was flagged...`,
          full_content: `This is the full content of the ${type} that was flagged. It contains potentially problematic material that needs to be reviewed by a moderator.`,
          author: {
            id: `user-${i % 10 + 1}`,
            name: `User ${i % 10 + 1}`,
            email: `user${i % 10 + 1}@example.com`,
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            post_count: Math.floor(Math.random() * 50),
            flag_count: Math.floor(Math.random() * 5)
          },
          flag_count: Math.floor(Math.random() * 10) + 1,
          severity: severities[Math.floor(Math.random() * severities.length)],
          moderation_status: statuses[Math.floor(Math.random() * (status === 'all' ? 3 : 1))],
          created_at: date.toISOString(),
          flag_reasons: [
            {
              reason: 'Inappropriate content',
              count: Math.floor(Math.random() * 5) + 1,
              description: 'Contains offensive language or imagery'
            },
            {
              reason: 'Spam',
              count: Math.floor(Math.random() * 3),
              description: 'Promotional or irrelevant content'
            }
          ].filter(r => r.count > 0)
        };
      });
      
      // Filter content based on query, type, and status
      let filteredContent = mockContent;
      
      if (query) {
        filteredContent = filteredContent.filter(content => 
          (content.title && content.title.toLowerCase().includes(query.toLowerCase())) || 
          content.content_preview.toLowerCase().includes(query.toLowerCase()) ||
          content.full_content.toLowerCase().includes(query.toLowerCase()) ||
          content.author.name.toLowerCase().includes(query.toLowerCase()) ||
          content.author.email.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (contentType !== 'all') {
        filteredContent = filteredContent.filter(content => content.content_type === contentType);
      }
      
      if (status !== 'all') {
        filteredContent = filteredContent.filter(content => content.moderation_status === status);
      }
      
      // Paginate results
      const start = (page - 1) * perPage;
      const paginatedContent = filteredContent.slice(start, start + perPage);
      
      // Calculate moderation stats
      const totalFlagged = filteredContent.length;
      const pendingReview = filteredContent.filter(c => c.moderation_status === 'pending').length;
      const approved = filteredContent.filter(c => c.moderation_status === 'approved').length;
      const rejected = filteredContent.filter(c => c.moderation_status === 'rejected').length;
      
      setFlaggedContent(paginatedContent);
      setModerationStats({
        totalFlagged,
        pendingReview,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Error searching flagged content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveContent = useCallback(async (contentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Approving content ${contentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setFlaggedContent(prevContent => 
        prevContent.map(content => 
          content.id === contentId ? { ...content, moderation_status: 'approved' } : content
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error approving content:', error);
      return false;
    }
  }, []);

  const rejectContent = useCallback(async (contentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Rejecting content ${contentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setFlaggedContent(prevContent => 
        prevContent.map(content => 
          content.id === contentId ? { ...content, moderation_status: 'rejected' } : content
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error rejecting content:', error);
      return false;
    }
  }, []);

  const deleteContent = useCallback(async (contentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Deleting content ${contentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setFlaggedContent(prevContent => prevContent.filter(content => content.id !== contentId));
      
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }, []);

  const banUser = useCallback(async (userId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Banning user ${userId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      return false;
    }
  }, []);

  const getContentDetails = useCallback(async (contentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Getting details for content ${contentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find content in local state
      const content = flaggedContent.find(c => c.id === contentId);
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      return content;
    } catch (error) {
      console.error('Error getting content details:', error);
      return null;
    }
  }, [flaggedContent]);

  return {
    flaggedContent,
    moderationStats,
    isLoading,
    searchContent,
    approveContent,
    rejectContent,
    deleteContent,
    banUser,
    getContentDetails
  };
};