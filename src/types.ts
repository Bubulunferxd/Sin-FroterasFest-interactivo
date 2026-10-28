export type ProductType = 'ticket';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  image?: string;
  badge?: string;
  perks?: string[];
  zone?: 'vip' | 'platinum' | 'general';
}

export interface Seat {
  id: string;
  zone: string;
  row_label: string;
  seat_number: number;
  label: string;
  status: 'available' | 'sold';
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  seats?: Seat[];
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderResult {
  id: string;
  confirmationCode: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  paymentStatus: 'pending' | 'paid';
  tickets: IndividualTicket[];
}

export interface IndividualTicket {
  id: string;
  ticket_code: string;
  seat_label: string;
  zone: string;
  holder_name: string;
  status: string;
}

export interface AutographSession {
  id: string;
  artist_name: string;
  artist_image: string;
  description: string;
  session_time: string;
  location: string;
  capacity: number;
  registered_count: number;
}
