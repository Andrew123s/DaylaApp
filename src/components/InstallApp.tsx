import React from 'react';
import { Download } from 'lucide-react';
import { showInstallPrompt } from '../lib/pwa';

interface InstallAppProps {
  className?: string;
  buttonText?: string;
}

const InstallApp: React.FC<InstallAppProps> = ({ 
  className = '', 
  buttonText = 'Install App' 
}) => {
  const handleInstall = async () => {
    await showInstallPrompt();
  };
  
  return (
    <button
      onClick={handleInstall}
      className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ${className}`}
    >
      <Download className="h-4 w-4" />
      <span>{buttonText}</span>
    </button>
  );
};

export default InstallApp;