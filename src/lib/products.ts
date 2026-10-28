import type { Product } from '@/types';

export const tickets: Product[] = [
  {
    id: 'ticket-vip',
    type: 'ticket',
    name: 'VIP Experience',
    description: 'Acceso total con los mejores privilegios del evento. Front row, backstage y zona exclusiva.',
    price: 100,
    image: 'https://images.pexels.com/photos/167605/pexels-photo-167605.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badge: 'LIMITADO',
    zone: 'vip',
    perks: [
      'Acceso front row',
      'Meet & greet con el artista',
      'Backstage pass completo',
      'Sesion de autografos prioritaria',
      'Estacionamiento VIP',
      'Kit de bienvenida exclusivo',
    ],
  },
  {
    id: 'ticket-platinum',
    type: 'ticket',
    name: 'Platinum Access',
    description: 'Experiencia premium con asientos preferenciales y zona exclusiva cerca del escenario.',
    price: 60,
    image: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    badge: 'POPULAR',
    zone: 'platinum',
    perks: [
      'Asientos preferenciales',
      'Zona Platinum exclusiva',
      'Sesion de autografos incluida',
      'Entrada prioritaria',
    ],
  },
  {
    id: 'ticket-general',
    type: 'ticket',
    name: 'General Admission',
    description: 'Acceso general al concierto. Vive la energia del publico y disfruta del show completo.',
    price: 30,
    image: 'https://images.pexels.com/photos/13230484/pexels-photo-13230484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    zone: 'general',
    perks: [
      'Acceso general al venue',
      'Pista y zonas comunes',
      'Sesion de autografos general',
      'Atmosfera increible',
    ],
  },
];

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  description: string;
  accentColor: string;
}

export const artists: Artist[] = [
  {
    id: 'bad-bunny',
    name: 'Bad Bunny',
    genre: 'Reggaeton / Latin Trap',
    image: 'https://images.pexels.com/photos/19437718/pexels-photo-19437718.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'El conejo malo llega a La Paz con toda su energia. El rey del reggaeton mundial en una noche que hara historia.',
    accentColor: 'from-pink-500 to-purple-600',
  },
  {
    id: 'grupo-frontera',
    name: 'Grupo Frontera',
    genre: 'Regional Mexicano',
    image: 'https://images.pexels.com/photos/35587034/pexels-photo-35587034.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Los reyes del regional mexicano traen su sonido unico al SinfronterasFest. Acordeones, bajos y pura fiesta.',
    accentColor: 'from-amber-500 to-red-600',
  },
  {
    id: 'cro',
    name: 'C.R.O',
    genre: 'Trap / Hip Hop',
    image: 'https://images.pexels.com/photos/7971866/pexels-photo-7971866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'El referente del trap argentino en el escenario. Flow, beats y letras que conectan con toda una generacion.',
    accentColor: 'from-teal-400 to-cyan-600',
  },
];
