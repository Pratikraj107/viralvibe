"use client";
import { useState } from 'react';
import { Twitter, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTwitter } from '@/contexts/TwitterContext';
import { toast } from 'sonner';

interface TwitterPostButtonProps {
  text: string;
  className?: string;
}

export default function TwitterPostButton({ text, className = '' }: TwitterPostButtonProps) {
  const { isAuthenticated, connectTwitter, postTweet } = useTwitter();
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const handlePost = async () => {
    if (!isAuthenticated) {
      connectTwitter();
      return;
    }

    setIsPosting(true);
    try {
      const result = await postTweet(text);
      
      if (result.success) {
        setPosted(true);
        toast.success('Tweet posted successfully!', {
          description: `View your tweet: ${result.tweet?.url}`,
          action: {
            label: 'View Tweet',
            onClick: () => window.open(result.tweet?.url, '_blank'),
          },
        });
        
        // Reset posted state after 3 seconds
        setTimeout(() => setPosted(false), 3000);
      } else {
        toast.error('Failed to post tweet', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Failed to post tweet');
    } finally {
      setIsPosting(false);
    }
  };

  if (posted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 ${className}`}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        Posted
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePost}
      disabled={isPosting}
      className={`hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 ${className}`}
    >
      {isPosting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Twitter className="h-4 w-4 mr-2" />
          {isAuthenticated ? 'Post to X' : 'Connect X'}
        </>
      )}
    </Button>
  );
}
