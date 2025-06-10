import React from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojis = [
  '😊', '😍', '🤔', '😎', '🥳', '😴', '🤗', '😱',
  '🏔️', '🏖️', '🏕️', '🗺️', '✈️', '🚗', '🚢', '🚂',
  '📍', '🎒', '📷', '🎪', '🎨', '🍕', '🍔', '🍰',
  '🌟', '⭐', '💫', '✨', '🔥', '💎', '🎯', '🎪',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Choose Emoji</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-2 max-w-64">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;