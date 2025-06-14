import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Apple } from 'lucide-react';
import { isRunningAsStandalone, checkInstallable, showInstallPrompt } from '../lib/pwa';

interface InstallPromptProps {
  onClose: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Don't show if already running as standalone
    if (isRunningAsStandalone()) {
      onClose();
      return;
    }
    
    // Check if app is installable
    const checkInstallability = async () => {
      const installable = await checkInstallable();
      setIsInstallable(installable);
      
      // Check if iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(iOS);
    };
    
    checkInstallability();
    
    // Listen for pwaInstalled event
    const handleInstalled = () => {
      onClose();
    };
    
    document.addEventListener('pwaInstalled', handleInstalled);
    
    return () => {
      document.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, [onClose]);
  
  const handleInstall = async () => {
    if (isIOS) {
      // Can't programmatically install on iOS, just show instructions
      return;
    }
    
    const installed = await showInstallPrompt();
    if (installed) {
      onClose();
    }
  };
  
  if (!isInstallable) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50 animate-slide-in-right">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Install Dayla</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {isIOS 
          ? 'Install Dayla on your iOS device for the best experience.'
          : 'Install Dayla as an app for faster access and offline features.'}
      </p>
      
      {isIOS ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              1
            </div>
            <span>Tap <Apple className="h-4 w-4 inline" /> Share button</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              2
            </div>
            <span>Scroll and tap "Add to Home Screen"</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              3
            </div>
            <span>Tap "Add" to confirm</span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          <span>Install App</span>
        </button>
      )}
    </div>
  );
};

export default InstallPrompt;