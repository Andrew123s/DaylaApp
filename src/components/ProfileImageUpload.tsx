import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Crop, RotateCw, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  isOpen, 
  onClose, 
  currentImage 
}) => {
  const { uploadProfileImage, updateProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropper(true);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadProfileImage(selectedFile);
      updateProfile({ avatar: imageUrl });
      onClose();
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Profile image updated successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Update Profile Picture
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Image */}
        {currentImage && !previewUrl && (
          <div className="text-center mb-6">
            <img
              src={currentImage}
              alt="Current profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200 dark:border-gray-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Current profile picture</p>
          </div>
        )}

        {/* Preview with Cropper */}
        {previewUrl && showCropper && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-64 h-64 object-cover rounded-lg"
                />
                {/* Simple crop overlay */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded">
                    <Crop className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mb-4">
              <button
                onClick={() => setShowCropper(false)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCw className="h-4 w-4" />
                <span>Adjust</span>
              </button>
              
              <button
                onClick={() => setShowCropper(false)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Looks Good</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!previewUrl && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drop an image here or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports JPG, PNG, GIF up to 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Camera Option */}
        <div className="mt-4">
          <button
            onClick={() => {
              // In a real app, this would open camera
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Camera functionality would go here
                console.log('Opening camera...');
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span>Take Photo</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Update Picture'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;