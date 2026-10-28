import { useState, useEffect } from 'react';
import { PenTool, Clock, MapPin, Users, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { AutographSession } from '@/types';

const artistAccent: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  'Bad Bunny': {
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    bg: 'bg-pink-500/5',
    badge: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
  },
  'Grupo Frontera': {
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500/5',
    badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  },
  'C.R.O': {
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    bg: 'bg-teal-500/5',
    badge: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
  },
};

export function Autographs() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const [sessions, setSessions] = useState<AutographSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('autograph_sessions')
        .select('*')
        .order('session_time', { ascending: true });
      if (!error && data) setSessions(data as AutographSession[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleRegister = async (sessionId: string) => {
    if (registered.includes(sessionId)) return;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.registered_count >= session.capacity) return;

    const { error } = await supabase
      .from('autograph_sessions')
      .update({ registered_count: session.registered_count + 1 })
      .eq('id', sessionId);

    if (!error) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, registered_count: s.registered_count + 1 } : s
        )
      );
      setRegistered((prev) => [...prev, sessionId]);
    }
  };

  return (
    <section id="autografos" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full neon-blob-teal blur-3xl opacity-30" />

      <div className="relative max-w-5xl mx-auto">
        <div className={`text-center mb-14 reveal ${visible ? 'reveal-visible' : ''}`} ref={ref}>
          <span className="text-sm font-bold tracking-widest uppercase text-amber-400">Exclusivo</span>
          <h2 className="font-display text-5xl sm:text-6xl mt-2 mb-3">
            SESIONES DE <span className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">AUTOGRAFOS</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Conoce a tus artistas favoritos en persona. Registrate para una sesion de autografos exclusiva.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Cargando sesiones...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.map((session, index) => {
              const accent = artistAccent[session.artist_name] || artistAccent['C.R.O'];
              const isFull = session.registered_count >= session.capacity;
              const isRegistered = registered.includes(session.id);
              const spotsLeft = session.capacity - session.registered_count;

              return (
                <div
                  key={session.id}
                  className={`relative rounded-2xl glass-strong border ${accent.border} ${accent.bg} p-6 card-shine hover:scale-[1.02] transition-all duration-300 reveal ${visible ? 'reveal-visible' : ''}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  {/* Artist image */}
                  <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                    <img
                      src={session.artist_image}
                      alt={session.artist_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <h3 className="font-display text-2xl text-white leading-none">{session.artist_name}</h3>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${accent.badge}`}>
                        <PenTool className="w-3 h-3 inline mr-1" />
                        Autografo
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{session.description}</p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className={`w-4 h-4 ${accent.text}`} />
                      <span>{session.session_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className={`w-4 h-4 ${accent.text}`} />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className={`w-4 h-4 ${accent.text}`} />
                      <span>{spotsLeft} lugares disponibles</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          session.artist_name === 'Bad Bunny' ? 'bg-pink-500' :
                          session.artist_name === 'Grupo Frontera' ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${(session.registered_count / session.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(session.id)}
                    disabled={isFull || isRegistered}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      isRegistered
                        ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                        : isFull
                          ? 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'
                          : `${accent.text} border ${accent.border} hover:scale-[1.03]`
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="w-4 h-4" />
                        Registrado
                      </>
                    ) : isFull ? (
                      'Agotado'
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        Registrarme
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
