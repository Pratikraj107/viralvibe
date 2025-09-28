import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { TwitterProvider } from '@/contexts/TwitterContext';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Social Media Content Generator',
  description: 'Generate engaging tweets and LinkedIn posts with AI-powered content creation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TwitterProvider>
            <Sidebar />
            <MainContent>
              {children}
            </MainContent>
            <Toaster position="top-right" />
          </TwitterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}