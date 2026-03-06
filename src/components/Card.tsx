import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
