'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [addingId, setAddingId] = useState<string | null>(null);

  // 1. Fetch daftar produk dari API backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      
      // Mengantisipasi struktur respon Express: response.data.data atau response.data
      const data = response.data?.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error memuat produk:', err);
      setError('Gagal memuat produk. Pastikan server backend Express sedang berjalan di port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Fungsi Tambah ke Keranjang
  const handleAddToCart = async (productId: string) => {
    // Cek apakah user sudah login dengan mengecek ketersediaan token di localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Silakan login terlebih dahulu untuk menambahkan barang ke keranjang!');
      return;
    }

    try {
      setAddingId(productId);
      await api.post('/cart', { productId, quantity: 1 });
      alert('Produk berhasil ditambahkan ke keranjang!');
    } catch (err: any) {
      console.error('Error menambahkan ke keranjang:', err);
      if (err.response?.status === 401) {
        alert('Sesi login telah berakhir. Silakan login kembali.');
      } else {
        alert(err.response?.data?.message || 'Gagal menambahkan produk ke keranjang.');
      }
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Katalog Produk</h1>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500 font-medium">
          Memuat katalog produk...
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg font-medium mb-2">Belum ada produk yang tersedia.</p>
          <p className="text-gray-400 text-sm">Tambahkan data produk melalui database MongoDB atau REST API backend kamu.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-wider font-semibold">Foto Produk</span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{product.name}</h3>
                
                {product.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    Rp {product.price?.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Stok: {product.stock}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleAddToCart(product._id)}
                  disabled={addingId === product._id || product.stock <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center"
                >
                  {addingId === product._id
                    ? 'Menambahkan...'
                    : product.stock <= 0
                    ? 'Stok Habis'
                    : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}