import { Zap, Instagram, Twitter, Youtube, Music, MapPin, Calendar, Mail, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '+591 63232494';

const footerSections = [
  {
    title: 'Tickets',
    links: ['VIP Experience', 'Platinum Access', 'General Admission', 'Mapa de Asientos', 'Horarios'],
  },
  {
    title: 'Artistas',
    links: ['Bad Bunny', 'Grupo Frontera', 'C.R.O', 'Sesiones de Autografos', 'Lineup Completo'],
  },
  {
    title: 'SinfronterasFest',
    links: ['Sobre el Festival', 'Patrocinadores', 'Aliados Comerciales', 'Prensa', 'Trabaja con Nosotros'],
  },
  {
    title: 'Soporte',
    links: ['Terminos y Condiciones', 'Politica de Privacidad', 'Politica de Reembolso', 'Preguntas Frecuentes', 'Contacto'],
  },
];

export function Footer() {
  return (
    <footer id="info" className="relative border-t border-teal-500/10 bg-[#050b12] noise">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-teal-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-teal-400" fill="currentColor" />
              <span className="font-display text-2xl tracking-wider">
                SINFRONTERAS<span className="text-neon-teal animate-neon-flicker">FEST</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              La experiencia musical mas electrizante de 2026. Bad Bunny, Grupo Frontera y C.R.O en una noche inolvidable. Sin fronteras, sin limites.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-teal-400" />
                La Paz, Bolivia
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-teal-400" />
                15 de Diciembre, 2026 — 8:00 PM
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-teal-400" />
                info@sinfronterasfest.com
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              {[Instagram, Twitter, Youtube, Music].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-teal-400 hover:border-teal-500/30 transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* WhatsApp */}
            <a
              href="https://wa.me/59163232494"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{WHATSAPP_NUMBER}</span>
            </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">{section.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-teal-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            (c) 2026 SinfronterasFest. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Pagos con criptoactivos via Binance Pay
          </p>
        </div>
      </div>
    </footer>
  );
}
