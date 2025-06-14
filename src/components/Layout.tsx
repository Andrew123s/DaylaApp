import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Map, 
  MessageCircle, 
  Users, 
  User, 
  LogOut, 
  Menu,
  X,
  Compass,
  Download,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import ChatSidebar from './ChatSidebar';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import PWAInstallButton from './PWAInstallButton';
import { isRunningAsStandalone } from '../lib/pwa';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isOffline, hasPendingChanges, syncChanges } = useApp();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsPWA(isRunningAsStandalone());
    
    // Show install prompt after 30 seconds if not already installed
    // and not already shown in this session
    if (!isPWA && !localStorage.getItem('installPromptShown')) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        localStorage.setItem('installPromptShown', 'true');
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [isPWA]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Map },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Compass className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dayla
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex ml-8 space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Offline Indicator */}
              {isOffline && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-xs">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </div>
              )}
              
              {/* Pending Changes Indicator */}
              {hasPendingChanges && (
                <button
                  onClick={() => syncChanges()}
                  disabled={isOffline}
                  className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-xs disabled:opacity-50"
                >
                  <span>Sync Changes</span>
                </button>
              )}
              
              {/* Install Button (only show if not already a PWA) */}
              {!isPWA && (
                <PWAInstallButton className="hidden sm:flex" />
              )}
              
              {/* Chat Toggle */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Chat"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Chat</span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Menu"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isSidebarOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Install App button in mobile menu */}
              {!isPWA && (
                <PWAInstallButton className="w-full justify-center mt-2" />
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Chat Sidebar */}
        <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
      
      {/* Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default Layout;