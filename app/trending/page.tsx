"use client";

import { useState } from 'react';
import { Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';

const categories = ['Business','Tech','Sports','Entertainment','Movies','Politics','Science','Health','Products'] as const;

export default function TrendingPage() {
  const [selected, setSelected] = useState<typeof categories[number]>('Tech');
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<Array<{title: string, summary: string}>>([]);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('us');
  const [copiedItems, setCopiedItems] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const loadTrending = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-trending-perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selected, country })
      });
      if (!res.ok) throw new Error('Failed to fetch trending');
      const data = await res.json();
      setTopics(Array.isArray(data.topics) ? data.topics : []);
    } catch (e) {
      setError('Failed to load trending topics');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
      toast.success('Topic copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy topic');
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Trending Topics</h1>
          <p className="text-lg text-gray-600">Pick a category and generate 10 current trends.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full border text-xs sm:text-sm ${selected === c ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/80 text-gray-700 hover:bg-white border-gray-200'}`}
              disabled={isLoading}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2">Country:</label>
          <select
            className="h-9 rounded-md border border-gray-300 bg-white px-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isLoading}
          >
            <option value="us">United States</option>
            <option value="gb">United Kingdom</option>
            <option value="in">India</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
            <option value="jp">Japan</option>
            <option value="br">Brazil</option>
            <option value="za">South Africa</option>
          </select>
        </div>

        <button
          onClick={loadTrending}
          disabled={isLoading}
          className="inline-flex items-center px-4 h-10 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-60"
        >
          {isLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Generating…</>) : 'Generate 10 topics'}
        </button>

        {error && <div className="mt-4 p-3 text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>}

        {topics.length > 0 && (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <div key={i} className="p-4 rounded-lg border bg-white/80 backdrop-blur-sm hover:shadow transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">#{i + 1}</div>
                    <div className="font-medium text-gray-800 mb-2">{topic.title}</div>
                    
                    {/* Expandable summary */}
                    {expandedItems.has(i) && (
                      <div className="text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded border-l-2 border-purple-200 max-h-60 overflow-y-auto">
                        <div className="whitespace-pre-wrap">
                          {topic.summary.split('\n').map((line, lineIndex) => {
                            if (line.startsWith('Read more: ')) {
                              const url = line.replace('Read more: ', '');
                              return (
                                <div key={lineIndex} className="mt-2">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                  >
                                    {line}
                                  </a>
                                </div>
                              );
                            }
                            return <div key={lineIndex}>{line}</div>;
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Expand/Collapse button */}
                    <button
                      onClick={() => toggleExpanded(i)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-2"
                    >
                      {expandedItems.has(i) ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show summary
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Copy button */}
                  <button
                    onClick={() => copyToClipboard(topic.title, i)}
                    className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    title="Copy topic"
                  >
                    {copiedItems.has(i) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
    </ProtectedRoute>
  );
}


