'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  selected: boolean;
  subtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk Form Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer_bank' | 'e_wallet'>('transfer_bank');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // 1. Ambil data keranjang dari GET /api/cart
  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const items = response.data?.data?.items || response.data?.items || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err: any) {
      console.error('Error memuat keranjang:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Silakan login terlebih dahulu untuk melihat keranjang.');
      } else {
        setError('Gagal memuat keranjang belanja.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Update Quantity via PUT /api/cart/:productId
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity });
      fetchCart();
    } catch (err: any) {
      console.error('Error update kuantitas:', err);
      alert(err.response?.data?.message || 'Gagal memperbarui jumlah produk.');
    }
  };

  // 3. Hapus Item via DELETE /api/cart/:productId
  const handleRemoveItem = async (productId: string) => {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCart();
    } catch (err: any) {
      console.error('Error hapus produk:', err);
      alert(err.response?.data?.message || 'Gagal menghapus produk dari keranjang.');
    }
  };

  // 4. Submit Checkout ke POST /api/orders
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutLoading(true);

    try {
      await api.post('/orders', {
        shippingAddress,
        paymentMethod,
      });

      alert('Pesanan berhasil dibuat!');
      setIsCheckoutOpen(false);
      router.push('/orders');
    } catch (err: any) {
      console.error('Error Checkout:', err);
      setCheckoutError(
        err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Gagal membuat pesanan.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Hitung Total Belanja dari item yang terseleksi
  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.subtotal || item.product?.price * item.quantity || 0),
    0
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-600 font-medium">
        Memuat keranjang belanja...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-200">
          <p>{error}</p>
          <Link href="/login" className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
            Ke Halaman Login
          </Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">Keranjang belanja kamu masih kosong.</p>
          <Link href="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            Lihat Katalog Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daftar Produk di Keranjang */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product?._id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product?.name || 'Produk'}</h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Rp {item.product?.price?.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Kontrol Kuantitas */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-medium text-gray-900 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => handleRemoveItem(item.product._id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          {/* Ringkasan Belanja */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Belanja</h2>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 text-gray-600">
              <span>Total Item</span>
              <span className="font-medium text-gray-900">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Pcs
              </span>
            </div>

            <div className="flex justify-between items-center my-4 text-lg font-bold text-gray-900">
              <span>Total Harga</span>
              <span className="text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Checkout */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout Pesanan</h2>

            {checkoutError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Pengiriman
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Masukkan alamat lengkap pengiriman..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="e_wallet">E-Wallet</option>
                </select>
              </div>

              <div className="pt-2 flex justify-between text-sm font-semibold text-gray-900">
                <span>Total Bayar:</span>
                <span className="text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                >
                  {checkoutLoading ? 'Memproses...' : 'Buat Pesanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}