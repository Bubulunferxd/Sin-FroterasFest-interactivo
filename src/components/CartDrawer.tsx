import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, Armchair } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const WHATSAPP_NUMBER = '+591 63232494';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    totalPrice,
    totalItems,
    openCheckout,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />
      <div className="relative w-full max-w-md h-full glass-strong border-l border-teal-500/15 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-teal-500/15">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold">
              Tus Tickets {totalItems > 0 && `(${totalItems})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium mb-1">No tienes tickets seleccionados</p>
            <p className="text-sm text-gray-600">Elige tus asientos para empezar tu compra.</p>
            <button
              onClick={closeCart}
              className="mt-6 px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-colors"
            >
              Ver tickets
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 border border-teal-500/5 animate-scale-in"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d1a26]">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-teal-400 font-semibold uppercase tracking-wide">
                          Ticket
                        </p>
                        <h4 className="text-sm font-bold truncate">{item.product.name}</h4>
                        {item.seats && item.seats.length > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Armchair className="w-3 h-3 text-teal-400" />
                            <p className="text-xs text-teal-400 font-medium">
                              {item.seats.map((s) => s.label).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {item.seats ? `${item.seats.length} asiento${item.seats.length !== 1 ? 's' : ''}` : `${item.quantity} entrada${item.quantity !== 1 ? 's' : ''}`}
                      </span>
                      <span className="font-display text-lg text-teal-400">
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp contact */}
            <div className="px-4 pb-2">
              <a
                href="https://wa.me/59163232494"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15 hover:bg-green-500/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-400">WhatsApp de informacion</p>
                  <p className="text-xs text-gray-400">{WHATSAPP_NUMBER}</p>
                </div>
              </a>
            </div>

            <div className="border-t border-teal-500/15 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${totalPrice} USDT</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Cargo por servicio</span>
                <span className="text-green-400">Gratis</span>
              </div>
              <div className="h-px bg-teal-500/10" />
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-display text-3xl text-teal-400">${totalPrice} <span className="text-sm">USDT</span></span>
              </div>

              <button
                onClick={openCheckout}
                className="w-full py-4 rounded-xl gradient-teal text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-teal-500/20"
              >
                Pagar con cripto
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
