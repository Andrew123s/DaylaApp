import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Link as LinkIcon, Image, Mic, Edit3, Eye } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

interface StickyNoteProps {
  note: any;
  tripId: string;
  editingUsers?: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
  }>;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, tripId, editingUsers = [] }) => {
  const { updateStickyNote, deleteStickyNote, updateUserActivity } = useApp();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [position, setPosition] = useState({ x: note.x, y: note.y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBeingEdited = editingUsers.length > 0;
  const currentEditor = editingUsers[0]; // Show primary editor

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });

    // Update user activity
    if (user) {
      updateUserActivity(tripId, user.id, `moving note: "${note.content.substring(0, 20)}..."`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });

    // Update user activity
    if (user) {
      updateUserActivity(tripId, user.id, `moving note: "${note.content.substring(0, 20)}..."`);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      updateStickyNote(tripId, note.id, { 
        x: position.x,
        y: position.y,
        lastEditedBy: user?.name 
      });
      
      if (user) {
        updateUserActivity(tripId, user.id, 'viewing board');
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      updateStickyNote(tripId, note.id, { 
        x: position.x,
        y: position.y,
        lastEditedBy: user?.name 
      });
      
      if (user) {
        updateUserActivity(tripId, user.id, 'viewing board');
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    // Auto-resize textarea when editing
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    if (user) {
      updateUserActivity(tripId, user.id, `editing note: "${note.content.substring(0, 20)}..."`);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (user) {
      updateUserActivity(tripId, user.id, `editing note: "${e.target.value.substring(0, 20)}..."`);
    }
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== note.content) {
      updateStickyNote(tripId, note.id, { 
        content,
        lastEditedBy: user?.name 
      });
    }
    if (user) {
      updateUserActivity(tripId, user.id, 'viewing board');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleDelete = () => {
    deleteStickyNote(tripId, note.id);
    if (user) {
      updateUserActivity(tripId, user.id, 'deleted note');
    }
  };

  return (
    <div
      ref={noteRef}
      className={`absolute group select-none transition-all duration-200 touch-manipulation ${
        isDragging ? 'z-50 rotate-1 scale-105' : 'z-10'
      } ${isBeingEdited ? 'ring-2 ring-green-400 ring-opacity-75' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'rotate(-1deg)',
        maxWidth: '90vw'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div
        className={`relative p-3 sm:p-4 rounded-lg shadow-lg border-l-4 min-w-[180px] sm:min-w-48 max-w-64 cursor-move hover:shadow-xl transition-all duration-200 ${
          isBeingEdited ? 'border-green-400' : ''
        }`}
        style={{
          backgroundColor: note.color,
          borderLeftColor: isBeingEdited ? '#4ade80' : (
            note.color === '#FFE066' ? '#F1C40F' : 
            note.color === '#FF6B6B' ? '#E74C3C' :
            note.color === '#4ECDC4' ? '#16A085' : '#3498DB'
          )
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        {/* Emoji */}
        {note.emoji && (
          <div className="absolute -top-2 -right-2 text-base sm:text-xl bg-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-sm">
            {note.emoji}
          </div>
        )}

        {/* Live Editing Indicator */}
        {isBeingEdited && currentEditor && (
          <div className="absolute -top-3 -left-3 flex items-center space-x-1 bg-green-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
            <img
              src={currentEditor.userAvatar || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=20&h=20&dpr=2'}
              alt={currentEditor.userName}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
            />
            <Edit3 className="h-2 w-2 sm:h-3 sm:w-3" />
            <span className="truncate max-w-[80px] sm:max-w-none">{currentEditor.userName}</span>
          </div>
        )}

        {/* Last edited indicator */}
        {note.lastEditedBy && (isHovered || isBeingEdited) && (
          <div className="absolute -top-1 -left-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {note.lastEditedBy}
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-500"
            rows={3}
            autoFocus
            style={{ color: note.color === '#FFE066' ? '#2C3E50' : '#2C3E50' }}
          />
        ) : (
          <p 
            className="text-xs sm:text-sm font-medium leading-snug whitespace-pre-wrap break-words"
            style={{ color: note.color === '#FFE066' ? '#2C3E50' : '#2C3E50' }}
          >
            {note.content}
          </p>
        )}

        {/* Tools */}
        <div className={`transition-opacity duration-200 mt-2 sm:mt-3 flex items-center justify-between ${
          isHovered || isBeingEdited ? 'opacity-100' : 'opacity-0'
        } group-hover:opacity-100`}>
          <div className="flex items-center space-x-1">
            {note.images && note.images.length > 0 && (
              <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                <Image className="h-3 w-3" />
              </button>
            )}
            {note.voiceNote && (
              <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                <Mic className="h-3 w-3" />
              </button>
            )}
            {note.linkedTo && note.linkedTo.length > 0 && (
              <button className="p-1 text-gray-600 hover:text-purple-600 transition-colors">
                <LinkIcon className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                title="Edit note"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Delete note"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Links visualization */}
        {note.linkedTo && note.linkedTo.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* This would render connection lines to linked notes */}
          </div>
        )}

        {/* Live collaboration border effect */}
        {isBeingEdited && (
          <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default StickyNote;