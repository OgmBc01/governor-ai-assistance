'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();

      let data: { access_token?: string; message?: string } = {};
      if (rawBody) {
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(rawBody);
          } catch {
            data = { message: 'Login service returned invalid JSON.' };
          }
        } else {
          data = { message: rawBody };
        }
      }

      if (!response.ok || !data.access_token) {
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      // Store token
      localStorage.setItem('admin_token', data.access_token);
      document.cookie = `admin_token=${encodeURIComponent(data.access_token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4EEE4] via-[#FEFCF7] to-[#EEE3D2]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#FFFDF9] shadow-2xl border border-[#C9A03D]/25">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A03D] via-[#B84A2C] to-[#3A6B4B] flex items-center justify-center shadow-lg">
            <Crown size={32} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-heading font-bold text-[#2C2418]">Admin Portal</h1>
          <p className="text-sm text-[#5C5543] font-ui">Bauchi AI Governor Assistant</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#B84A2C]/10 border border-[#B84A2C]/30 flex items-center gap-2 text-[#B84A2C] text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-ui text-[#5C5543] block mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5543]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bauchi.gov.ng"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C9A03D]/30 focus:border-[#3A6B4B] focus:ring-2 focus:ring-[#3A6B4B]/20 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-ui text-[#5C5543] block mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5543]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C9A03D]/30 focus:border-[#3A6B4B] focus:ring-2 focus:ring-[#3A6B4B]/20 outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3A6B4B] via-[#C9A03D] to-[#B84A2C] text-white font-ui font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}