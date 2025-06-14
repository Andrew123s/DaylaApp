import React, { createContext, useContext, useState, useEffect } from 'react';
import { isOnline, registerConnectivityListeners } from '../lib/pwa';

// Import your existing AppContext code here
// This is a placeholder for your existing AppContext implementation
// We're adding offline support to it

interface AppContextType {
  // Your existing context properties
  trips: any[];
  forumPosts: any[];
  createTrip: (trip: any) => void;
  updateTrip: (tripId: string, updates: any) => void;
  addStickyNote: (tripId: string, note: any) => void;
  updateStickyNote: (tripId: string, noteId: string, updates: any) => void;
  deleteStickyNote: (tripId: string, noteId: string) => void;
  activeTrip: any;
  setActiveTrip: (trip: any) => void;
  updateUserActivity: (tripId: string, userId: string, action: string) => void;
  markNotificationAsRead: (tripId: string, notificationId: string) => void;
  addLiveNotification: (tripId: string, notification: any) => void;
  dismissLiveNotification: (tripId: string, notificationId: string) => void;
  updateUserRole: (tripId: string, userId: string, role: 'viewer' | 'editor') => void;
  removeCollaborator: (tripId: string, userId: string) => void;
  setNoteEditingUser: (tripId: string, noteId: string, userId: string, isEditing: boolean) => void;
  createForumPost: (post: any) => void;
  addForumComment: (postId: string, comment: any) => void;
  joinTripByInvite: (inviteCode: string, userId: string, userName: string, userAvatar?: string) => boolean;
  initializeBudget: (tripId: string, totalBudget: number, currency: string) => void;
  addExpense: (tripId: string, expense: any) => void;
  updateExpense: (tripId: string, expenseId: string, updates: any) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  settleExpense: (tripId: string, expenseId: string, status: any) => void;
  initializeSustainability: (tripId: string) => void;
  updateCarbonFootprint: (tripId: string, footprint: any) => void;
  addTransportOption: (tripId: string, option: any) => void;
  selectTransportOption: (tripId: string, optionId: string) => void;
  addOffsetContribution: (tripId: string, contribution: any) => void;
  initializePackingList: (tripId: string, packingList: any) => void;
  addPackingItem: (tripId: string, item: any) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: any) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  togglePackingItemStatus: (tripId: string, itemId: string, status: 'packed' | 'purchased' | 'missing') => void;
  assignPackingItem: (tripId: string, itemId: string, userId: string) => void;
  updateLuggageType: (tripId: string, luggageType: string) => void;
  
  // New properties for offline support
  isOffline: boolean;
  hasPendingChanges: boolean;
  syncChanges: () => Promise<boolean>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helper function to check if Service Worker features are supported
const isServiceWorkerSupported = (): boolean => {
  // Check if Service Workers are supported
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  // Check if we're in StackBlitz or other unsupported environments
  if (window.location.hostname.includes('stackblitz') || 
      window.location.hostname.includes('webcontainer')) {
    return false;
  }
  
  // Check for file:// protocol
  if (window.location.protocol === 'file:') {
    return false;
  }
  
  return true;
};

