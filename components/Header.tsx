'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { LogOut, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/')
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <span className="hidden sm:inline">AI Content Generator</span>
            <span className="sm:hidden">AI Generator</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-4">
            {user && (
              <>
                <Link href="/app" className="text-gray-700 hover:text-blue-600 transition-colors">Generator</Link>
                <Link href="/trending" className="text-gray-700 hover:text-purple-600 transition-colors">Trending</Link>
                <Link href="/summarizer" className="text-gray-700 hover:text-green-600 transition-colors">Summarizer</Link>
                <Link href="/video-summarizer" className="text-gray-700 hover:text-red-600 transition-colors">Video</Link>
              </>
            )}
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors">Login</Link>
                <Link href="/signup" className="text-gray-700 hover:text-gray-900 transition-colors">Signup</Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 sm:hidden">
          <div className="p-6 h-full flex flex-col">
            {/* Menu Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            {user && (
              <nav className="space-y-2 flex-1">
                <Link 
                  href="/app" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Generator
                </Link>
                <Link 
                  href="/trending" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Trending Topics
                </Link>
                <Link 
                  href="/summarizer" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Summarizer
                </Link>
                <Link 
                  href="/video-summarizer" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Video Summarizer
                </Link>
              </nav>
            )}

            {/* User Info */}
            {user ? (
              <div className="border-t pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">Logged in</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="border-t pt-4 mt-auto space-y-3">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
