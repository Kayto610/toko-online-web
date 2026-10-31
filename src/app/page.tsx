'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err: any) {
        setError('Gagal memuat produk. Pastikan server backend Express sedang berjalan di port 5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Katalog Produk</h1>

      {loading && (
        <div className="text-center py-12 text-gray-500">Memuat katalog produk...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
          Belum ada produk yang tersedia di database.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-4">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.category || 'Umum'}
                </span>
                <h2 className="font-semibold text-gray-800 text-lg mt-2">{product.name}</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-2">Stok: {product.stock}</p>
              </div>

              <div className="p-4 pt-0">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition text-sm"
                  onClick={() => alert(`Menambahkan ${product.name} ke keranjang!`)}
                >
                  + Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}