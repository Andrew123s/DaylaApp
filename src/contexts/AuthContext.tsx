import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  preferences?: UserPreferences;
  hasCompletedOnboarding?: boolean;
  settings?: UserSettings;
  isAdmin?: boolean; // Added isAdmin property
}

interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  notifications: {
    tripUpdates: boolean;
    chatMessages: boolean;
    communityPosts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    tripSharing: boolean;
    locationSharing: boolean;
  };
}

interface UserPreferences {
  travelStyle: string[];
  interests: string[];
  budgetRange: string;
  tripFrequency: string;
  groupPreference: string;
  sustainabilityImportance: number;
  planningStyle: string;
  notifications: {
    tripUpdates: boolean;
    communityPosts: boolean;
    recommendations: boolean;
    reminders: boolean;
  };
  goals: string[];
  destinations: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  uploadProfileImage: (file: File) => Promise<string>;
  completeOnboarding: (preferences: UserPreferences) => void;
  currentTheme: 'light' | 'dark';
  currentLanguage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Language translations
const translations = {
  en: {
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'community': 'Community',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    'new_trip': 'New Trip',
    'invite_friends': 'Invite Friends',
    'share': 'Share',
    'schedule': 'Schedule',
    'planning_board': 'Planning Board',
    'budget': 'Budget',
    'sustainability': 'Sus Cal',
    'packing': 'Smart Pak',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'remove': 'Remove',
    'pay_now': 'Pay Now',
    'paid': 'Paid',
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed'
  },
  es: {
    'welcome': 'Bienvenido',
    'dashboard': 'Panel',
    'community': 'Comunidad',
    'profile': 'Perfil',
    'settings': 'Configuración',
    'logout': 'Cerrar Sesión',
    'new_trip': 'Nuevo Viaje',
    'invite_friends': 'Invitar Amigos',
    'share': 'Compartir',
    'schedule': 'Horario',
    'planning_board': 'Tablero de Planificación',
    'budget': 'Presupuesto',
    'sustainability': 'Sostenibilidad',
    'packing': 'Equipaje Inteligente',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'add': 'Agregar',
    'remove': 'Quitar',
    'pay_now': 'Pagar Ahora',
    'paid': 'Pagado',
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'completed': 'Completado',
    'failed': 'Fallido'
  },
  fr: {
    'welcome': 'Bienvenue',
    'dashboard': 'Tableau de Bord',
    'community': 'Communauté',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'logout': 'Déconnexion',
    'new_trip': 'Nouveau Voyage',
    'invite_friends': 'Inviter des Amis',
    'share': 'Partager',
    'schedule': 'Horaire',
    'planning_board': 'Tableau de Planification',
    'budget': 'Budget',
    'sustainability': 'Durabilité',
    'packing': 'Bagages Intelligents',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'add': 'Ajouter',
    'remove': 'Retirer',
    'pay_now': 'Payer Maintenant',
    'paid': 'Payé',
    'pending': 'En Attente',
    'processing': 'Traitement',
    'completed': 'Terminé',
    'failed': 'Échoué'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedUser = localStorage.getItem('daylaUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Apply saved theme and language
      if (userData.settings) {
        applyTheme(userData.settings.theme || 'light');
        setCurrentLanguage(userData.settings.language || 'en');
      }
    }
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    if (theme === 'dark') {
      root.classList.add('dark');
      setCurrentTheme('dark');
    } else {
      root.classList.remove('dark');
      setCurrentTheme('light');
    }
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    const mockUser: User = {
      id: '1',
      email,
      name: 'Adventure Seeker',
      avatar: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Love exploring new places and creating memories!',
      interests: ['Hiking', 'Photography', 'Culture'],
      hasCompletedOnboarding: true,
      isAdmin: email.includes('admin'), // Make admin if email contains 'admin'
      settings: {
        language: 'en',
        theme: 'light',
        timezone: 'UTC-8',
        notifications: {
          tripUpdates: true,
          chatMessages: true,
          communityPosts: false
        },
        privacy: {
          profileVisibility: 'public',
          tripSharing: true,
          locationSharing: false
        }
      }
    };
    setUser(mockUser);
    localStorage.setItem('daylaUser', JSON.stringify(mockUser));
    
    // Apply user's theme and language preferences
    if (mockUser.settings) {
      applyTheme(mockUser.settings.theme);
      setCurrentLanguage(mockUser.settings.language);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      avatar: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      hasCompletedOnboarding: false, // Set to false for new users
      isAdmin: email.includes('admin'), // Make admin if email contains 'admin'
      settings: {
        language: 'en',
        theme: 'light',
        timezone: 'UTC-8',
        notifications: {
          tripUpdates: true,
          chatMessages: true,
          communityPosts: false
        },
        privacy: {
          profileVisibility: 'public',
          tripSharing: true,
          locationSharing: false
        }
      }
    };
    setUser(mockUser);
    localStorage.setItem('daylaUser', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('daylaUser');
    // Reset to default theme and language
    applyTheme('light');
    setCurrentLanguage('en');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('daylaUser', JSON.stringify(updatedUser));
    }
  };

  const updateSettings = (settingsUpdates: Partial<UserSettings>) => {
    if (user) {
      const updatedSettings = { ...user.settings, ...settingsUpdates };
      const updatedUser = { ...user, settings: updatedSettings };
      
      setUser(updatedUser);
      localStorage.setItem('daylaUser', JSON.stringify(updatedUser));
      
      // Apply theme and language changes immediately
      if (settingsUpdates.theme) {
        applyTheme(settingsUpdates.theme);
      }
      if (settingsUpdates.language) {
        setCurrentLanguage(settingsUpdates.language);
      }
      
      // Show success message
      showSuccessToast('Settings updated successfully!');
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    // Simulate file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = URL.createObjectURL(file);
        resolve(mockUrl);
      }, 1000);
    });
  };

  const completeOnboarding = (preferences: UserPreferences) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        preferences,
        hasCompletedOnboarding: true,
        interests: preferences.interests
      };
      setUser(updatedUser);
      localStorage.setItem('daylaUser', JSON.stringify(updatedUser));
    }
  };

  const showSuccessToast = (message: string) => {
    // Create and show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateProfile,
      updateSettings,
      uploadProfileImage,
      completeOnboarding,
      currentTheme,
      currentLanguage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserPreferences, UserSettings };
export { translations };