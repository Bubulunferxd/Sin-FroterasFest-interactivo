import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, CustomerInfo, OrderResult, Seat, IndividualTicket } from '@/types';
import { supabase } from '@/lib/supabase';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  isCheckoutOpen: boolean;
  orderResult: OrderResult | null;
  lastAdded: { id: string; timestamp: number } | null;
  ipBlocked: boolean;
  addTicketsWithSeats: (product: Product, seats: Seat[]) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  submitOrder: (customer: CustomerInfo) => Promise<void>;
  confirmPayment: () => Promise<void>;
  dismissOrder: () => void;
  totalItems: number;
  totalPrice: number;
  isSubmitting: boolean;
  submitError: string | null;
  currentOrderId: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SFF-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getIpHash(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const ip = data.ip || 'unknown';
    // Simple hash — not cryptographically secure, but sufficient for dedup
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `ip_${Math.abs(hash).toString(36)}`;
  } catch {
    return 'ip_unknown';
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<{ id: string; timestamp: number } | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [ipBlocked, setIpBlocked] = useState(false);

  const addTicketsWithSeats = useCallback((product: Product, seats: Seat[]) => {
    const cartItemId = `${product.id}-seats`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const existingSeatIds = new Set(existing.seats?.map((s) => s.id) || []);
        const newSeats = [...(existing.seats || []), ...seats.filter((s) => !existingSeatIds.has(s.id))];
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: newSeats.length, seats: newSeats }
            : item
        );
      }
      return [...prev, { id: cartItemId, product, quantity: seats.length, seats }];
    });
    setLastAdded({ id: cartItemId, timestamp: Date.now() });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const openCheckout = useCallback(() => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
  const dismissOrder = useCallback(() => {
    setOrderResult(null);
    setCurrentOrderId(null);
    clearCart();
  }, [clearCart]);

  // Step 1: Create order with status 'pending' — no tickets generated yet
  const submitOrder = useCallback(
    async (customer: CustomerInfo) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        // Check IP block
        const ipHash = await getIpHash();
        const { data: existingBlock } = await supabase
          .from('ip_blocks')
          .select('blocked, order_count')
          .eq('ip_hash', ipHash)
          .maybeSingle();

        if (existingBlock?.blocked) {
          setIpBlocked(true);
          setSubmitError('Tu dispositivo ya ha realizado una compra. Para prevenir abuso, solo se permite una compra por dispositivo.');
          setIsSubmitting(false);
          return;
        }

        const confirmationCode = generateConfirmationCode();
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        const orderData = {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          items: items.map((item) => ({
            id: item.id,
            name: item.product.name,
            type: item.product.type,
            price: item.product.price,
            quantity: item.quantity,
            seats: item.seats?.map((s) => ({ id: s.id, label: s.label, zone: s.zone })) || null,
          })),
          total,
          confirmation_code: confirmationCode,
          status: 'pending',
          payment_method: 'crypto',
          payment_status: 'pending',
          ip_hash: ipHash,
        };

        const { data, error } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
          .single();

        if (error) throw error;

        // Record IP block entry or increment count
        if (existingBlock) {
          await supabase
            .from('ip_blocks')
            .update({
              order_count: (existingBlock.order_count || 0) + 1,
              last_order_at: new Date().toISOString(),
            })
            .eq('ip_hash', ipHash);
        } else {
          await supabase
            .from('ip_blocks')
            .insert({
              ip_hash: ipHash,
              order_count: 1,
              last_order_at: new Date().toISOString(),
              blocked: false,
            });
        }

        // Create crypto payment record with a demo wallet address
        // In production, this would call Binance Pay API to create a real payment order
        const binanceOrderId = `BNPP-${data.id.slice(0, 8)}-${Date.now()}`;
        const demoWalletAddress = '0x' + data.id.replace(/-/g, '').slice(0, 40);

        const { error: payError } = await supabase
          .from('crypto_payments')
          .insert({
            order_id: data.id,
            binance_order_id: binanceOrderId,
            amount: total,
            currency: 'USDT',
            status: 'pending',
            wallet_address: demoWalletAddress,
            qr_code: `binance://pay/${binanceOrderId}`,
          });

        if (payError) throw payError;

        setCurrentOrderId(data.id);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Ocurrio un error al procesar tu orden.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [items]
  );

  // Step 2: Confirm payment — generates individual ticket QR codes
  // In production, this is called automatically by the Binance webhook.
  // For demo purposes, we also allow manual confirmation here.
  const confirmPayment = useCallback(async () => {
    if (!currentOrderId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Update payment status
      const { error: payError } = await supabase
        .from('crypto_payments')
        .update({
          status: 'paid',
          confirmed_at: new Date().toISOString(),
        })
        .eq('order_id', currentOrderId);

      if (payError) throw payError;

      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
        })
        .eq('id', currentOrderId)
        .select('id, customer_name, customer_email, customer_phone, items, total, confirmation_code')
        .single();

      if (orderError) throw orderError;

      // Generate individual tickets with unique QR codes
      const orderItems = order.items as Array<{
        seats?: Array<{ id: string; label: string; zone: string }>;
        product?: { zone?: string };
      }>;

      const allSeats = orderItems.flatMap((i) => i.seats || []);
      const ticketRecords = allSeats.map((seat) => ({
        order_id: currentOrderId,
        seat_id: seat.id,
        seat_label: seat.label,
        zone: seat.zone,
        ticket_code: `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        holder_name: order.customer_name,
        status: 'valid',
      }));

      let generatedTickets: IndividualTicket[] = [];

      if (ticketRecords.length > 0) {
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .insert(ticketRecords)
          .select('id, ticket_code, seat_label, zone, holder_name, status');

        if (ticketError) throw ticketError;
        generatedTickets = (ticketData || []) as IndividualTicket[];

        // Mark seats as sold
        const seatIds = allSeats.map((s) => s.id);
        const { error: seatError } = await supabase
          .from('seats')
          .update({ status: 'sold', order_id: currentOrderId })
          .in('id', seatIds);

        if (seatError) throw seatError;
      }

      // Block this IP from making another purchase
      const ipHash = await getIpHash();
      await supabase
        .from('ip_blocks')
        .update({ blocked: true })
        .eq('ip_hash', ipHash);

      // Build cart items from order for display
      const cartItems: CartItem[] = (orderItems as Array<{ id: string; name: string; type: string; price: number; quantity: number; seats?: Array<{ id: string; label: string; zone: string; row_label?: string; seat_number?: number; status?: string }> }>).map((item) => ({
        id: item.id,
        product: {
          id: item.id,
          type: 'ticket' as const,
          name: item.name,
          description: '',
          price: item.price,
        },
        quantity: item.quantity,
        seats: item.seats?.map((s) => ({
          id: s.id,
          zone: s.zone,
          row_label: s.row_label || '',
          seat_number: 0,
          label: s.label,
          status: 'sold' as const,
        })),
      }));

      setOrderResult({
        id: order.id,
        confirmationCode: order.confirmation_code,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        items: cartItems,
        total: parseFloat(String(order.total)),
        paymentStatus: 'paid',
        tickets: generatedTickets,
      });

      setIsCheckoutOpen(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrio un error al confirmar el pago.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [currentOrderId]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isCheckoutOpen,
        orderResult,
        lastAdded,
        ipBlocked,
        addTicketsWithSeats,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        submitOrder,
        confirmPayment,
        dismissOrder,
        totalItems,
        totalPrice,
        isSubmitting,
        submitError,
        currentOrderId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
