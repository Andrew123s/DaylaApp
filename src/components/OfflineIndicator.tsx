import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { isOnline, registerConnectivityListeners, unregisterConnectivityListeners } from '../lib/pwa';

const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      // Show a brief "back online" message
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };
    
    const handleOffline = () => {
      setOnline(false);
      setShowOfflineMessage(true);
    };
    
    registerConnectivityListeners(handleOnline, handleOffline);
    
    return () => {
      unregisterConnectivityListeners(handleOnline, handleOffline);
    };
  }, []);
  
  if (online && !showOfflineMessage) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg animate-slide-in-right ${
      online 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      {online ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;