'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          Toko<span className="text-gray-900">Online</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Katalog
          </Link>
          <Link 
            href="/cart" 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Keranjang
          </Link>
          <Link 
            href="/orders" 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Pesanan
          </Link>

          {/* Dynamic Action Button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}