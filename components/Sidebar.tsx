"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTwitter } from '@/contexts/TwitterContext';
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Video, 
  LogOut, 
  User, 
  Twitter,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigationItems = [
  {
    name: 'Generator',
    href: '/app',
    icon: Sparkles,
    description: 'AI Content Generator'
  },
  {
    name: 'Trending',
    href: '/trending',
    icon: TrendingUp,
    description: 'Trending Topics'
  },
  {
    name: 'Summarizer',
    href: '/summarizer',
    icon: FileText,
    description: 'Article Summarizer'
  },
  {
    name: 'Video',
    href: '/video-summarizer',
    icon: Video,
    description: 'Video Summarizer'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { user: twitterUser, isAuthenticated: isTwitterConnected } = useTwitter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-white/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Generator
                </h1>
                <p className="text-xs text-gray-500">Content Creator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Twitter Connection Status */}
          {isTwitterConnected && twitterUser && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Twitter className="h-5 w-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-green-800">Connected to X</div>
                  <div className="text-xs text-green-600 truncate">@{twitterUser.username}</div>
                </div>
              </div>
            </div>
          )}

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-gray-500">Logged in</div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
