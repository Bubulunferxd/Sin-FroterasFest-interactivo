import { useState, useEffect, useCallback } from 'react';
import { X, Armchair, Check, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Seat, Product } from '@/types';

interface SeatSelectorProps {
  product: Product;
  onClose: () => void;
  onConfirm: (seats: Seat[]) => void;
}

const zoneConfig: Record<string, {
  title: string;
  color: string;
  badge: string;
  seatBg: string;
  seatSelected: string;
  seatSold: string;
  rowColor: string;
}> = {
  vip: {
    title: 'Zona VIP',
    color: 'text-teal-300',
    badge: 'bg-teal-500 text-black',
    seatBg: 'bg-teal-500/15 border-teal-500/30 hover:bg-teal-500/30 hover:border-teal-500/60',
    seatSelected: 'bg-teal-500 text-black border-teal-400',
    seatSold: 'bg-red-500/10 border-red-500/20 cursor-not-allowed opacity-40',
    rowColor: 'text-teal-400',
  },
  platinum: {
    title: 'Zona Platinum',
    color: 'text-cyan-300',
    badge: 'bg-cyan-500 text-black',
    seatBg: 'bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/60',
    seatSelected: 'bg-cyan-500 text-black border-cyan-400',
    seatSold: 'bg-red-500/10 border-red-500/20 cursor-not-allowed opacity-40',
    rowColor: 'text-cyan-400',
  },
  general: {
    title: 'Zona General',
    color: 'text-sky-300',
    badge: 'bg-sky-500 text-black',
    seatBg: 'bg-sky-500/15 border-sky-500/30 hover:bg-sky-500/30 hover:border-sky-500/60',
    seatSelected: 'bg-sky-500 text-black border-sky-400',
    seatSold: 'bg-red-500/10 border-red-500/20 cursor-not-allowed opacity-40',
    rowColor: 'text-sky-400',
  },
};

export function SeatSelector({ product, onClose, onConfirm }: SeatSelectorProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const zone = product.zone || 'general';
  const config = zoneConfig[zone] || zoneConfig.general;
  const maxSeats = 6;

  useEffect(() => {
    let cancelled = false;
    async function loadSeats() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('seats')
          .select('id, zone, row_label, seat_number, label, status')
          .eq('zone', zone)
          .order('row_label', { ascending: true })
          .order('seat_number', { ascending: true });

        if (error) throw error;
        if (!cancelled) setSeats(data || []);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los asientos. Intenta de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSeats();
    return () => { cancelled = true; };
  }, [zone]);

  // Realtime subscription for seat status updates
  useEffect(() => {
    const channel = supabase
      .channel(`seats-${zone}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seats', filter: `zone=eq.${zone}` },
        (payload) => {
          const updated = payload.new as Seat;
          setSeats((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
          // If a seat we selected got sold by someone else, remove it
          setSelected((prev) => prev.filter((s) => s.id !== updated.id || updated.status === 'available'));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [zone]);

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === 'sold') return;
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= maxSeats) return prev;
      return [...prev, seat];
    });
  }, []);

  // Group seats by row
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});
  const rowLabels = Object.keys(rows).sort();

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto glass-strong rounded-2xl border border-teal-500/20 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-teal-500/15 sticky top-0 glass-strong z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.badge} flex items-center justify-center`}>
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Selecciona tus asientos</h2>
              <p className={`text-xs ${config.color}`}>{config.title} — ${product.price}/asiento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-md border ${config.seatBg}`} />
              <span className="text-gray-400">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-md border ${config.seatSelected}`} />
              <span className="text-gray-400">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-md border ${config.seatSold}`} />
              <span className="text-gray-400">Ocupado</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Info className="w-3.5 h-3.5" />
              <span>Max {maxSeats} asientos</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Cargando asientos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Stage */}
              <div className="mb-6">
                <div className="relative mx-auto max-w-md">
                  <div className="h-10 rounded-t-full gradient-teal opacity-70 flex items-center justify-center">
                    <span className="font-display text-sm tracking-widest text-black/80">ESCENARIO</span>
                  </div>
                  <div className="h-1 bg-teal-500/30 mx-8" />
                </div>
              </div>

              {/* Seat map */}
              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-2">
                {rowLabels.map((rowLabel) => (
                  <div key={rowLabel} className="flex items-center gap-2">
                    <span className={`w-6 text-center text-xs font-bold ${config.rowColor} flex-shrink-0`}>
                      {rowLabel}
                    </span>
                    <div className="flex flex-wrap gap-1.5 flex-1 justify-center">
                      {rows[rowLabel].map((seat) => {
                        const isSelected = selected.some((s) => s.id === seat.id);
                        const isSold = seat.status === 'sold';
                        const seatStyle = isSold
                          ? config.seatSold
                          : isSelected
                            ? config.seatSelected
                            : config.seatBg;
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            disabled={isSold}
                            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-[10px] font-bold transition-all duration-150 ${seatStyle} ${
                              !isSold && !isSelected ? 'hover:scale-110' : ''
                            } ${isSelected ? 'scale-110 shadow-lg shadow-teal-500/30' : ''}`}
                            title={seat.label}
                          >
                            {seat.seat_number}
                            {isSelected && (
                              <Check className="absolute inset-0 m-auto w-3.5 h-3.5" strokeWidth={3} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className={`w-6 text-center text-xs font-bold ${config.rowColor} flex-shrink-0`}>
                      {rowLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Selected seats summary */}
              <div className="mt-6 rounded-xl bg-black/30 border border-teal-500/15 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Asientos seleccionados ({selected.length}/{maxSeats})
                  </p>
                  <p className={`font-display text-xl ${config.color}`}>
                    ${selected.length * product.price}
                  </p>
                </div>
                {selected.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selected
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((seat) => (
                        <span
                          key={seat.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${config.badge}`}
                        >
                          {seat.label}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">No has seleccionado asientos aun.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onConfirm(selected)}
                  disabled={selected.length === 0}
                  className="flex-[2] py-3.5 rounded-xl gradient-teal text-black font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200 disabled:opacity-40 disabled:scale-100 shadow-lg shadow-teal-500/20"
                >
                  <Check className="w-5 h-5" />
                  Confirmar {selected.length} {selected.length === 1 ? 'asiento' : 'asientos'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
