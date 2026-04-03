import { Database, Upload, Tag, BarChart3, Settings, Home, Info, Mail, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'datasets', label: t.nav.datasets, icon: Database },
    { id: 'upload', label: t.nav.upload, icon: Upload },
    { id: 'labeling', label: t.nav.labeling, icon: Tag },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const footerItems = [
    { id: 'about', label: t.nav.about, icon: Info },
    { id: 'contact', label: t.nav.contact, icon: Mail },
    { id: 'privacy-policy', label: t.nav.privacyPolicy, icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4 flex flex-col">

      {/* Main Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-[#00a8ff] to-[#0097e6] text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Menu */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {footerItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-[#00a8ff] to-[#0097e6] text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}