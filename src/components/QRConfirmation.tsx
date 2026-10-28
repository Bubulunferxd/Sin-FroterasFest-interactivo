import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X, CheckCircle2, Download, Calendar, Clock, MapPin,
  Ticket, Armchair, User, Hash, Users, Sparkles, Zap,
  Bitcoin, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { IndividualTicket } from '@/types';

const zoneLabels: Record<string, string> = {
  vip: 'VIP Experience',
  platinum: 'Platinum Access',
  general: 'General Admission',
};

const zoneColors: Record<string, string> = {
  vip: 'text-pink-400',
  platinum: 'text-amber-400',
  general: 'text-teal-400',
};

const zoneBadgeBg: Record<string, string> = {
  vip: 'bg-pink-500/15 border-pink-400/30 text-pink-300',
  platinum: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
  general: 'bg-teal-500/15 border-teal-400/30 text-teal-300',
};

const zoneGlow: Record<string, string> = {
  vip: 'shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)]',
  platinum: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
  general: 'shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)]',
};

export function QRConfirmation() {
  const { orderResult, dismissOrder } = useCart();
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const [currentTicket, setCurrentTicket] = useState(0);

  useEffect(() => {
    if (!orderResult) return;
    orderResult.tickets.forEach((ticket: IndividualTicket, index: number) => {
      const canvas = canvasRefs.current.get(ticket.id);
      if (!canvas) return;

      const qrData = JSON.stringify({
        ticketCode: ticket.ticket_code,
        seat: ticket.seat_label,
        zone: ticket.zone,
        holder: ticket.holder_name,
        event: 'SinfronterasFest 2026',
        date: '2026-12-15',
        time: '20:00',
        location: 'La Paz, Bolivia',
        status: ticket.status,
      });

      QRCode.toCanvas(canvas, qrData, {
        width: 200,
        margin: 1,
        color: { dark: '#050b12', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }).catch(() => {});
    });
  }, [orderResult]);

  useEffect(() => {
    if (orderResult) setCurrentTicket(0);
  }, [orderResult]);

  if (!orderResult) return null;

  const tickets = orderResult.tickets;
  const ticket = tickets[currentTicket];
  const totalPeople = tickets.length;
  const zone = ticket?.zone || 'general';
  const zoneLabel = zoneLabels[zone] || 'General';
  const zoneColor = zoneColors[zone] || zoneColors.general;
  const zoneBadge = zoneBadgeBg[zone] || zoneBadgeBg.general;
  const glow = zoneGlow[zone] || zoneGlow.general;

  const handleDownload = () => {
    const canvas = canvasRefs.current.get(ticket.id);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sinfronterasfest-${ticket.ticket_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadAll = () => {
    tickets.forEach((t, i) => {
      setTimeout(() => {
        const canvas = canvasRefs.current.get(t.id);
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `sinfronterasfest-${t.ticket_code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }, i * 300);
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 bg-[#050b12]/90 backdrop-blur-xl animate-fade-in" />
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow ${
        zone === 'vip' ? 'bg-pink-500/10' : zone === 'platinum' ? 'bg-amber-500/10' : 'neon-blob-teal'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow`} style={{ animationDelay: '1.5s' }} />

      {/* Close button */}
      <button
        onClick={dismissOrder}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-400 hover:text-teal-300 transition-colors neon-border"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-2xl my-4 animate-scale-in">
        {/* ============ TICKET CARD ============ */}
        <div className={`relative rounded-3xl overflow-hidden card-glow-strong neon-border-strong bg-[#0a1620] ${glow}`}>

          {/* ===== TOP SECTION ===== */}
          <div className="relative bg-gradient-to-br from-[#0d2630] to-[#0a1620] px-6 sm:px-10 pt-8 pb-6 overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className={`absolute top-0 left-0 w-full h-1 ${
              zone === 'vip' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
              zone === 'platinum' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
              'gradient-neon'
            }`} />
            <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl ${
              zone === 'vip' ? 'bg-pink-500/10' : zone === 'platinum' ? 'bg-amber-500/10' : 'neon-blob-teal'
            }`} />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-teal-400" fill="currentColor" />
                <span className="font-display text-xl tracking-wider text-white">
                  SINFRONTERAS<span className="text-neon-teal animate-neon-flicker">FEST</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-400/30">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-300 uppercase tracking-wider">Pago confirmado</span>
              </div>
            </div>

            <div className="relative mt-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                zone === 'vip' ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/30' :
                zone === 'platinum' ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' :
                'gradient-neon shadow-teal-500/30'
              }`}>
                <Ticket className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl text-white leading-none">TICKET {currentTicket + 1}/{tickets.length}</h2>
                <p className="text-sm text-gray-400 mt-1">Pago con cripto confirmado. Preséntalo en la entrada.</p>
              </div>
            </div>
          </div>

          {/* ===== MIDDLE: Info + QR ===== */}
          {ticket && (
            <div className="relative px-6 sm:px-10 py-6">
              <div className="neon-line mb-6" />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                {/* Info grid */}
                <div className="sm:col-span-3 space-y-4">
                  <div className="flex items-center gap-3 animate-detail" style={{ animationDelay: '0.1s' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${zoneBadge}`}>
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Codigo de ticket</p>
                      <p className={`font-display text-lg tracking-wider ${zoneColor}`}>{ticket.ticket_code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 animate-detail" style={{ animationDelay: '0.15s' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${zoneBadge}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Titular</p>
                      <p className="text-sm font-bold text-white truncate">{ticket.holder_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 animate-detail" style={{ animationDelay: '0.2s' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${zoneBadge}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Zona</p>
                      <span className={`text-sm font-bold ${zoneColor}`}>{zoneLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 animate-detail" style={{ animationDelay: '0.25s' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${zoneBadge}`}>
                      <Armchair className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Asiento</p>
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white text-sm font-bold">
                        {ticket.seat_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="sm:col-span-2 flex flex-col items-center justify-center">
                  <div className="relative p-3 rounded-2xl bg-white border-2 border-teal-400/40 shadow-lg shadow-teal-500/20">
                    <div className="absolute -inset-1 rounded-2xl bg-teal-500/20 blur-md -z-10 animate-pulse-glow" />
                    <canvas ref={(el) => { if (el) canvasRefs.current.set(ticket.id, el); }} />
                  </div>
                  <p className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest text-center">
                    Escanea en la entrada
                  </p>
                </div>
              </div>

              {/* Perforation */}
              <div className="relative my-6">
                <div className="ticket-notch-left absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#050b12] z-10" />
                <div className="ticket-notch-right absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#050b12] z-10" />
                <div className="perforated-line" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-400/15 p-3 text-center animate-detail" style={{ animationDelay: '0.35s' }}>
                  <Users className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Total entradas</p>
                  <p className="font-display text-2xl text-neon-teal mt-0.5">{totalPeople}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-400/15 p-3 text-center animate-detail" style={{ animationDelay: '0.4s' }}>
                  <Bitcoin className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Pagado</p>
                  <p className="font-display text-2xl text-amber-400 mt-0.5">{orderResult.total}</p>
                  <p className="text-[10px] text-gray-500">USDT</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-pink-500/5 to-transparent border border-pink-400/15 p-3 text-center animate-detail" style={{ animationDelay: '0.45s' }}>
                  <Calendar className="w-5 h-5 text-pink-400 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Fecha</p>
                  <p className="font-display text-xl text-white mt-0.5">15 DIC</p>
                  <p className="text-[10px] text-gray-500">2026</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-400/15 p-3 text-center animate-detail" style={{ animationDelay: '0.5s' }}>
                  <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Hora</p>
                  <p className="font-display text-xl text-white mt-0.5">8:00</p>
                  <p className="text-[10px] text-gray-500">PM</p>
                </div>
              </div>

              {/* Location */}
              <div className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500/5 border border-teal-400/10 animate-detail" style={{ animationDelay: '0.55s' }}>
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300 font-medium">La Paz, Bolivia</span>
                <span className="w-1 h-1 rounded-full bg-teal-400/50" />
                <span className="text-xs text-gray-500">SinfronterasFest 2026</span>
              </div>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="relative px-6 sm:px-10 py-5 bg-gradient-to-b from-[#0a1620] to-[#050b12] border-t border-teal-400/10">
            {/* Ticket navigation */}
            {tickets.length > 1 && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setCurrentTicket((p) => Math.max(0, p - 1))}
                  disabled={currentTicket === 0}
                  className="p-2 rounded-lg glass border border-teal-400/20 text-gray-400 hover:text-teal-400 transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5">
                  {tickets.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setCurrentTicket(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === currentTicket ? 'bg-teal-400 scale-125' : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentTicket((p) => Math.min(tickets.length - 1, p + 1))}
                  disabled={currentTicket === tickets.length - 1}
                  className="p-2 rounded-lg glass border border-teal-400/20 text-gray-400 hover:text-teal-400 transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl glass border border-teal-400/20 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-teal-500/10 hover:border-teal-400/40 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </button>
              {tickets.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex-1 py-3.5 rounded-xl glass border border-amber-400/20 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/10 hover:border-amber-400/40 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Descargar todos
                </button>
              )}
              <button
                onClick={dismissOrder}
                className="flex-1 py-3.5 rounded-xl gradient-neon text-black font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-teal-500/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                Listo
              </button>
            </div>
            <p className="mt-3 text-[11px] text-gray-600 text-center">
              Pago confirmado con criptoactivos via Binance Pay
            </p>
          </div>

          <div className={`h-1 ${
            zone === 'vip' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
            zone === 'platinum' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
            'gradient-neon'
          }`} />
        </div>
      </div>
    </div>
  );
}
