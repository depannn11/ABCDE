
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppProduct, Account, AccountStatus, Tutorial, Order } from '../types';
import { mockDb } from '../services/mockData';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'apps' | 'accounts' | 'tutorials' | 'history'>('apps');
  const [apps, setApps] = useState<AppProduct[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [showAppModal, setShowAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPrice, setNewAppPrice] = useState(0);
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppImage, setNewAppImage] = useState<string>('');
  
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const [showTutModal, setShowTutModal] = useState(false);
  const [tutTitle, setTutTitle] = useState('');
  const [tutDesc, setTutDesc] = useState('');
  const [tutVideo, setTutVideo] = useState('');

  const [selectedApp, setSelectedApp] = useState('');
  const [bulkInput, setBulkInput] = useState('');

  const refreshData = async () => {
    const [p, t, o] = await Promise.all([
      mockDb.getProducts(),
      mockDb.getTutorials(),
      mockDb.getAllOrders()
    ]);
    setApps(p);
    setTutorials(t);
    setOrders(o);
  };

  useEffect(() => {
    if (!localStorage.getItem('admin_session')) navigate('/adm/login/jir');
    refreshData();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAppImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !bulkInput) return;

    const lines = bulkInput.split('\n').filter(l => l.trim() !== '');
    const accountsToAdd = lines.map(line => {
      const separator = line.includes(':') ? ':' : '|';
      const [u, p] = line.split(separator);
      return { email: u?.trim(), pass: p?.trim() };
    }).filter(acc => acc.email && acc.pass);

    if (accountsToAdd.length === 0) {
      alert('Format input salah. Gunakan format email:password per baris.');
      return;
    }

    await mockDb.addAccountsBulk(selectedApp, accountsToAdd);
    alert(`${accountsToAdd.length} Akun berhasil ditambahkan ke database!`);
    setBulkInput('');
    refreshData();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || newAppPrice <= 0) return;
    const id = newAppName.toLowerCase().replace(/\s+/g, '-');
    
    await mockDb.addApp({
        id, 
        name: newAppName, 
        price: newAppPrice, 
        description: newAppDesc,
        image: newAppImage || `https://picsum.photos/seed/${id}/400/400`
    });

    setNewAppName(''); 
    setNewAppPrice(0); 
    setNewAppDesc(''); 
    setNewAppImage('');
    setShowAppModal(false);
    refreshData();
  };

  const handleAddTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutTitle) return;
    await mockDb.addTutorial({
        id: Math.random().toString(), title: tutTitle, description: tutDesc, video_url: tutVideo
    });
    setTutTitle(''); setTutDesc(''); setTutVideo(''); setShowTutModal(false);
    refreshData();
  };

  const handleDeleteTutorial = async (id: string) => {
    if (confirm('Hapus tutorial ini?')) {
        await mockDb.deleteTutorial(id);
        refreshData();
    }
  };

  const handleUpdatePrice = async () => {
    if (editingAppId && editPrice > 0) {
      await mockDb.updateProduct(editingAppId, { price: editPrice });
      setEditingAppId(null);
      refreshData();
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-8 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">X</div>
            <span className="font-black text-sm tracking-tight">ADMIN PANEL</span>
        </div>
        
        <nav className="space-y-3 flex-grow">
          {[
            { id: 'apps', icon: 'fa-box', label: 'Produk' },
            { id: 'accounts', icon: 'fa-user-plus', label: 'Input Stok' },
            { id: 'history', icon: 'fa-history', label: 'Riwayat' },
            { id: 'tutorials', icon: 'fa-graduation-cap', label: 'Tutorial' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-900 text-white shadow-2xl shadow-zinc-200' : 'text-slate-400 hover:text-zinc-900 hover:bg-slate-50'}`}>
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </nav>
        
        <button onClick={logout} className="mt-8 px-5 py-4 text-left text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
            <i className="fas fa-sign-out-alt mr-4"></i> Keluar
        </button>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'apps' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black">Layanan Premium</h2>
                 <button onClick={() => setShowAppModal(true)} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all">+ Produk</button>
               </div>
               <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                     <tr><th className="px-8 py-6">Item</th><th className="px-8 py-6">Harga</th><th className="px-8 py-6 text-right">Aksi</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {apps.map(app => (
                       <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6 flex items-center gap-4">
                            <img src={app.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                            <span className="font-black text-zinc-900">{app.name}</span>
                         </td>
                         <td className="px-8 py-6">
                            {editingAppId === app.id ? (
                                <div className="flex items-center gap-2"><input type="number" value={editPrice} onChange={e => setEditPrice(parseInt(e.target.value))} className="w-24 p-2 bg-slate-50 border rounded-lg" /><button onClick={handleUpdatePrice} className="text-green-500"><i className="fas fa-check"></i></button></div>
                            ) : (
                                <span className="font-bold">Rp {app.price.toLocaleString('id-ID')}</span>
                            )}
                         </td>
                         <td className="px-8 py-6 text-right space-x-3">
                            <button onClick={() => { setEditingAppId(app.id); setEditPrice(app.price); }} className="text-slate-300 hover:text-zinc-900"><i className="fas fa-pen"></i></button>
                            <button onClick={async () => { if(confirm('Hapus?')) { await mockDb.deleteApp(app.id); refreshData(); }}} className="text-slate-300 hover:text-red-500"><i className="fas fa-trash"></i></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="max-w-2xl animate-in fade-in duration-500">
              <h2 className="text-3xl font-black mb-4">Bulk Input Stok</h2>
              <p className="text-slate-400 text-sm mb-10">Masukkan akun dalam jumlah banyak sekaligus. Gunakan format pemisah titik dua (:) atau pipa (|).</p>
              
              <form onSubmit={handleAddAccounts} className="bg-white p-10 rounded-[40px] border border-slate-200 space-y-6 shadow-xl shadow-slate-200/50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori Produk</label>
                    <select 
                      value={selectedApp} 
                      onChange={e => setSelectedApp(e.target.value)} 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-zinc-900 transition-all font-bold text-sm" 
                      required
                    >
                      <option value="">Pilih Aplikasi</option>
                      {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Data Akun (Bulk)</label>
                    <textarea 
                      value={bulkInput} 
                      onChange={e => setBulkInput(e.target.value)} 
                      className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 h-64 font-mono text-sm focus:ring-2 focus:ring-zinc-900 transition-all" 
                      placeholder={"user1@gmail.com:password123\nuser2@gmail.com:password456"} 
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={apps.length === 0 || !bulkInput.trim()} 
                    className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all disabled:opacity-30"
                  >
                    Simpan Semua Akun <i className="fas fa-cloud-upload-alt ml-2"></i>
                  </button>
              </form>
            </div>
          )}

          {/* history and tutorials remain unchanged */}
          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black mb-10">Riwayat Penjualan</h2>
              <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest"><tr><th className="px-8 py-6">Order ID</th><th className="px-8 py-6">Item</th><th className="px-8 py-6">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors"><td className="px-8 py-6 font-black">#{order.order_id}</td><td className="px-8 py-6 font-bold text-slate-500 uppercase">{order.app_id}</td><td className="px-8 py-6"><span className={`px-2 py-1 rounded-md font-black uppercase text-[9px] ${order.status === 'settlement' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{order.status}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tutorials' && (
             <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black">Panduan Belanja</h2><button onClick={() => setShowTutModal(true)} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ Tutorial</button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tutorials.map(tut => (
                        <div key={tut.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex justify-between items-start group hover:border-zinc-300 transition-all">
                            <div className="flex-grow"><div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-all"><i className="fas fa-play"></i></div><h3 className="font-black text-zinc-900 mb-2">{tut.title}</h3><p className="text-[11px] text-slate-400 line-clamp-2">{tut.description}</p></div>
                            <button onClick={() => handleDeleteTutorial(tut.id)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash-can"></i></button>
                        </div>
                    ))}
                </div>
             </div>
          )}
        </div>
      </main>

      {/* App Modal with Image Upload */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black">Informasi Produk</h3>
                    <button onClick={() => setShowAppModal(false)} className="text-slate-300 hover:text-zinc-900"><i className="fas fa-times text-xl"></i></button>
                </div>
                
                <form onSubmit={handleAddProduct} className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto Produk</label>
                        <div className="relative group">
                            <div className={`w-full aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${newAppImage ? 'border-zinc-900' : 'border-slate-200 group-hover:border-zinc-400'}`}>
                                {newAppImage ? (
                                    <div className="relative w-full h-full group">
                                        <img src={newAppImage} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => setNewAppImage('')} className="bg-white p-3 rounded-full text-red-500 shadow-xl"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8">
                                        <i className="fas fa-cloud-upload-alt text-4xl text-slate-200 mb-4"></i>
                                        <p className="text-xs font-bold text-slate-400">Klik atau seret gambar ke sini</p>
                                        <p className="text-[9px] text-slate-300 uppercase mt-2">Format: JPG, PNG (Max 2MB)</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Layanan</label>
                            <input type="text" placeholder="e.g. Alight Motion" className="w-full p-4 bg-slate-50 rounded-2xl border focus:ring-2 focus:ring-zinc-900 outline-none" value={newAppName} onChange={e => setNewAppName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Harga (Rp)</label>
                            <input type="number" placeholder="e.g. 15000" className="w-full p-4 bg-slate-50 rounded-2xl border focus:ring-2 focus:ring-zinc-900 outline-none" value={newAppPrice || ''} onChange={e => setNewAppPrice(parseInt(e.target.value))} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Produk</label>
                        <textarea placeholder="Jelaskan fitur premium yang didapat..." className="w-full p-4 bg-slate-50 rounded-2xl border h-24 focus:ring-2 focus:ring-zinc-900 outline-none resize-none" value={newAppDesc} onChange={e => setNewAppDesc(e.target.value)} required></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98]">
                        Simpan Layanan Premium
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Tutorial Modal stays same */}
      {showTutModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black mb-8">Buat Tutorial</h3>
                <form onSubmit={handleAddTutorial} className="space-y-5">
                    <input type="text" placeholder="Judul" className="w-full p-4 bg-slate-50 rounded-2xl border" value={tutTitle} onChange={e => setTutTitle(e.target.value)} required />
                    <input type="url" placeholder="Video URL" className="w-full p-4 bg-slate-50 rounded-2xl border" value={tutVideo} onChange={e => setTutVideo(e.target.value)} />
                    <textarea placeholder="Isi Panduan" className="w-full p-4 bg-slate-50 rounded-2xl border h-32" value={tutDesc} onChange={e => setTutDesc(e.target.value)} required></textarea>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowTutModal(false)} className="flex-grow py-4 bg-slate-100 rounded-2xl font-bold">Batal</button>
                        <button type="submit" className="flex-grow py-4 bg-zinc-900 text-white rounded-2xl font-bold">Terbitkan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
