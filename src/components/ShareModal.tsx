import React, { useState } from 'react';
import { X, Share2, Copy, Mail, MessageCircle, Download, QrCode, Link as LinkIcon, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
  tripDescription: string;
  inviteCode: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  tripTitle, 
  tripDescription, 
  inviteCode 
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'social' | 'export'>('link');
  const [copied, setCopied] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
  const shareText = `Join me on my trip to ${tripTitle}! ${tripDescription}`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my trip: ${tripTitle}`);
    const body = encodeURIComponent(`Hi!\n\nI'd love for you to join my trip planning for ${tripTitle}.\n\n${tripDescription}\n\nClick here to join: ${inviteLink}\n\nLooking forward to planning this adventure together!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Join my trip planning for ${tripTitle}! ${inviteLink}`);
    window.open(`sms:?body=${message}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`Join my trip planning for ${tripTitle}! ${tripDescription} ${inviteLink}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Planning an amazing trip to ${tripTitle}! Join me: ${inviteLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`);
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    // Simulate QR code generation
    setTimeout(() => {
      setIsGeneratingQR(false);
    }, 1000);
  };

  const exportTripData = (format: 'pdf' | 'ical' | 'json') => {
    // Simulate export functionality
    const filename = `${tripTitle.replace(/\s+/g, '_')}_trip.${format}`;
    console.log(`Exporting trip data as ${format}:`, filename);
    
    // In a real implementation, you would generate the actual file
    const link = document.createElement('a');
    link.download = filename;
    
    if (format === 'json') {
      const tripData = {
        title: tripTitle,
        description: tripDescription,
        inviteCode,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: 'application/json' });
      link.href = URL.createObjectURL(blob);
    } else {
      // For PDF and iCal, you would use appropriate libraries
      const blob = new Blob([`Trip: ${tripTitle}\nDescription: ${tripDescription}`], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
    }
    
    link.click();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'link', name: 'Share Link', icon: LinkIcon },
    { id: 'social', name: 'Social Media', icon: Share2 },
    { id: 'export', name: 'Export', icon: Download }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Share Trip</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'link' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Invite Link */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Invite Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-xs sm:text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink, 'link')}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Copy link"
                  >
                    {copied === 'link' ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this link with friends to invite them to collaborate
                </p>
              </div>

              {/* Invite Code */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Invite Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inviteCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-xs sm:text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteCode, 'code')}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Copy code"
                  >
                    {copied === 'code' ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Friends can enter this code manually
                </p>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  QR Code
                </label>
                <div className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  {isGeneratingQR ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs sm:text-sm text-gray-600">Generating QR code...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-2" />
                      <button
                        onClick={generateQRCode}
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Email</span>
                </button>
                <button
                  onClick={shareViaSMS}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Share your trip on social media to let others know about your adventure
              </p>

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-xs sm:text-sm"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Share on WhatsApp</span>
                </button>

                <button
                  onClick={shareViaTwitter}
                  className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs sm:text-sm"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Share on Twitter</span>
                </button>

                <button
                  onClick={shareViaFacebook}
                  className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs sm:text-sm"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Share on Facebook</span>
                </button>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Share Preview</h4>
                <p className="text-xs text-gray-600">{shareText}</p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Export your trip data in various formats for backup or sharing
              </p>

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => exportTripData('pdf')}
                  className="w-full flex items-center justify-between p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">Export as PDF</div>
                      <div className="text-xs text-gray-500">Printable trip summary</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => exportTripData('ical')}
                  className="w-full flex items-center justify-between p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Export Calendar</div>
                      <div className="text-xs text-gray-500">iCal format for calendar apps</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => exportTripData('json')}
                  className="w-full flex items-center justify-between p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Export Data</div>
                      <div className="text-xs text-gray-500">JSON format for backup</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Exported files will include your trip details, schedule, and planning notes. Personal information of collaborators is not included.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;