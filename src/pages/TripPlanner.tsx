import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Share2, 
  Calendar, 
  Image, 
  Mic, 
  Palette,
  Link as LinkIcon,
  Trash2,
  Settings,
  Users,
  Copy,
  Bell,
  X,
  UserPlus,
  Eye,
  DollarSign,
  StickyNote as StickyNoteIcon,
  Leaf,
  Package
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import StickyNote from '../components/StickyNote';
import EmojiPicker from '../components/EmojiPicker';
import BudgetDashboard from '../components/BudgetDashboard';
import SustainabilityCalculator from '../components/SustainabilityCalculator';
import SmartPak from '../components/SmartPak';
import ScheduleModal from '../components/ScheduleModal';
import ShareModal from '../components/ShareModal';
import SettingsModal from '../components/SettingsModal';
import MediaUploadModal from '../components/MediaUploadModal';
import UserPresenceIndicator from '../components/UserPresenceIndicator';
import LiveNotification from '../components/LiveNotification';

const TripPlanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    trips, 
    addStickyNote, 
    activeTrip, 
    setActiveTrip, 
    updateUserActivity, 
    markNotificationAsRead, 
    updateTrip,
    addLiveNotification,
    dismissLiveNotification,
    updateUserRole,
    removeCollaborator,
    setNoteEditingUser
  } = useApp();
  const { user } = useAuth();
  const activeTabStorageKey = id ? `daylaActiveTab_${id}` : null;
  const [activeTab, setActiveTab] = useState<'planning' | 'budget' | 'sustainability' | 'packing'>(() => {
    if (!id) return 'planning';
    const saved = localStorage.getItem(`daylaActiveTab_${id}`);
    return (saved as 'planning' | 'budget' | 'sustainability' | 'packing') || 'planning';
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newNoteColor, setNewNoteColor] = useState('#FFE066');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // New modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'image' | 'voice' | 'link'>('image');
  
  const plannerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const trip = trips.find(t => t.id === id);

  useEffect(() => {
    if (trip) {
      setActiveTrip(trip);
      setInviteLink(`${window.location.origin}/invite/${trip.inviteCode}`);
      
      if (user) {
        updateUserActivity(trip.id, user.id, 'viewing board');
      }
    }
    return () => setActiveTrip(null);
  }, [trip, setActiveTrip, user, updateUserActivity]);

  useEffect(() => {
    if (trip && user) {
      const interval = setInterval(() => {
        updateUserActivity(trip.id, user.id, 'active on board');
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [trip, user, updateUserActivity]);

  // Persist active tab per trip so it survives navigation
  useEffect(() => {
    if (activeTabStorageKey) {
      localStorage.setItem(activeTabStorageKey, activeTab);
    }
  }, [activeTab, activeTabStorageKey]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  if (!trip) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <p className="text-gray-600">The requested trip could not be found.</p>
        </div>
      </div>
    );
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === plannerRef.current && user && activeTab === 'planning') {
      const rect = plannerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      addStickyNote(trip.id, {
        content: 'New note',
        x,
        y,
        color: newNoteColor,
        emoji: selectedEmoji,
        lastEditedBy: user.name
      });

      updateUserActivity(trip.id, user.id, 'adding note');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const handleMediaUpload = (data: any) => {
    console.log('Media uploaded:', data);
    // In a real app, you would handle the uploaded media here
    // For example, attach it to a sticky note or save it to the trip
  };

  const handleTripUpdate = (updates: any) => {
    updateTrip(trip.id, updates);
  };

  const handleDeleteTrip = (tripId: string) => {
    // In a real app, you would show a confirmation and then delete
    console.log('Deleting trip:', tripId);
    navigate('/');
  };

  const handleRoleChange = (userId: string, role: 'viewer' | 'editor') => {
    updateUserRole(trip.id, userId, role);
    
    const user = trip.activeUsers?.find(u => u.userId === userId);
    if (user) {
      addLiveNotification(trip.id, {
        type: 'user_editing',
        message: `role changed to ${role}`,
        userName: user.userName,
        userAvatar: user.userAvatar,
        autoHide: true
      });
    }
  };

  const handleRemoveUser = (userId: string) => {
    removeCollaborator(trip.id, userId);
  };

  const handleDismissNotification = (notificationId: string) => {
    dismissLiveNotification(trip.id, notificationId);
  };

  const unreadNotifications = trip.notifications?.filter(n => !n.read) || [];
  const activeUsers = trip.activeUsers?.filter(u => u.isActive && u.userId !== user?.id) || [];
  const isOwner = trip.collaborators[0] === user?.id; // First collaborator is owner
  const liveNotifications = trip.liveNotifications || [];

  const colors = [
    '#FFE066', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ];

  const tabs = [
    { id: 'planning', name: 'Planning Board', icon: StickyNoteIcon },
    { id: 'budget', name: 'Budget', icon: DollarSign },
    { id: 'sustainability', name: 'Sus Cal', icon: Leaf },
    { id: 'packing', name: 'Smart Pak', icon: Package }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Live Notifications */}
      <LiveNotification 
        notifications={liveNotifications}
        onDismiss={handleDismissNotification}
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: trip.color }}
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">{trip.title}</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">{trip.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* User Presence Indicator */}
            <UserPresenceIndicator
              activeUsers={[...activeUsers, ...(user ? [{
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                lastActivity: new Date(),
                isActive: true,
                currentAction: 'viewing board',
                role: isOwner ? 'owner' as const : 'editor' as const
              }] : [])]}
              currentUserId={user?.id || ''}
              isOwner={isOwner}
              onRoleChange={handleRoleChange}
              onRemoveUser={handleRemoveUser}
            />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 sm:p-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {trip.notifications && trip.notifications.length > 0 ? (
                      trip.notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(trip.id, notification.id)}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Invite Friends - Mobile */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Invite Friends"
            >
              <UserPlus className="h-4 w-4" />
            </button>

            {/* Schedule Button - Mobile */}
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="p-1 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Schedule"
            >
              <Calendar className="h-4 w-4" />
            </button>

            {/* Share Button - Mobile */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-1 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-1 sm:p-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-thin scroll-smooth snap-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'planning' | 'budget' | 'sustainability' | 'packing')}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap snap-start min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Planning Tools */}
        {activeTab === 'planning' && (
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Color:</span>
                <div className="flex space-x-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewNoteColor(color)}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200 ${
                        newNoteColor === color
                          ? 'border-gray-400 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 relative">
                <button
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px]"
                >
                  <span className="text-base sm:text-lg">{selectedEmoji || '😊'}</span>
                  <span className="text-xs sm:text-sm">Emoji</span>
                </button>
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute top-full left-0 z-50 mt-1"
                  >
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        setSelectedEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Image Button */}
              <button 
                onClick={() => {
                  setMediaModalType('image');
                  setShowMediaModal(true);
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px]"
              >
                <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Image</span>
              </button>

              {/* Voice Button */}
              <button 
                onClick={() => {
                  setMediaModalType('voice');
                  setShowMediaModal(true);
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px]"
              >
                <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Voice</span>
              </button>

              {/* Link Button */}
              <button 
                onClick={() => {
                  setMediaModalType('link');
                  setShowMediaModal(true);
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 transition-colors min-h-[40px]"
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Link</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Users Status */}
        {activeUsers.length > 0 && (
          <div className="mt-2 sm:mt-3 flex items-center space-x-4 overflow-x-auto scrollbar-thin pb-1">
            {activeUsers.map((activeUser) => (
              <div key={activeUser.userId} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{activeUser.userName} is {activeUser.currentAction || 'using board'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'planning' ? (
          <div
            ref={plannerRef}
            onClick={handleCanvasClick}
            className="h-full relative bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 overflow-hidden cursor-crosshair"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20px 20px, rgba(255,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          >
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Sticky Notes */}
            {trip.notes.map((note) => {
              // Find users currently editing this note
              const editingUsers = note.editingUsers?.map(userId => {
                const activeUser = trip.activeUsers?.find(u => u.userId === userId);
                return activeUser ? {
                  userId: activeUser.userId,
                  userName: activeUser.userName,
                  userAvatar: activeUser.userAvatar
                } : null;
              }).filter(Boolean) || [];

              return (
                <StickyNote
                  key={note.id}
                  note={note}
                  tripId={trip.id}
                  editingUsers={editingUsers as any}
                />
              );
            })}

            {/* Instructions */}
            {trip.notes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 shadow-lg max-w-xs sm:max-w-md">
                  <Plus className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Start Planning</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Click anywhere on the canvas to add sticky notes, ideas, and plans for your trip.
                    Use the toolbar above to customize colors, add emojis, and attach media.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'budget' ? (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <BudgetDashboard tripId={trip.id} />
          </div>
        ) : activeTab === 'sustainability' ? (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <SustainabilityCalculator tripId={trip.id} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <SmartPak tripId={trip.id} />
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Invite Friends</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share this link with your friends
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Friends will need to sign up or log in to collaborate on this trip.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Current Collaborators</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {trip.collaborators.map((collaboratorId, index) => (
                    <div key={collaboratorId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <img
                        src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                        alt="Collaborator"
                        className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                      />
                      <span className="text-xs sm:text-sm text-gray-900">
                        {index === 0 ? user?.name : `Collaborator ${index + 1}`}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Owner</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={copyInviteLink}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        collaborators={trip.collaborators}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tripTitle={trip.title}
        tripDescription={trip.description}
        inviteCode={trip.inviteCode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        tripId={trip.id}
        tripTitle={trip.title}
        tripColor={trip.color}
        isPublic={trip.isPublic}
        onUpdateTrip={handleTripUpdate}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        type={mediaModalType}
        onUpload={handleMediaUpload}
      />
    </div>
  );
};

export default TripPlanner;