import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar,
  Image as ImageIcon,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

const Community: React.FC = () => {
  const { forumPosts, createForumPost, addForumComment } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter posts based on user preferences
  const getPersonalizedPosts = () => {
    if (!user?.preferences) return forumPosts;

    return forumPosts.filter(post => {
      // Show posts that match user's interests
      const matchesInterests = user.preferences!.interests.some(interest => 
        post.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase().split(' ')[0]))
      );

      // Show posts from destinations user is interested in
      const matchesDestinations = user.preferences!.destinations.some(dest =>
        post.location.toLowerCase().includes(dest.toLowerCase()) ||
        post.title.toLowerCase().includes(dest.toLowerCase()) ||
        post.content.toLowerCase().includes(dest.toLowerCase())
      );

      return matchesInterests || matchesDestinations;
    });
  };

  const personalizedPosts = getPersonalizedPosts();
  const hasPersonalizedContent = personalizedPosts.length > 0 && user?.preferences;

  const filteredPosts = (hasPersonalizedContent ? personalizedPosts : forumPosts).filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && post.tags.some(tag => 
      tag.toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Travel Community</span>
              {hasPersonalizedContent && <Sparkles className="h-6 w-6 text-yellow-500" />}
            </h1>
            <p className="text-gray-600 mt-1">
              {hasPersonalizedContent 
                ? 'Discover experiences tailored to your interests'
                : 'Share your adventures and discover new places'
              }
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Share Experience</span>
          </button>
        </div>

        {/* Personalized Content Banner */}
        {hasPersonalizedContent && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Personalized for You</h3>
            </div>
            <p className="text-blue-800 text-sm">
              We're showing you posts about {user?.preferences?.interests.slice(0, 3).join(', ')} 
              {user?.preferences?.destinations.length > 0 && 
                ` and destinations like ${user.preferences.destinations.slice(0, 2).join(', ')}`
              }.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Posts</option>
              <option value="hiking">Hiking</option>
              <option value="photography">Photography</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
            </select>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-200">
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{post.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments.length}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{format(post.timestamp, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{comment.authorName}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="mt-4 flex space-x-3">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Write a comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share your travel experience!'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Share Your Adventure
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createForumPost}
        />
      )}
    </div>
  );
};

interface CreatePostModalProps {
  onClose: () => void;
  onCreate: (post: any) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    onCreate({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      title: formData.title,
      content: formData.content,
      location: formData.location,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      images: []
    });

    setFormData({ title: '', content: '', location: '', tags: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give your post a catchy title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Where did this adventure take place?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Story
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your experience, tips, and what made this place special..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hiking, photography, culture, food (separate with commas)"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Add photos to your post</p>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Choose files or drag and drop
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Share Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Community;