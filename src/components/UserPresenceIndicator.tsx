import React from 'react';
import { Eye, Edit3, MousePointer, Users, Crown, Shield, UserCheck } from 'lucide-react';

interface UserPresenceIndicatorProps {
  activeUsers: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
    lastActivity: Date;
    isActive: boolean;
    currentAction?: string;
    role?: 'owner' | 'editor' | 'viewer';
  }>;
  currentUserId: string;
  isOwner: boolean;
  onRoleChange?: (userId: string, role: 'viewer' | 'editor') => void;
  onRemoveUser?: (userId: string) => void;
}

const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  activeUsers,
  currentUserId,
  isOwner,
  onRoleChange,
  onRemoveUser
}) => {
  const [showUserList, setShowUserList] = React.useState(false);

  const getActionIcon = (action?: string) => {
    if (!action) return Eye;
    if (action.includes('editing')) return Edit3;
    if (action.includes('moving')) return MousePointer;
    return Eye;
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'editor': return Edit3;
      case 'viewer': return Eye;
      default: return UserCheck;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-600 bg-yellow-100';
      case 'editor': return 'text-blue-600 bg-blue-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="relative">
      {/* Active Users Display */}
      <div 
        className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/90 transition-colors"
        onClick={() => setShowUserList(!showUserList)}
      >
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 4).map((user) => {
            const ActionIcon = getActionIcon(user.currentAction);
            return (
              <div
                key={user.userId}
                className="relative"
                title={`${user.userName} - ${user.currentAction || 'viewing board'}`}
              >
                <img
                  src={user.userAvatar || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'}
                  alt={user.userName}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <ActionIcon className="h-2 w-2 text-white" />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {activeUsers.length} active
          </span>
        </div>
      </div>

      {/* User List Dropdown - Fixed z-index and positioning */}
      {showUserList && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[60]">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Active Collaborators</h3>
            <p className="text-sm text-gray-600">Manage roles and permissions</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {activeUsers.map((user) => {
              const ActionIcon = getActionIcon(user.currentAction);
              const RoleIcon = getRoleIcon(user.role);
              const isCurrentUser = user.userId === currentUserId;
              
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.userAvatar || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'}
                        alt={user.userName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {user.userName}
                          {isCurrentUser && <span className="text-gray-500"> (You)</span>}
                        </span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon className="h-3 w-3" />
                          <span className="capitalize">{user.role || 'member'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ActionIcon className="h-3 w-3" />
                        <span>{user.currentAction || 'viewing board'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role Management (Owner Only) */}
                  {isOwner && !isCurrentUser && user.role !== 'owner' && (
                    <div className="flex items-center space-x-1">
                      <select
                        value={user.role || 'viewer'}
                        onChange={(e) => onRoleChange?.(user.userId, e.target.value as 'viewer' | 'editor')}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      
                      <button
                        onClick={() => onRemoveUser?.(user.userId)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove user"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPresenceIndicator;