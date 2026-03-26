'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/register', formData);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-4 py-12 relative overflow-hidden text-white font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-[#0d1526]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 sm:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-white p-1.5 rounded-2xl shadow-xl">
                <Image
                  src="/icebay-logo.jpeg"
                  alt="Icebay Logo"
                  width={60}
                  height={80}
                  className="rounded-xl"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Join the <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Fleet</span></h1>
            <p className="text-gray-400 text-sm mt-2">Start managing your scoop shop with precision.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error && (
              <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
              <input
                type="text"
                name="name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Assign Role</label>
              <select
                name="role"
                className="w-full bg-[#1a253a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="seller">Store Seller</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 00000 00000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Store Address</label>
              <input
                type="text"
                name="address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                value={formData.address}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 disabled:opacity-50 mt-4 h-16"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Finish Registration'}
            </button>
          </form>

          <div className="text-center mt-10 space-y-4">
            <p className="text-gray-500 text-sm">
              Already a member?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:text-white transition-colors">
                Log In
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
