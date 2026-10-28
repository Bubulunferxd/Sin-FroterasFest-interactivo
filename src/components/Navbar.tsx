import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const links = [
  { label: 'Tickets', href: '#tickets' },
  { label: 'Artistas', href: '#artists' },
  { label: 'Autografos', href: '#autografos' },
  { label: 'Info', href: '#info' },
];

export function Navbar() {
  const { totalItems, openCart, lastAdded } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!lastAdded) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [lastAdded]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="w-7 h-7 text-teal-400 group-hover:scale-110 transition-transform" fill="currentColor" />
              <div className="absolute inset-0 blur-md bg-teal-500/40 -z-10" />
            </div>
            <span className="font-display text-xl sm:text-2xl tracking-wider">
              SINFRONTERAS<span className="text-neon-teal animate-neon-flicker">FEST</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-teal-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20 ${
                bump ? 'animate-bounce-in' : ''
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold">Tickets</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full gradient-teal text-white text-xs font-bold flex items-center justify-center animate-pop-in" style={{ boxShadow: '0 0 10px rgba(45, 212, 191, 0.6)' }}>
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/5"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="flex flex-col gap-2 glass rounded-xl p-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
