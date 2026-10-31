'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Ambil data user dari localStorage setelah komponen dirender di client
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Gagal membaca data user dari localStorage:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    // Hapus token dan data user dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state & redirect ke halaman login
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            Toko<span className="text-gray-900">Online</span>
          </Link>

          {/* Menu Navigasi Utama */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Katalog
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-blue-600 font-medium">
              Keranjang
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-blue-600 font-medium">
              Pesanan
            </Link>
          </div>

          {/* Status Akun / Tombol Action */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Halo, <strong className="text-gray-900">{user.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}