"use client";

import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Twitter, Linkedin, Copy, Loader2, Sparkles, TrendingUp, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface GeneratedContent {
  tweets: string[];
  linkedinPosts: string[];
  searchResults: string[];
  topic: string;
  threads?: string[][];
  instagramPosts?: string[];
}

interface GeneratedImageMap {
  [key: string]: string | undefined; // key = platform-index, value = data URL
}

export default function GeneratorPage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [images, setImages] = useState<GeneratedImageMap>({});
  const [mode, setMode] = useState<'default' | 'twitter_threads' | 'instagram'>('default');
  const [mood, setMood] = useState<string>('professional');

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate content');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim(), mode, mood }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data);
      toast.success('Content generated successfully!');
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      toast.error('Failed to generate content');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${platform} post copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      generateContent();
    }
  };

  const generateImage = async (text: string, key: string) => {
    try {
      setImageLoading(prev => ({ ...prev, [key]: true }));
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, size: '1024x1024' })
      });
      if (!response.ok) throw new Error('Failed to generate image');
      const data = await response.json();
      const dataUrl = `data:image/png;base64,${data.imageBase64}`;
      setImages(prev => ({ ...prev, [key]: dataUrl }));
      toast.success('Image generated');
    } catch (err) {
      toast.error('Failed to generate image');
    } finally {
      setImageLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Content Generator
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Transform any topic into engaging social media content. Get AI-powered tweets and LinkedIn posts in seconds.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Enter your topic (e.g., artificial intelligence, climate change, productivity tips)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <select
                    className="h-10 rounded-md border border-gray-300 bg-white px-2"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    disabled={isLoading}
                  >
                    <option value="default">Default (Twitter + LinkedIn)</option>
                    <option value="twitter_threads">Twitter Threads</option>
                    <option value="instagram">Instagram Posts</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood:</span>
                  <select
                    className="h-10 rounded-md border border-gray-300 bg-white px-2"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="insightful">Insightful</option>
                    <option value="motivational">Motivational</option>
                    <option value="controversial">Controversial</option>
                    <option value="educational">Educational</option>
                    <option value="inspiring">Inspiring</option>
                    <option value="conversational">Conversational</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                </div>
                <Button 
                  onClick={generateContent}
                  disabled={isLoading || !topic.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Generate Social Media Content
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && !isLoading && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Generated for: {generatedContent.topic}
              </Badge>
            </div>

            {mode === 'default' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Twitter Column */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-blue-600">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Twitter className="h-5 w-5" />
                    </div>
                    Twitter Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedContent.tweets.map((tweet: string, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">{tweet}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{tweet.length}/280 characters</span>
                          <Button
                            onClick={() => copyToClipboard(tweet, 'Twitter')}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            onClick={() => generateImage(tweet, `twitter-${idx}`)}
                            variant="outline"
                            size="sm"
                            className="ml-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                            disabled={!!imageLoading[`twitter-${idx}`]}
                          >
                            {imageLoading[`twitter-${idx}`] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Generating
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-4 w-4 mr-1" />
                                Generate Image
                              </>
                            )}
                          </Button>
                        </div>
                        {images[`twitter-${idx}`] && (
                          <div className="mt-3">
                            <img src={images[`twitter-${idx}`]} alt="Generated" className="rounded-md border" />
                            <div className="mt-2 flex justify-end">
                              <a href={images[`twitter-${idx}`]} download={`twitter-${idx}.png`} className="inline-flex items-center text-blue-600 text-sm">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* LinkedIn Column */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-purple-600">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Linkedin className="h-5 w-5" />
                    </div>
                    LinkedIn Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedContent.linkedinPosts.map((post: string, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">{post}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{post.length} characters</span>
                          <Button
                            onClick={() => copyToClipboard(post, 'LinkedIn')}
                            variant="outline"
                            size="sm"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            onClick={() => generateImage(post, `linkedin-${idx}`)}
                            variant="outline"
                            size="sm"
                            className="ml-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                            disabled={!!imageLoading[`linkedin-${idx}`]}
                          >
                            {imageLoading[`linkedin-${idx}`] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Generating
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-4 w-4 mr-1" />
                                Generate Image
                              </>
                            )}
                          </Button>
                        </div>
                        {images[`linkedin-${idx}`] && (
                          <div className="mt-3">
                            <img src={images[`linkedin-${idx}`]} alt="Generated" className="rounded-md border" />
                            <div className="mt-2 flex justify-end">
                              <a href={images[`linkedin-${idx}`]} download={`linkedin-${idx}.png`} className="inline-flex items-center text-purple-600 text-sm">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {mode === 'twitter_threads' && generatedContent.threads && (
              <div className="space-y-6">
                {generatedContent.threads.map((thread, tIdx) => (
                  <Card key={tIdx} className="border-0 shadow-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-600">Twitter Thread #{tIdx + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {thread.map((tweet, idx) => (
                          <div key={idx} className="p-3 rounded border bg-white">
                            <p className="whitespace-pre-wrap text-gray-800">{tweet}</p>
                            <div className="mt-2 flex justify-end">
                              <Button onClick={() => copyToClipboard(tweet, 'Twitter')} variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-1" /> Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {mode === 'instagram' && generatedContent.instagramPosts && (
              <div className="space-y-4">
                {generatedContent.instagramPosts.map((cap, idx) => (
                  <Card key={idx} className="border-0 shadow-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-pink-600">Instagram Caption #{idx + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg p-4 border">
                        <p className="whitespace-pre-wrap text-gray-800">{cap}</p>
                        <div className="mt-2 flex justify-end">
                          <Button onClick={() => copyToClipboard(cap, 'Instagram')} variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Search Results Preview */}
            {generatedContent.searchResults && generatedContent.searchResults.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <Search className="h-5 w-5" />
                    Research Sources Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {generatedContent.searchResults.slice(0, 3).map((result: string, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600 line-clamp-2">{result}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Powered by AI • Generate engaging social media content effortlessly</p>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

