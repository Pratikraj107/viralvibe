"use client";

import { useState } from 'react';
import { Play, ExternalLink, Copy, Loader2, Video, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface VideoSummarizedContent {
  summary: string;
  linkedinPost: string;
  twitterThread: string[];
  originalUrl: string;
  title: string;
  thumbnail?: string;
}

export default function VideoSummarizerPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summarizedContent, setSummarizedContent] = useState<VideoSummarizedContent | null>(null);
  const [error, setError] = useState('');

  const summarizeVideo = async () => {
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummarizedContent(null);

    try {
      const response = await fetch('/api/video-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize video');
      }

      const data = await response.json();
      setSummarizedContent(data);
      toast.success('Video summarized successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      summarizeVideo();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full">
                <Video className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Video Summarizer
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Paste any YouTube video URL and get an AI-powered summary, LinkedIn post, and Twitter thread based on the video content.
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={summarizeVideo}
                        disabled={isLoading || !url.trim()}
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Analyzing...</span>
                            <span className="sm:hidden">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Summarize Video</span>
                            <span className="sm:hidden">Summarize</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
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

          {/* Results */}
          {summarizedContent && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-2">
                  Video: {summarizedContent.title}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={summarizedContent.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-red-600 transition-colors"
                  >
                    {summarizedContent.originalUrl}
                  </a>
                </div>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Summary */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Video className="h-5 w-5" />
                      </div>
                      Video Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {summarizedContent.summary}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(summarizedContent.summary, 'Video summary')}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Summary
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* LinkedIn Post */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Linkedin className="h-5 w-5" />
                      </div>
                      LinkedIn Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {summarizedContent.linkedinPost}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(summarizedContent.linkedinPost, 'LinkedIn post')}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy LinkedIn Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter Thread */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Twitter className="h-5 w-5" />
                      </div>
                      Twitter Thread
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {summarizedContent.twitterThread.map((tweet, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-gray-500 font-medium min-w-[20px]">
                                {index + 1}
                              </span>
                              <p className="text-gray-800 text-sm flex-1">
                                {tweet}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(summarizedContent.twitterThread.join('\n\n'), 'Twitter thread')}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Thread
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500">
            <p>Powered by AI • Transform any YouTube video into engaging social media content</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
