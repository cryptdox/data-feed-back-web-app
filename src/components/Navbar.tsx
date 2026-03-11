import { Moon, Sun, Globe, Rocket, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_API_URL, STORAGE_KEYS } from '../constants';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) as string;
      const response = await fetch(`${AUTH_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || 'Logout failed');
        return;
      }
      logout();
      alert(data.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile toggle button */}
            {onToggleSidebar && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                onClick={onToggleSidebar}
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            <div className="w-10 h-10 bg-gradient-to-br from-space-blue to-space-purple rounded-lg flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold bg-gradient-to-r from-space-blue to-space-purple bg-clip-text text-transparent">
                DataHub
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Change Language"
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}