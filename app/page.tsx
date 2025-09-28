import Link from 'next/link';
import { Sparkles, TrendingUp, FileText, Video, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ViralVibe</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#customers" className="text-gray-600 hover:text-gray-900">Customers</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">Log In</Link>
            <Link href="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Start Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">CREATE FOR FAST</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            One tool to{' '}
            <span className="relative">
              generate
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400 opacity-60 -z-10"></div>
            </span>{' '}
            viral content and grow your audience
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            ViralVibe helps content creators and marketers work faster, smarter and more efficiently, 
            delivering AI-powered insights to create engaging posts and ensure maximum reach.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
              Start for Free
            </Link>
            <Link href="/app" className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all">
              Get a Demo
            </Link>
          </div>

          {/* User Avatars */}
          <div className="relative flex items-center justify-center mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                B
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                C
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold">
                D
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">More than 100+ creators trust us.</p>
            <div className="flex items-center gap-8 opacity-60">
              <div className="text-gray-400 font-semibold">HubSpot</div>
              <div className="text-gray-400 font-semibold">Dropbox</div>
              <div className="text-gray-400 font-semibold">Square</div>
              <div className="text-gray-400 font-semibold">INTERCOM</div>
              <div className="text-gray-400 font-semibold">Grammarly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">#</span>
              <span className="text-sm font-medium text-gray-600">FEATURES</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Latest advanced AI technologies to ensure everything you need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trending Topics</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover what's trending right now with real-time data from Perplexity AI. 
                Get current topics, keywords, and hashtags for maximum engagement.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Summarizer</h3>
              <p className="text-gray-600 leading-relaxed">
                Turn any article or video into engaging social media content. 
                Get LinkedIn posts and Twitter threads automatically generated from your content.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Video Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Extract insights from YouTube videos and create viral content. 
                Our AI understands video content and generates perfect social media posts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to create viral content?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using ViralVibe to grow their audience and engagement.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
              Start for Free
            </Link>
            <Link href="/app" className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ViralVibe</span>
            </div>
            <p className="text-gray-600">© 2024 ViralVibe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}