import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { isRunningAsStandalone, checkInstallable, showInstallPrompt } from '../lib/pwa';

interface PWAInstallButtonProps {
  className?: string;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    // Don't show if already running as standalone
    if (isRunningAsStandalone()) {
      setIsInstallable(false);
      return;
    }
    
    // Check if app is installable
    const checkInstallability = async () => {
      const installable = await checkInstallable();
      setIsInstallable(installable);
    };
    
    checkInstallability();
    
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
    
    return () => {
      document.removeEventListener('pwaInstallable', handleInstallable);
      document.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);
  
  const handleInstall = async () => {
    await showInstallPrompt();
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