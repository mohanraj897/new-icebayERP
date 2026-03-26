'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050b18] text-white relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 lg:py-12 flex flex-col items-center justify-center min-h-screen">

        {/* Header/Nav - Subtle */}
        <div className="md:absolute top-8 left-0 right-0 px-8 flex flex-col sm:flex-row justify-between items-center w-full max-w-7xl mx-auto mb-12 md:mb-0 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg ring-4 ring-blue-500/20">
              <Image src="/icebay-logo.jpeg" alt="Icebay" width={32} height={32} className="rounded-md" />
            </div>
            <span className="font-bold tracking-tight text-xl">Icebay<span className="text-blue-400">ERP</span></span>
          </div>
          <div className="flex gap-6 text-xs sm:text-sm font-medium text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">Premium</span>
            <span className="hover:text-white cursor-pointer transition-colors">Enterprise</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full max-w-6xl">

          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8 order-2 lg:order-1">

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              Manage your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">Scoops Brilliance</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Elevate your ice cream business with a modern ERP designed for performance, accuracy, and stunning user experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/seller"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🚀 Launch Seller Panel</span>
              </Link>
              <Link
                href="/admin"
                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all backdrop-blur-md flex items-center justify-center gap-2"
              >
                <span>⚙️ Manage Admin</span>
              </Link>
            </div>
          </div>

          {/* Right: Logo / Visual Display */}
          <div className="flex-1 relative flex justify-center order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Ambient Light behind logo */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] lg:blur-[100px] rounded-full scale-75 animate-pulse" />

            <div className="relative group max-w-[240px] sm:max-w-none">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-[#0d1526] p-3 sm:p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="relative overflow-hidden rounded-2xl bg-white p-2 shadow-inner">
                  <Image
                    src="/icebay-logo.jpeg"
                    alt="IceBay Logo"
                    width={280}
                    height={380}
                    className="rounded-xl transform group-hover:scale-105 transition-transform duration-700 w-full h-auto"
                    priority
                  />
                  {/* Sticker reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-yellow-400 text-black font-black text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-xl transform rotate-12 animate-bounce">
                ORIGINAL RECIPE
              </div>
              <div className="absolute -bottom-2 -left-4 sm:-left-6 bg-cyan-400 text-black font-black text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-xl transform -rotate-6">
                EST. 2026
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative lg:absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4 text-center mt-12 lg:mt-0">
          <div className="flex gap-4 opacity-30 px-6">
            <div className="h-px w-8 sm:w-12 bg-white self-center"></div>
            <p className="text-[8px] sm:text-[10px] tracking-[0.2em] font-bold uppercase text-gray-400 whitespace-nowrap">
              Trusted by Leading Creameries
            </p>
            <div className="h-px w-8 sm:w-12 bg-white self-center"></div>
          </div>
          <p className="text-gray-500 text-[8px] sm:text-[10px] font-medium tracking-wider">
            ICEBAY ERP &copy; {new Date().getFullYear()} &bull; ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}
