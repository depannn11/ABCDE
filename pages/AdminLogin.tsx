
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../services/mockData';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const isValid = await mockDb.verifyAdmin(username, password);
      
      if (isValid) {
        localStorage.setItem('admin_session', 'true');
        navigate('/adm/dashboard');
      } else {
        alert('Kredensial salah atau tidak ditemukan di database.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghubungi database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
           <div className="w-20 h-20 bg-zinc-900 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-white text-2xl font-black shadow-2xl shadow-zinc-200">X</div>
           <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
           <p className="text-slate-400 text-sm font-medium tracking-wide">Akses terbatas untuk administrator</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-bold text-sm"
              placeholder="Username admin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-bold text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Login ke Dashboard <i className="fas fa-chevron-right text-[10px]"></i></>
            )}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Aplikasi Premium by XTE &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