// Helper function to check if background sync is supported
const isBackgroundSyncSupported = (): boolean => {
  return isServiceWorkerSupported() && 'SyncManager' in window;
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Your existing state
  const [trips, setTrips] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  
  // New state for offline support
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('daylaTrips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }

    const savedPosts = localStorage.getItem('daylaForumPosts');
    if (savedPosts) {
      setForumPosts(JSON.parse(savedPosts));
    }

    const savedPendingChanges = localStorage.getItem('daylaPendingChanges');
    if (savedPendingChanges) {
      const changes = JSON.parse(savedPendingChanges);
      setPendingChanges(changes);
      setHasPendingChanges(changes.length > 0);
    }

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      // Attempt to sync changes when coming back online
      if (pendingChanges.length > 0) {
        syncChanges();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    registerConnectivityListeners(handleOnline, handleOffline);
    
    // Register for sync events only if supported
    if (isBackgroundSyncSupported()) {
      navigator.serviceWorker.ready
        .then(registration => {
          // Only register for background sync if the service worker is ready
          try {
            registration.sync.register('sync-notes');
            registration.sync.register('sync-expenses');
            console.log('Background sync registered successfully');
          } catch (error) {
            console.warn('Background sync registration failed:', error);
          }
        })
        .catch(error => {
          console.warn('Service Worker not ready for background sync:', error);
        });
    } else {
      console.log('Background sync not supported in this environment');
    }
    
    return () => {
      // Cleanup listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingChanges.length]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('daylaTrips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('daylaForumPosts', JSON.stringify(forumPosts));
  }, [forumPosts]);

  useEffect(() => {
    localStorage.setItem('daylaPendingChanges', JSON.stringify(pendingChanges));
    setHasPendingChanges(pendingChanges.length > 0);
  }, [pendingChanges]);

  // Function to add a pending change
  const addPendingChange = (change: any) => {
    setPendingChanges(prev => [...prev, { ...change, id: Date.now(), timestamp: new Date().toISOString() }]);
  };

  // Function to sync pending changes with the server
  const syncChanges = async (): Promise<boolean> => {
    if (!isOnline() || pendingChanges.length === 0) {
      return false;
    }

    try {
      // Process each pending change
      const successfulChanges: number[] = [];
      
      for (const change of pendingChanges) {
        try {
          // Here you would make the actual API call to sync the change
          // This is a placeholder for your actual API call
          console.log('Syncing change:', change);
          
          // If successful, add to successful changes
          successfulChanges.push(change.id);
        } catch (error) {
          console.error('Failed to sync change:', change, error);
        }
      }
      
      // Remove successful changes from pending
      if (successfulChanges.length > 0) {
        setPendingChanges(prev => prev.filter(change => !successfulChanges.includes(change.id)));
      }
      
      return successfulChanges.length > 0;
    } catch (error) {
      console.error('Error syncing changes:', error);
      return false;
    }
  };

  // Your existing functions with offline support
  const createTrip = (trip: any) => {
    const newTrip = {
      ...trip,
      id: Date.now().toString(),
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      notes: [],
      notifications: [],
      liveNotifications: [],
      activeUsers: []
    };
    
    setTrips(prev => [...prev, newTrip]);
    
    // If offline, add to pending changes
    if (isOffline) {
      addPendingChange({
        type: 'CREATE_TRIP',
        data: newTrip
      });
    } else {
      // Here you would make the actual API call
      // This is a placeholder for your actual API call
    }
  };

  // Add the rest of your existing functions here, with similar offline support
  // For brevity, I'm not including all of them, but you would follow the same pattern

  // Example of updating a trip with offline support
  const updateTrip = (tripId: string, updates: any) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, ...updates } : trip
    ));
    
    // If offline, add to pending changes
    if (isOffline) {
      addPendingChange({
        type: 'UPDATE_TRIP',
        tripId,
        updates
      });
    } else {
      // Here you would make the actual API call
      // This is a placeholder for your actual API call
    }
  };

  // Example of adding a sticky note with offline support
  const addStickyNote = (tripId: string, note: any) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: new Date(),
      editingUsers: []
    };
    
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, notes: [...trip.notes, newNote] } 
        : trip
    ));
    
    // If offline, add to pending changes
    if (isOffline) {
      addPendingChange({
        type: 'ADD_STICKY_NOTE',
        tripId,
        note: newNote
      });
    } else {
      // Here you would make the actual API call
      // This is a placeholder for your actual API call
    }
  };

  // Include all your other functions here...
  // For brevity, I'm assuming they exist and just adding the context value

  // Context value
  const value = {
    trips,
    forumPosts,
    createTrip,
    updateTrip,
    addStickyNote,
    updateStickyNote: () => {}, // Your implementation
    deleteStickyNote: () => {}, // Your implementation
    activeTrip,
    setActiveTrip,
    updateUserActivity: () => {}, // Your implementation
    markNotificationAsRead: () => {}, // Your implementation
    addLiveNotification: () => {}, // Your implementation
    dismissLiveNotification: () => {}, // Your implementation
    updateUserRole: () => {}, // Your implementation
    removeCollaborator: () => {}, // Your implementation
    setNoteEditingUser: () => {}, // Your implementation
    createForumPost: () => {}, // Your implementation
    addForumComment: () => {}, // Your implementation
    joinTripByInvite: () => true, // Your implementation
    initializeBudget: () => {}, // Your implementation
    addExpense: () => {}, // Your implementation
    updateExpense: () => {}, // Your implementation
    deleteExpense: () => {}, // Your implementation
    settleExpense: () => {}, // Your implementation
    initializeSustainability: () => {}, // Your implementation
    updateCarbonFootprint: () => {}, // Your implementation
    addTransportOption: () => {}, // Your implementation
    selectTransportOption: () => {}, // Your implementation
    addOffsetContribution: () => {}, // Your implementation
    initializePackingList: () => {}, // Your implementation
    addPackingItem: () => {}, // Your implementation
    updatePackingItem: () => {}, // Your implementation
    deletePackingItem: () => {}, // Your implementation
    togglePackingItemStatus: () => {}, // Your implementation
    assignPackingItem: () => {}, // Your implementation
    updateLuggageType: () => {}, // Your implementation
    
    // New properties for offline support
    isOffline,
    hasPendingChanges,
    syncChanges
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};