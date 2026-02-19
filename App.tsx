
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import BuyProduct from './pages/BuyProduct';
import TutorialPage from './pages/Tutorial';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { FAQ, Terms, Privacy } from './pages/Legal';
import { APP_NAME, NAVIGATION, SUPPORT_WA, SUPPORT_EMAIL } from './constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-lg shadow-zinc-200">
            <span className="text-white text-xs font-bold">X</span>
          </div>
          {APP_NAME}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {NAVIGATION.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`text-sm font-medium transition-all ${location.pathname === item.path ? 'text-zinc-900 underline underline-offset-8' : 'text-slate-500 hover:text-zinc-900'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
            <Link to="/adm/login/jir" className="text-[10px] text-slate-300 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors">Admin Area</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-500 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {NAVIGATION.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="flex items-center gap-4 text-slate-600 font-semibold py-2 text-lg"
              onClick={() => setIsOpen(false)}
            >
              <span className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-zinc-900 border border-slate-100">
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-16 px-4 mt-20">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">X</span>
            </div>
            <span className="font-bold tracking-tight">{APP_NAME}</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Platform otomatisasi penyedia layanan premium terbaik di Indonesia. Memberikan kualitas tanpa kompromi untuk kebutuhan kreatif Anda.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-zinc-900">Perusahaan</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link to="/terms" className="hover:text-zinc-900 transition-colors">Syarat & Ketentuan</Link></li>
            <li><Link to="/privacy" className="hover:text-zinc-900 transition-colors">Kebijakan Privasi</Link></li>
            <li><Link to="/faq" className="hover:text-zinc-900 transition-colors">Pertanyaan Umum</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-zinc-900">Bantuan</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href={`https://wa.me/${SUPPORT_WA}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">WhatsApp Support</a></li>
            <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-zinc-900 transition-colors">Email Admin</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium">
        <div>&copy; {new Date().getFullYear()} {APP_NAME}. Powering Digital Creativity.</div>
        <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900"><i className="fab fa-instagram text-base"></i></a>
            <a href="#" className="hover:text-zinc-900"><i className="fab fa-twitter text-base"></i></a>
            <a href="#" className="hover:text-zinc-900"><i className="fab fa-facebook text-base"></i></a>
        </div>
      </div>
    </div>
  </footer>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col selection:bg-zinc-900 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/buy/:productId" element={<BuyProduct />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/adm/login/jir" element={<AdminLogin />} />
            <Route path="/adm/dashboard" element={<AdminDashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
