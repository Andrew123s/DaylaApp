import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle,
  Trash2,
  AlertTriangle,
  MessageCircle,
  Image,
  FileText,
  Users,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useContentModeration } from '../../hooks/useContentModeration';

const ContentModeration: React.FC = () => {
  const {
    flaggedContent,
    moderationStats,
    isLoading,
    searchContent,
    approveContent,
    rejectContent,
    deleteContent,
    banUser,
    getContentDetails
  } = useContentModeration();

  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContentItem, setSelectedContentItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contentPerPage] = useState(20);

  useEffect(() => {
    searchContent(searchQuery, contentTypeFilter, statusFilter, currentPage, contentPerPage);
  }, [searchQuery, contentTypeFilter, statusFilter, currentPage]);

  const handleContentAction = async (contentId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'approve') {
        await approveContent(contentId);
      } else if (action === 'reject') {
        await rejectContent(contentId);
      } else {
        await deleteContent(contentId);
      }
      searchContent(searchQuery, contentTypeFilter, statusFilter, currentPage, contentPerPage);
    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    for (const contentId of selectedContent) {
      await handleContentAction(contentId, action);
    }
    setSelectedContent([]);
  };

  const handleViewContent = async (contentId: string) => {
    const contentDetails = await getContentDetails(contentId);
    setSelectedContentItem(contentDetails);
    setShowContentModal(true);
  };

  const totalPages = Math.ceil((moderationStats?.totalFlagged || 0) / contentPerPage);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'comment': return MessageCircle;
      case 'image': return Image;
      case 'trip': return Users;
      default: return FileText;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">
            Review and moderate flagged content across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {moderationStats?.totalFlagged || 0}
              </p>
              <p className="text-sm text-gray-600">Flagged Content</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {moderationStats?.pendingReview || 0}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {moderationStats?.approved || 0}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Ban className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {moderationStats?.rejected || 0}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="image">Images</option>
              <option value="trip">Trips</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>

          {selectedContent.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedContent.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContent.length === flaggedContent.length && flaggedContent.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContent(flaggedContent.map(c => c.id));
                      } else {
                        setSelectedContent([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading content...</span>
                    </div>
                  </td>
                </tr>
              ) : flaggedContent.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No flagged content found
                  </td>
                </tr>
              ) : (
                flaggedContent.map((content) => {
                  const TypeIcon = getContentTypeIcon(content.content_type);
                  
                  return (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(content.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContent([...selectedContent, content.id]);
                            } else {
                              setSelectedContent(selectedContent.filter(id => id !== content.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <TypeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {content.title || 'Untitled'}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {content.content_preview}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={content.author?.avatar_url || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2'}
                            alt={content.author?.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {content.author?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {content.author?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                          {content.content_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Flag className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {content.flag_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(content.severity)}`}>
                          {content.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          content.moderation_status === 'approved' ? 'bg-green-100 text-green-800' :
                          content.moderation_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {content.moderation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewContent(content.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {content.moderation_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleContentAction(content.id, 'approve')}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleContentAction(content.id, 'reject')}
                                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                title="Reject"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleContentAction(content.id, 'delete')}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * contentPerPage + 1} to {Math.min(currentPage * contentPerPage, moderationStats?.totalFlagged || 0)} of {moderationStats?.totalFlagged || 0} items
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Details Modal */}
      {showContentModal && selectedContentItem && (
        <ContentDetailsModal
          content={selectedContentItem}
          onClose={() => setShowContentModal(false)}
          onContentUpdate={() => {
            searchContent(searchQuery, contentTypeFilter, statusFilter, currentPage, contentPerPage);
            setShowContentModal(false);
          }}
          onApprove={() => handleContentAction(selectedContentItem.id, 'approve')}
          onReject={() => handleContentAction(selectedContentItem.id, 'reject')}
          onDelete={() => handleContentAction(selectedContentItem.id, 'delete')}
          onBanUser={() => banUser(selectedContentItem.author?.id)}
        />
      )}
    </div>
  );
};

// Content Details Modal Component
interface ContentDetailsModalProps {
  content: any;
  onClose: () => void;
  onContentUpdate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onBanUser: () => void;
}

const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({ 
  content, 
  onClose, 
  onContentUpdate,
  onApprove,
  onReject,
  onDelete,
  onBanUser
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Content Review</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize font-medium">{content.content_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(content.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flags:</span>
                    <span className="font-medium">{content.flag_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      content.severity === 'high' ? 'bg-red-100 text-red-800' :
                      content.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {content.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Content</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{content.full_content}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Author Information</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={content.author?.avatar_url || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2'}
                    alt={content.author?.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{content.author?.name}</p>
                    <p className="text-sm text-gray-600">{content.author?.email}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Join Date:</span>
                    <span>{new Date(content.author?.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Posts:</span>
                    <span>{content.author?.post_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Previous Flags:</span>
                    <span>{content.author?.flag_count || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Flag Reasons</h4>
                <div className="space-y-2">
                  {content.flag_reasons?.map((reason: any, index: number) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-red-800">{reason.reason}</span>
                        <span className="text-xs text-red-600">{reason.count} reports</span>
                      </div>
                      {reason.description && (
                        <p className="text-sm text-red-700 mt-1">{reason.description}</p>
                      )}
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No specific reasons provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            {content.moderation_status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    onApprove();
                    onContentUpdate();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Content
                </button>
                <button
                  onClick={() => {
                    onReject();
                    onContentUpdate();
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Reject Content
                </button>
              </>
            )}
            
            <button
              onClick={() => {
                onDelete();
                onContentUpdate();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Content
            </button>
            
            <button
              onClick={() => {
                onBanUser();
                onContentUpdate();
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Ban User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;