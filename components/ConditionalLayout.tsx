"use client";

import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user } = useAuth();

  // If user is not logged in, show content without sidebar
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    );
  }

  // If user is logged in, show sidebar and main content
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}
