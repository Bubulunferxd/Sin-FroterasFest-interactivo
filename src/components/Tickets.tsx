import { useState } from 'react';
import { Check, Crown, Sparkles, Star, Armchair } from 'lucide-react';
import { tickets } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SeatSelector } from '@/components/SeatSelector';
import type { Product, Seat } from '@/types';

const tierStyles = [
  {
    icon: Crown,
    border: 'border-pink-500/40',
    glow: 'shadow-[0_0_50px_-15px_rgba(236,72,153,0.3)]',
    badge: 'bg-pink-500 text-black',
    button: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    priceColor: 'text-pink-400',
    accent: 'text-pink-400',
    dot: 'bg-pink-500',
    hoverBorder: 'hover:border-pink-500/60 hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.4)]',
  },
  {
    icon: Sparkles,
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_50px_-15px_rgba(245,158,11,0.3)]',
    badge: 'bg-amber-500 text-black',
    button: 'bg-gradient-to-r from-amber-500 to-orange-600 text-black',
    priceColor: 'text-amber-400',
    accent: 'text-amber-400',
    dot: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-500/60 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]',
  },
  {
    icon: Star,
    border: 'border-teal-500/40',
    glow: 'card-glow-teal',
    badge: 'bg-teal-500 text-black',
    button: 'gradient-teal text-black',
    priceColor: 'text-teal-400',
    accent: 'text-teal-400',
    dot: 'bg-teal-500',
    hoverBorder: 'hover-glow-teal',
  },
];

export function Tickets() {
  const { addTicketsWithSeats } = useCart();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const [seatSelectorProduct, setSeatSelectorProduct] = useState<Product | null>(null);

  const handleSelectSeats = (product: Product) => {
    setSeatSelectorProduct(product);
  };

  const handleConfirmSeats = (seats: Seat[]) => {
    if (seatSelectorProduct) {
      addTicketsWithSeats(seatSelectorProduct, seats);
    }
    setSeatSelectorProduct(null);
  };

  return (
    <section id="tickets" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full neon-blob-teal blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className={`text-center mb-14 reveal ${visible ? 'reveal-visible' : ''}`} ref={ref}>
          <span className="text-neon-teal text-sm font-bold tracking-widest uppercase">Entradas</span>
          <h2 className="font-display text-5xl sm:text-6xl mt-2 mb-3">
            ELIGE TU <span className="gradient-text-neon">EXPERIENCIA</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Selecciona tu tipo de entrada y elige tus asientos en el mapa interactivo. Pago con criptoactivos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tickets.map((ticket, index) => {
            const style = tierStyles[index];
            const Icon = style.icon;

            return (
              <div
                key={ticket.id}
                className={`relative rounded-2xl glass-strong border ${style.border} ${style.glow} ${style.hoverBorder} card-shine p-6 lg:p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group reveal ${visible ? 'reveal-visible' : ''}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {ticket.badge && (
                  <div className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold tracking-wider ${style.badge}`}>
                    {ticket.badge}
                  </div>
                )}

                <div className="relative h-44 rounded-xl overflow-hidden mb-6">
                  <img
                    src={ticket.image}
                    alt={ticket.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className={`absolute bottom-3 left-3 w-10 h-10 rounded-lg flex items-center justify-center ${style.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2">{ticket.name}</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">{ticket.description}</p>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-5xl ${style.priceColor}`}>${ticket.price}</span>
                    <span className="text-gray-500 text-sm">/entrada</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {ticket.perks?.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className={`mt-0.5 w-4 h-4 rounded-full ${style.dot} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectSeats(ticket)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] ${style.button}`}
                >
                  <Armchair className="w-4 h-4" />
                  Elegir asientos
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {seatSelectorProduct && (
        <SeatSelector
          product={seatSelectorProduct}
          onClose={() => setSeatSelectorProduct(null)}
          onConfirm={handleConfirmSeats}
        />
      )}
    </section>
  );
}
