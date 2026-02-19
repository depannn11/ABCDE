
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppProduct } from '../types';
import { mockDb } from '../services/mockData';

const Landing: React.FC = () => {
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockDb.getProducts().then(res => {
      setProducts(res);
      setLoading(false);
    });
  }, []);

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('products');
    if (element) {
      const offset = 80; // Offset for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-zinc-900 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Automated Delivery System
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
            Dapatkan Akses <br />
            <span className="text-slate-300">Premium Sekarang.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Platform terpercaya untuk beli akun digital. Bayar via QRIS, akun langsung muncul di layar Anda secara instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <button 
              onClick={scrollToProducts}
              className="px-12 py-5 bg-zinc-900 text-white rounded-2xl font-black shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[10px] active:scale-95"
            >
              Mulai Belanja
              <i className="fas fa-arrow-down text-[8px]"></i>
            </button>
            <Link 
              to="/tutorial" 
              className="px-12 py-5 bg-white text-zinc-900 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 active:scale-95"
            >
              Lihat Tutorial
              <i className="fas fa-play text-[8px]"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section id="products" className="px-4 py-32 bg-slate-50/50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">Shop our catalog</div>
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Pilih Layanan Anda</h2>
            </div>
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tersedia {products.length} Kategori
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[40px] p-8 border border-slate-100 animate-pulse h-96 shadow-sm"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map(product => (
                <div key={product.id} className="group bg-white rounded-[48px] p-10 border border-slate-100 hover:border-zinc-300 hover:shadow-3xl hover:shadow-slate-200/40 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                  <div className="w-full aspect-square bg-slate-50 rounded-[40px] mb-10 overflow-hidden border border-slate-100 shadow-inner">
                    <img src={product.image || 'https://picsum.photos/400/400?grayscale'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="flex-grow">
                      <h3 className="text-3xl font-black mb-4 group-hover:text-zinc-900 transition-colors tracking-tight">{product.name}</h3>
                      <p className="text-slate-400 text-sm mb-10 line-clamp-3 font-medium leading-relaxed">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                    <div>
                      <span className="text-[9px] text-slate-300 block uppercase tracking-[0.2em] font-black mb-1">Harga Satuan</span>
                      <span className="text-3xl font-black text-zinc-900">Rp {product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <Link 
                      to={`/buy/${product.id}`} 
                      className="w-16 h-16 rounded-[24px] bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 transition-all shadow-2xl shadow-zinc-100 hover:shadow-zinc-300 active:scale-90"
                    >
                      <i className="fas fa-shopping-cart text-lg"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[56px] border-2 border-dashed border-slate-100">
               <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200">
                   <i className="fas fa-cube text-4xl"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Belum Ada Produk</h3>
               <p className="text-slate-400 text-sm mt-4 font-medium">Administrator belum menambahkan produk ke dalam sistem.</p>
               <Link to="/adm/login/jir" className="inline-block mt-12 px-8 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Setup Store Now</Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-40 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 text-center">
          <div className="group">
            <div className="w-24 h-24 bg-slate-50 rounded-[36px] flex items-center justify-center mx-auto mb-10 group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-zinc-200 transition-all duration-500 shadow-sm border border-slate-100">
              <i className="fas fa-bolt-lightning text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black mb-4 text-zinc-900 tracking-tight">Pengiriman Kilat</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">Sistem kami bekerja 24 jam nonstop. Akun Anda dikirim otomatis tanpa menunggu admin.</p>
          </div>
          <div className="group">
            <div className="w-24 h-24 bg-slate-50 rounded-[36px] flex items-center justify-center mx-auto mb-10 group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-zinc-200 transition-all duration-500 shadow-sm border border-slate-100">
              <i className="fas fa-fingerprint text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black mb-4 text-zinc-900 tracking-tight">Aman & Terpercaya</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">Pembayaran terverifikasi via QRIS All Payment. Data Anda aman 100% bersama kami.</p>
          </div>
          <div className="group">
            <div className="w-24 h-24 bg-slate-50 rounded-[36px] flex items-center justify-center mx-auto mb-10 group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-zinc-200 transition-all duration-500 shadow-sm border border-slate-100">
              <i className="fas fa-crown text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black mb-4 text-zinc-900 tracking-tight">Kualitas Premium</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">Hanya menjual akun original dengan garansi penuh selama masa berlangganan.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
