import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { showInstallPrompt } from '../lib/pwa';

interface PWAInstallButtonProps {
  className?: string;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    // Listen for pwaInstallable event
    const handleInstallable = () => {
      setIsInstallable(true);
    };
    
    // Listen for pwaInstalled event
    const handleInstalled = () => {
      setIsInstallable(false);
    };
    
    document.addEventListener('pwaInstallable', handleInstallable);
    document.addEventListener('pwaInstalled', handleInstalled);
    
    // Check if the deferredPrompt is already available (page might have loaded before our event listeners)
    if (window.deferredPrompt) {
      setIsInstallable(true);
    }
    
    return () => {
      document.removeEventListener('pwaInstallable', handleInstallable);
      document.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);
  
  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setIsInstallable(false);
    }
  };
  
  if (!isInstallable) {
    return null;
  }
  
  return (
    <button
      onClick={handleInstall}
      className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ${className}`}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </button>
  );
};

export default PWAInstallButton;