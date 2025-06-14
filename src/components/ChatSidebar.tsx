import React, { useState, useEffect } from 'react';
import { X, Send, Image, Mic, Users, Search, Plus, UserPlus, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useSupabase';
import { format } from 'date-fns';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const { trips } = useApp();
  const { user } = useAuth();
  const { chats, messages, isLoading, createChat, sendMessage, getUserChats, getChatMessages, addParticipants, subscribeToMessages } = useChat();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUserChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeChat) {
      getChatMessages(activeChat);
      
      // Subscribe to real-time messages
      const subscription = subscribeToMessages(activeChat);
      
      return () => {
        // Clean up subscription
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat || !user) return;

    try {
      await sendMessage(activeChat, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.chat_messages?.some((msg: any) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentChatMessages = activeChat ? messages[activeChat] || [] : [];

  // Get all collaborators from user's trips (potential friends)
  const getAllCollaborators = () => {
    const collaborators = new Set<string>();
    trips.forEach(trip => {
      trip.collaborators.forEach(collaboratorId => {
        if (collaboratorId !== user?.id) {
          collaborators.add(collaboratorId);
        }
      });
    });
    return Array.from(collaborators);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateChat(true)}
            className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="New Chat"
            aria-label="New Chat"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {!activeChat ? (
        <>
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0">
                      {chat.chat_type === 'group' ? (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.name || 'Direct Message'}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(chat.lastMessage.created_at), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Start chatting with your trip collaborators</p>
                <button
                  onClick={() => setShowCreateChat(true)}
                  className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setActiveChat(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Back"
              >
                ←
              </button>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {chats.find(c => c.id === activeChat)?.name || 'Direct Message'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {chats.find(c => c.id === activeChat)?.participantCount || 0} participants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowAddFriends(true)}
                className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Add Friends"
                aria-label="Add Friends"
              >
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button 
                className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Participants"
                aria-label="Participants"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : currentChatMessages.length > 0 ? (
              currentChatMessages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender?.name || 'User'}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Add image"
              >
                <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button 
                className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Voice message"
              >
                <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Friends Modal */}
      {showAddFriends && (
        <AddFriendsModal
          isOpen={showAddFriends}
          onClose={() => setShowAddFriends(false)}
          collaborators={getAllCollaborators()}
          currentChatId={activeChat}
          onAddParticipants={addParticipants}
        />
      )}

      {/* Create Chat Modal */}
      {showCreateChat && (
        <CreateChatModal
          isOpen={showCreateChat}
          onClose={() => setShowCreateChat(false)}
          collaborators={getAllCollaborators()}
          onCreateChat={createChat}
        />
      )}
    </div>
  );
};

// Add Friends Modal
interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: string[];
  currentChatId: string | null;
  onAddParticipants: (chatId: string, participantIds: string[]) => Promise<void>;
}

const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ 
  isOpen, 
  onClose, 
  collaborators,
  currentChatId,
  onAddParticipants
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const filteredCollaborators = collaborators.filter(collaboratorId =>
    `User ${collaborators.indexOf(collaboratorId) + 1}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriends = async () => {
    if (!currentChatId || selectedFriends.length === 0) return;
    
    setIsAdding(true);
    try {
      await onAddParticipants(currentChatId, selectedFriends);
      onClose();
    } catch (error) {
      console.error('Error adding participants:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Add Friends to Chat</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search collaborators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        {/* Friends List */}
        <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2 mb-4 sm:mb-6">
          {filteredCollaborators.map((collaboratorId, index) => (
            <div
              key={collaboratorId}
              className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFriends.includes(collaboratorId)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFriends(prev => [...prev, collaboratorId]);
                  } else {
                    setSelectedFriends(prev => prev.filter(id => id !== collaboratorId));
                  }
                }}
                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <img
                src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                alt="Collaborator"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  User {index + 1}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Trip collaborator
                </div>
              </div>
            </div>
          ))}
          
          {filteredCollaborators.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">No collaborators found</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAddFriends}
            disabled={selectedFriends.length === 0 || isAdding}
            className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isAdding ? 'Adding...' : `Add ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Chat Modal
interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: string[];
  onCreateChat: (chatType: 'direct' | 'group', participants: string[], name?: string, tripId?: string) => Promise<any>;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({ 
  isOpen, 
  onClose, 
  collaborators,
  onCreateChat
}) => {
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [chatName, setChatName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    if (selectedParticipants.length === 0 || (chatType === 'group' && !chatName)) return;
    
    setIsCreating(true);
    try {
      await onCreateChat(chatType, selectedParticipants, chatType === 'group' ? chatName : undefined);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Chat Type */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Chat Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="direct"
                checked={chatType === 'direct'}
                onChange={(e) => setChatType(e.target.value as 'direct')}
                className="mr-2"
              />
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">Direct Message</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="group"
                checked={chatType === 'group'}
                onChange={(e) => setChatType(e.target.value as 'group')}
                className="mr-2"
              />
              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">Group Chat</span>
            </label>
          </div>
        </div>

        {/* Group Name */}
        {chatType === 'group' && (
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        )}

        {/* Participants */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            {chatType === 'direct' ? 'Select Person' : 'Select Participants'}
          </label>
          <div className="max-h-36 sm:max-h-48 overflow-y-auto space-y-1 sm:space-y-2">
            {collaborators.map((collaboratorId, index) => (
              <div
                key={collaboratorId}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type={chatType === 'direct' ? 'radio' : 'checkbox'}
                  name={chatType === 'direct' ? 'participant' : undefined}
                  checked={selectedParticipants.includes(collaboratorId)}
                  onChange={(e) => {
                    if (chatType === 'direct') {
                      setSelectedParticipants([collaboratorId]);
                    } else {
                      if (e.target.checked) {
                        setSelectedParticipants(prev => [...prev, collaboratorId]);
                      } else {
                        setSelectedParticipants(prev => prev.filter(id => id !== collaboratorId));
                      }
                    }
                  }}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <img
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                  alt="Collaborator"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                />
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                  User {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={selectedParticipants.length === 0 || (chatType === 'group' && !chatName) || isCreating}
            className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isCreating ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;