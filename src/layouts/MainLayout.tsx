import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (<div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
    <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onNavigate={onNavigate} />
    <div className="flex flex-1">
      {/* Sidebar for large screens */}
      <div className="hidden md:block">
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto overflow-x-hidden scrollbar-none">
          <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        </div>
      </div>

      {/* Sidebar overlay for small screens */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* dark overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* sidebar container */}
          <div className="relative w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full p-4 pt-16 z-50 overflow-y-auto overflow-x-hidden scrollbar-none">
            <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64">{children}</main>
    </div>
  </div>
  );
}