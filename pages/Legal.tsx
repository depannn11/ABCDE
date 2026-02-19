
import React from 'react';

export const FAQ = () => (
  <div className="max-w-3xl mx-auto px-4 py-20">
    <h1 className="text-3xl font-black mb-10 text-center">Frequently Asked Questions</h1>
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Berapa lama proses pengiriman akun?</h3>
        <p className="text-slate-500 text-sm">Pengiriman dilakukan secara instan oleh sistem setelah pembayaran QRIS Anda terkonfirmasi (settlement).</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Metode pembayaran apa saja yang tersedia?</h3>
        <p className="text-slate-500 text-sm">Kami menggunakan QRIS yang mendukung semua aplikasi e-wallet (Dana, OVO, GoPay, ShopeePay) dan Mobile Banking.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Apakah ada garansi?</h3>
        <p className="text-slate-500 text-sm">Ya, semua akun kami bergaransi full durasi sesuai paket yang dibeli selama tidak melanggar syarat penggunaan.</p>
      </div>
    </div>
  </div>
);

export const Terms = () => (
  <div className="max-w-3xl mx-auto px-4 py-20">
    <h1 className="text-3xl font-black mb-10">Terms of Service</h1>
    <div className="prose prose-slate max-w-none text-slate-500 text-sm space-y-6">
      <p>1. <strong>Penggunaan Layanan:</strong> Layanan XTE Premium menyediakan akses ke akun digital. Anda setuju untuk tidak menyalahgunakan akun yang diberikan.</p>
      <p>2. <strong>Pembayaran:</strong> Semua transaksi yang sudah diproses dan mendapatkan status "Settlement" tidak dapat dibatalkan atau direfund.</p>
      <p>3. <strong>Garansi:</strong> Garansi berlaku hanya untuk masalah login atau kegagalan fitur premium. Garansi hangus jika user mengubah password atau email akun.</p>
      <p>4. <strong>Kebijakan Akun:</strong> Satu akun premium hanya diperbolehkan digunakan sesuai kapasitas yang ditentukan (biasanya 1 device).</p>
    </div>
  </div>
);

export const Privacy = () => (
  <div className="max-w-3xl mx-auto px-4 py-20">
    <h1 className="text-3xl font-black mb-10">Privacy Policy</h1>
    <div className="text-slate-500 text-sm space-y-4">
      <p>Kami menghormati privasi Anda. Data yang kami kumpulkan hanyalah data transaksi yang diperlukan untuk memproses pesanan Anda.</p>
      <p>Kami tidak menyimpan detail kartu kredit atau informasi sensitif lainnya. Semua pembayaran diproses melalui gateway pihak ketiga yang aman.</p>
    </div>
  </div>
);
