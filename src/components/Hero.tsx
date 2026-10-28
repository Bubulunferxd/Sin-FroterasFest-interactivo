import { Calendar, MapPin, Clock, ArrowDown, Sparkles, Music2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/38780313/pexels-photo-38780313.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b12]/85 via-[#050b12]/65 to-[#050b12]" />
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Multi-color neon blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '0.8s' }} />

      <div className="absolute top-0 left-0 right-0 h-px neon-line" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border mb-6 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(45, 212, 191, 0.8)' }} />
          <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">Festival en vivo 2026</span>
          <Sparkles className="w-3 h-3 text-teal-400" />
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="block text-white text-glow-strong">SINFRONTERAS</span>
          <span className="block gradient-text-neon animate-shimmer">FEST</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Bad Bunny, Grupo Frontera y C.R.O en una sola noche. Luces, sonido y pura adrenalina.
        </p>

        {/* Artist names with colors */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <span className="font-display text-lg tracking-wider text-pink-400 text-glow" style={{ textShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}>
            BAD BUNNY
          </span>
          <span className="text-gray-600">|</span>
          <span className="font-display text-lg tracking-wider text-amber-400" style={{ textShadow: '0 0 15px rgba(245, 158, 11, 0.5)' }}>
            GRUPO FRONTERA
          </span>
          <span className="text-gray-600">|</span>
          <span className="font-display text-lg tracking-wider text-teal-400 text-neon-teal">
            C.R.O
          </span>
        </div>

        {/* Event details */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 text-gray-200">
            <Calendar className="w-5 h-5 text-teal-400" style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.6))' }} />
            <span className="text-sm font-medium">15 Dic 2026</span>
          </div>
          <div className="w-px h-5 bg-teal-400/30" />
          <div className="flex items-center gap-2 text-gray-200">
            <Clock className="w-5 h-5 text-teal-400" style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.6))' }} />
            <span className="text-sm font-medium">8:00 PM</span>
          </div>
          <div className="w-px h-5 bg-teal-400/30" />
          <div className="flex items-center gap-2 text-gray-200">
            <MapPin className="w-5 h-5 text-teal-400" style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.6))' }} />
            <span className="text-sm font-medium">La Paz</span>
          </div>
        </div>

        {/* CTA */}
        <a
          href="#tickets"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-neon text-black font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-lg shadow-teal-500/40 animate-slide-up neon-border-strong"
          style={{ animationDelay: '0.4s' }}
        >
          <Music2 className="w-5 h-5" />
          Comprar Tickets
          <ArrowDown className="w-5 h-5" />
        </a>

        {/* Crypto payment note */}
        <p className="mt-4 text-xs text-gray-500 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          Pago con criptoactivos via Binance Pay (USDT)
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <ArrowDown className="w-6 h-6 text-teal-400/50" />
      </div>
    </section>
  );
}
