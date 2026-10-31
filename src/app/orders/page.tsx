'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

interface OrderItem {
  _id?: string;
  product: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number; // Disesuaikan dengan totalPrice di backend
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      const data = response.data?.data || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error memuat pesanan:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Akses ditolak (403/401). Silakan login ulang.');
      } else {
        setError('Gagal memuat riwayat pesanan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500 font-medium">
        Memuat riwayat pesanan...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Pesanan</h1>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-200">
          <p className="mb-3">{error}</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
            Ke Halaman Login
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 mb-4">Belum ada transaksi atau pesanan yang dibuat.</p>
          <Link href="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id || index}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Header Pesanan */}
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-gray-100 gap-2">
                <div>
                  <span className="text-xs text-gray-400 block">ID Pesanan</span>
                  <span className="font-mono text-sm text-gray-700 font-medium">#{order._id}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${getStatusBadge(order.status)}`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Rincian Produk */}
              <div className="py-4 space-y-3">
                {order.items?.map((item, itemIdx) => (
                  <div key={item._id || itemIdx} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name || 'Produk'}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x Rp {(item.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Harga */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Pembayaran</span>
                <span className="text-lg font-bold text-blue-600">
                  Rp {(order.totalPrice || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}