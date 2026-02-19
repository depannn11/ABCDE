
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppProduct, Order, OrderStatus } from '../types';
import { mockDb } from '../services/mockData';

const BuyProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AppProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (productId) {
      Promise.all([
        mockDb.getProduct(productId),
        mockDb.getAvailableAccountsCount(productId)
      ]).then(([p, s]) => {
        if (p) setProduct(p);
        setStock(s);
        setLoading(false);
      });
    }
  }, [productId]);

  // Expiry Timer
  useEffect(() => {
    if (order && order.status === OrderStatus.PENDING && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && order && order.status === OrderStatus.PENDING) {
        setOrder(prev => prev ? { ...prev, status: OrderStatus.EXPIRED } : null);
    }
  }, [order, timeLeft]);

  /**
   * STEP 3: Polling Status logic
   */
  useEffect(() => {
    let interval: any;
    if (order && order.status === OrderStatus.PENDING) {
      interval = setInterval(async () => {
        const currentStatus = await mockDb.getOrderStatus(order.order_id);
        
        if (currentStatus === OrderStatus.SETTLEMENT) {
          try {
            const delivered = await mockDb.setOrderSettled(order.order_id);
            setOrder(prev => prev ? { ...prev, status: OrderStatus.SETTLEMENT } : null);
            setAccounts(delivered);
            clearInterval(interval);
          } catch (err) {
            console.error("Settlement processing error:", err);
          }
        } else if (currentStatus === OrderStatus.EXPIRED) {
          setOrder(prev => prev ? { ...prev, status: OrderStatus.EXPIRED } : null);
          clearInterval(interval);
        }
      }, 5000); // Poll every 5 seconds as requested
    }
    return () => clearInterval(interval);
  }, [order]);

  const handleBuy = async () => {
    if (!product) return;
    if (quantity > stock) return alert("Maaf, stok saat ini tidak mencukupi permintaan Anda.");
    
    setIsProcessing(true);
    try {
      const newOrder = await mockDb.createOrder(product.id, quantity, product.price * quantity);
      setOrder(newOrder);
      setTimeLeft(600);
    } catch (err) {
      alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Visual feedback instead of alert for better UX
    const feedback = document.createElement('div');
    feedback.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-[999]';
    feedback.innerText = 'BERHASIL DISALIN';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  };

  const handleDownloadTxt = () => {
    const content = accounts.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `XTE_INVOICE_${order?.order_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Inisialisasi Sesi...</div>
    </div>
  );
  
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-black">PRODUK TIDAK DITEMUKAN</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-3 text-slate-400 hover:text-zinc-900 transition-all mb-12 text-xs font-black uppercase tracking-widest group">
          <i className="fas fa-chevron-left text-[8px] group-hover:-translate-x-1 transition-transform"></i> Kembali ke Katalog
        </button>

        {!order ? (
          <div className="bg-white rounded-[48px] p-8 md:p-14 border border-slate-100 shadow-2xl shadow-slate-200/40 grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="space-y-8">
                <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-inner group">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Product Details</div>
                    <h1 className="text-4xl font-black text-zinc-900 mb-4">{product.name}</h1>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{product.description}</p>
                </div>
             </div>
             
             <div className="flex flex-col justify-between pt-4">
                <div className="space-y-10">
                   <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-6 ml-1">Kuantitas Akun</label>
                      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                         <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 bg-slate-50 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-90"><i className="fas fa-minus text-xs"></i></button>
                         <span className="text-3xl font-black text-zinc-900">{quantity}</span>
                         <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} className="w-14 h-14 bg-slate-50 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-90"><i className="fas fa-plus text-xs"></i></button>
                      </div>
                      <div className="mt-6 px-2 flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tersedia: {stock} Akun</span>
                         <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">Rp {product.price.toLocaleString('id-ID')} / unit</span>
                      </div>
                   </div>

                   <div className="p-10 bg-zinc-900 rounded-[40px] text-white shadow-3xl shadow-zinc-200 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 block mb-2 relative z-10">Total Investasi</span>
                      <div className="text-5xl font-black relative z-10">Rp {(product.price * quantity).toLocaleString('id-ID')}</div>
                   </div>
                </div>

                <button 
                  onClick={handleBuy} 
                  disabled={stock === 0 || isProcessing} 
                  className="w-full py-7 bg-zinc-900 text-white rounded-[28px] font-black shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all uppercase tracking-[0.3em] text-xs mt-12 disabled:opacity-20 flex items-center justify-center gap-4 active:scale-[0.98]"
                >
                   {isProcessing ? (
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <>Lanjut Pembayaran <i className="fas fa-chevron-right text-[10px]"></i></>
                   )}
                </button>
             </div>
          </div>
        ) : order.status === OrderStatus.PENDING ? (
          <div className="bg-white rounded-[56px] p-8 md:p-20 border border-slate-100 shadow-2xl text-center animate-in zoom-in-95 duration-500">
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-[10px] font-black uppercase tracking-widest text-amber-600 mb-6">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Menunggu Pembayaran
                </div>
                <h2 className="text-4xl font-black mb-3">Selesaikan di Perangkat Anda</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">Scan QRIS menggunakan aplikasi e-wallet atau perbankan favorit Anda</p>
              </div>

              <div className="max-w-[340px] mx-auto bg-white p-8 border-[12px] border-zinc-900 rounded-[64px] shadow-3xl relative mb-14 hover:scale-[1.02] transition-transform duration-500">
                  <img src={order.qr_url} className="w-full h-auto rounded-xl" alt="QRIS Code" />
                  <div className="absolute -bottom-6 -right-6 bg-zinc-900 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl border-[8px] border-white">
                      <span className="text-lg font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                      <span className="text-[7px] font-black uppercase opacity-50 tracking-tighter">Sisa Waktu</span>
                  </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 max-w-xl mx-auto">
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex-grow text-left">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Total Transfer</span>
                      <span className="text-3xl font-black text-zinc-900">Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex-grow text-left">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Invoice ID</span>
                      <span className="text-xl font-black text-zinc-400 tracking-tight">#{order.order_id}</span>
                  </div>
              </div>

              <div className="p-8 bg-zinc-50 rounded-[32px] border border-zinc-100 text-left max-w-lg mx-auto flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><i className="fas fa-info-circle text-zinc-400 text-xl"></i></div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Sistem kami melakukan pengecekan setiap 5 detik secara otomatis. Mohon jangan menutup atau merefresh halaman ini hingga proses selesai.
                  </p>
              </div>
          </div>
        ) : order.status === OrderStatus.SETTLEMENT ? (
          <div className="bg-white rounded-[56px] p-8 md:p-20 border border-slate-100 shadow-2xl text-center animate-in zoom-in-95 duration-500">
              <div className="w-32 h-32 bg-zinc-900 text-white rounded-[40px] flex items-center justify-center mx-auto mb-10 text-5xl shadow-3xl shadow-zinc-100 animate-bounce">
                  <i className="fas fa-check"></i>
              </div>
              <h2 className="text-4xl font-black mb-4">Transaksi Berhasil!</h2>
              <p className="text-slate-400 text-sm mb-16 font-medium">Akun Anda telah tersedia di bawah ini. Silakan salin atau simpan.</p>

              <div className="max-w-xl mx-auto space-y-4 mb-16">
                 <div className={`space-y-4 pr-3 ${accounts.length > 5 ? 'max-h-[440px] overflow-y-auto scrollbar-thin' : ''}`}>
                    {accounts.map((acc, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:border-zinc-300 transition-all duration-300 group">
                           <div className="text-left">
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2">Login Credentials #{i+1}</span>
                               <code className="text-zinc-900 font-bold text-base tracking-tight">{acc}</code>
                           </div>
                           <button 
                             onClick={() => copyToClipboard(acc)} 
                             className="w-14 h-14 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-zinc-900 hover:border-zinc-900 hover:shadow-lg transition-all flex items-center justify-center group-active:scale-90"
                             title="Salin ke Clipboard"
                           >
                               <i className="fas fa-copy"></i>
                           </button>
                        </div>
                    ))}
                 </div>
                 
                 {accounts.length > 5 && (
                    <button 
                      onClick={handleDownloadTxt} 
                      className="w-full py-6 bg-zinc-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-zinc-100 hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 mt-8"
                    >
                        <i className="fas fa-file-download text-sm"></i> Download All Accounts (.TXT)
                    </button>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <button 
                   onClick={() => navigate('/')} 
                   className="px-12 py-5 bg-slate-100 text-slate-500 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Kembali ke Beranda
                 </button>
                 <Link 
                   to="/tutorial" 
                   className="px-12 py-5 bg-zinc-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-3"
                 >
                   Cara Login Akun <i className="fas fa-arrow-right text-[8px]"></i>
                 </Link>
              </div>
          </div>
        ) : (
          <div className="bg-white rounded-[56px] p-20 border border-slate-100 shadow-2xl text-center">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-4xl">
                  <i className="fas fa-hourglass-end"></i>
              </div>
              <h2 className="text-3xl font-black mb-4">Sesi Pembayaran Berakhir</h2>
              <p className="text-slate-400 text-sm mb-12 font-medium">Maaf, waktu pembayaran Anda telah habis. Silakan buat pesanan baru.</p>
              <button 
                onClick={() => setOrder(null)} 
                className="px-12 py-5 bg-zinc-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-zinc-800 transition-all"
              >
                Ulangi Pemesanan
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyProduct;
