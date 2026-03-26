'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/seller');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0d1526]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-white p-1.5 rounded-2xl shadow-xl">
                <Image
                  src="/icebay-logo.jpeg"
                  alt="Icebay Logo"
                  width={80}
                  height={100}
                  className="rounded-xl"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Welcome <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Back</span></h1>
            <p className="text-gray-400 text-sm mt-2">Access your Icebay ERP dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                Secret Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 disabled:opacity-50 mt-4 overflow-hidden relative group"
              disabled={loading}
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className="text-center mt-10 space-y-4">
            <p className="text-gray-500 text-sm">
              New to the platform?{' '}
              <Link href="/register" className="text-blue-400 font-bold hover:text-white transition-colors">
                Create Account
              </Link>
            </p>
            <Link href="/" className="inline-block text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
          Icebay Secure Auth &bull; v2.0
        </p>
      </div>
    </div>
  );
}
