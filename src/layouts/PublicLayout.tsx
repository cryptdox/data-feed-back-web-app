import { ReactNode, useState } from 'react';
import { Navbar } from '../components/Navbar';

interface PublicLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function PublicLayout({ children, currentPage, onNavigate }: PublicLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar onNavigate={onNavigate} />
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}