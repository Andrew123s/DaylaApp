// PWA utility functions

// Store the beforeinstallprompt event for later use
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

/**
 * Checks if the app is running in standalone mode (installed as PWA)
 */
export const isRunningAsStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

/**
 * Checks if the app can be installed (has a beforeinstallprompt event)
 */
export const checkInstallable = async (): Promise<boolean> => {
  // If we already have a deferred prompt, we can install
  if (window.deferredPrompt) {
    return true;
  }
  
  // iOS doesn't support beforeinstallprompt, but can be added to home screen
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  return isIOS && isSafari;
};

/**
 * Initializes the PWA install prompt listener
 */
export const initInstallPrompt = (): void => {
  // Initialize deferredPrompt to null
  window.deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    document.dispatchEvent(new CustomEvent('pwaInstallable'));
    console.log('App can be installed, saved prompt event');
  });
  
  // Handle the app being installed
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    window.deferredPrompt = null;
    // Log or update analytics
    console.log('PWA was installed');
    document.dispatchEvent(new CustomEvent('pwaInstalled'));
  });
};

/**
 * Shows the install prompt
 * @returns Promise<boolean> - Whether the user accepted the install prompt
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!window.deferredPrompt) {
    console.log('No installation prompt available');
    return false;
  }
  
  // Show the install prompt
  window.deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await window.deferredPrompt.userChoice;
  console.log(`User response to install prompt: ${outcome}`);
  
  // We've used the prompt, and can't use it again, discard it
  window.deferredPrompt = null;
  
  return outcome === 'accepted';
};

/**
 * Checks if the browser supports push notifications
 */
export const supportsPushNotifications = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Requests permission for push notifications
 * @returns Promise<boolean> - Whether permission was granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!supportsPushNotifications()) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Checks if the app is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Registers event listeners for online/offline status
 * @param onOnline - Callback for when the app goes online
 * @param onOffline - Callback for when the app goes offline
 */
export const registerConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
};

/**
 * Unregisters event listeners for online/offline status
 * @param onOnline - Callback for when the app goes online
 * @param onOffline - Callback for when the app goes offline
 */
export const unregisterConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): void => {
  window.removeEventListener('online', onOnline);
  window.removeEventListener('offline', onOffline);
};