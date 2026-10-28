import { Music2, Star, Sparkles } from 'lucide-react';
import { artists } from '@/lib/products';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const artistAccentBorder: Record<string, string> = {
  'bad-bunny': 'border-pink-500/40',
  'grupo-frontera': 'border-amber-500/40',
  'cro': 'border-teal-400/40',
};

const artistAccentGlow: Record<string, string> = {
  'bad-bunny': 'shadow-[0_0_60px_-15px_rgba(236,72,153,0.4)]',
  'grupo-frontera': 'shadow-[0_0_60px_-15px_rgba(245,158,11,0.4)]',
  'cro': 'shadow-[0_0_60px_-15px_rgba(20,184,166,0.4)]',
};

const artistAccentText: Record<string, string> = {
  'bad-bunny': 'text-pink-400',
  'grupo-frontera': 'text-amber-400',
  'cro': 'text-teal-400',
};

const artistAccentBg: Record<string, string> = {
  'bad-bunny': 'bg-pink-500/10 border-pink-500/30 text-pink-300',
  'grupo-frontera': 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  'cro': 'bg-teal-500/10 border-teal-500/30 text-teal-300',
};

export function Artists() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="artists" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto">
        <div className={`text-center mb-14 reveal ${visible ? 'reveal-visible' : ''}`} ref={ref}>
          <span className="text-sm font-bold tracking-widest uppercase gradient-text-neon">Lineup</span>
          <h2 className="font-display text-5xl sm:text-6xl mt-2 mb-3">
            LOS <span className="gradient-text-neon">ARTISTAS</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Tres gigantes de la musica en una sola noche. Una experiencia que no se repite.
          </p>
        </div>

        {/* 3-panel split with horizontal dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 rounded-2xl overflow-hidden neon-border-strong">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className={`relative group overflow-hidden reveal ${visible ? 'reveal-visible' : ''} ${
                index < 2 ? 'md:border-r md:border-white/10' : ''
              } ${index < 2 ? 'border-b md:border-b-0 border-white/10' : ''}`}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              {/* Background image */}
              <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-t ${artist.accentColor} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />

                {/* Floating glow */}
                <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${
                  artist.id === 'bad-bunny' ? 'bg-pink-500' :
                  artist.id === 'grupo-frontera' ? 'bg-amber-500' : 'bg-teal-500'
                }`} />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3 self-start ${artistAccentBg[artist.id] || artistAccentBg.cro}`}>
                    <Music2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{artist.genre}</span>
                  </div>

                  <h3 className="font-display text-4xl sm:text-5xl text-white leading-none mb-2 text-glow-strong">
                    {artist.name}
                  </h3>

                  <p className="text-sm text-gray-300 leading-relaxed mb-4 max-w-xs">
                    {artist.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Star className={`w-4 h-4 ${artistAccentText[artist.id] || artistAccentText.cro} fill-current`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${artistAccentText[artist.id] || artistAccentText.cro}`}>
                      Headliner
                    </span>
                    <Sparkles className={`w-4 h-4 ${artistAccentText[artist.id] || artistAccentText.cro}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-pink-500/40" />
          <span className="font-display text-sm tracking-widest text-gray-500">15 DIC 2026</span>
          <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-teal-500/40" />
        </div>
      </div>
    </section>
  );
}
