import React, { useState, useRef } from 'react';
import { X, Upload, Image, Camera, Mic, Video, File, Check, AlertCircle } from 'lucide-react';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'voice' | 'link';
  onUpload: (data: any) => void;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  onUpload 
}) => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const simulateUpload = async (files: File[]) => {
    setUploadState('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate success
    setUploadState('success');
    
    // Return mock URLs for the uploaded files
    const uploadedFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // In real app, this would be the server URL
      uploadedAt: new Date()
    }));

    setTimeout(() => {
      onUpload({ files: uploadedFiles });
      onClose();
    }, 1000);
  };

  const handleUpload = () => {
    if (type === 'link') {
      if (!linkUrl) return;
      
      onUpload({
        url: linkUrl,
        title: linkTitle || linkUrl,
        type: 'link'
      });
      onClose();
    } else {
      if (selectedFiles.length === 0) return;
      simulateUpload(selectedFiles);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        setSelectedFiles([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setUploadState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'image': return 'Upload Images';
      case 'voice': return 'Record Voice Note';
      case 'link': return 'Add Link';
      default: return 'Upload Media';
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case 'image': return Image;
      case 'voice': return Mic;
      case 'link': return File;
      default: return Upload;
    }
  };

  const Icon = getModalIcon();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'link' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : type === 'voice' ? (
            <div className="space-y-6">
              {/* Recording Interface */}
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                }`}>
                  <Mic className={`h-12 w-12 ${isRecording ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                
                {isRecording ? (
                  <div>
                    <div className="text-2xl font-mono font-bold text-red-600 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Recording in progress...</p>
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Stop Recording
                    </button>
                  </div>
                ) : selectedFiles.length > 0 ? (
                  <div>
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Recording ready: {selectedFiles[0].name}
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Record Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Click to start recording your voice note
                    </p>
                    <button
                      onClick={startRecording}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFiles.length > 0 ? (
                  <div>
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFiles.length} file(s) selected
                    </p>
                    <div className="mt-2 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <p key={index} className="text-xs text-gray-500">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={type === 'image' ? 'image/*' : '*/*'}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Camera Option for Images */}
              {type === 'image' && (
                <button
                  onClick={() => {
                    // In a real app, this would open camera
                    console.log('Opening camera...');
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                </button>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadState === 'uploading' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {uploadState === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Upload successful!</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {uploadState === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800">Upload failed. Please try again.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadState !== 'uploading' && uploadState !== 'success' && (
          <div className="flex space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={
                (type === 'link' && !linkUrl) ||
                (type !== 'link' && selectedFiles.length === 0)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {type === 'link' ? 'Add Link' : 'Upload'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploadModal;