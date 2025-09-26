"use client";

import { useState } from 'react';
import { Link, ExternalLink, Copy, Loader2, FileText, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface SummarizedContent {
  summary: string;
  linkedinPost: string;
  twitterThread: string[];
  originalUrl: string;
  title: string;
}

export default function SummarizerPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summarizedContent, setSummarizedContent] = useState<SummarizedContent | null>(null);
  const [error, setError] = useState('');

  const summarizeContent = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummarizedContent(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize content');
      }

      const data = await response.json();
      setSummarizedContent(data);
      toast.success('Content summarized successfully!');
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
      summarizeContent();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                AI Summarizer
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Paste any article, blog, or news URL and get an AI-powered summary, LinkedIn post, and Twitter thread.
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="url"
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={summarizeContent}
                        disabled={isLoading || !url.trim()}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Summarizing...</span>
                            <span className="sm:hidden">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Summarize
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
                  Summarized from: {summarizedContent.title}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={summarizedContent.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
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
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      Summary
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
                        onClick={() => copyToClipboard(summarizedContent.summary, 'Summary')}
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
            <p>Powered by AI • Transform any article into engaging social media content</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
