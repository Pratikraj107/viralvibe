"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        router.push('/app');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="p-6 rounded-xl border bg-white/80 backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-gray-600 mb-6">Start generating smarter content</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full h-10 px-3 rounded-md border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 rounded-md border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 px-3 rounded-md border border-gray-300" />
            </div>
            <button disabled={isLoading} className="w-full h-10 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-60">
              {isLoading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            Already have an account? <Link href="/login" className="text-blue-600">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


