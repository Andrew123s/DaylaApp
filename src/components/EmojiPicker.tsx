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
    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 sm:p-4 z-50 max-w-[calc(100vw-16px)]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Choose Emoji</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close emoji picker"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-1 sm:gap-2 max-w-64">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg hover:bg-gray-100 rounded transition-colors"
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;