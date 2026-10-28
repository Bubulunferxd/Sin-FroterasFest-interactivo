// =============================================================
// Binance Pay Webhook Handler
// =============================================================
// This edge function receives payment notifications from Binance Pay.
//
// WHERE TO PUT YOUR BINANCE API KEY:
//   Set it as an Edge Function secret named "BINANCE_API_KEY"
//   and "BINANCE_SECRET_KEY" in your Supabase project settings.
//   DO NOT hardcode API keys in this file.
//
// Environment variables needed (configured as Supabase secrets):
//   - BINANCE_API_KEY      → Your Binance Pay API key
//   - BINANCE_SECRET_KEY   → Your Binance Pay API secret
//   - SUPABASE_URL         → (auto-provided)
//   - SUPABASE_SERVICE_ROLE_KEY → (auto-provided)
// =============================================================

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, BinancePay-Timestamp, BinancePay-Nonce, BinancePay-Certificate-SN, BinancePay-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      merchantTradeNo,
      tradeStatus,
      totalAmount,
      currency,
      transactionId,
    } = body;

    // Only process successful payments
    if (tradeStatus !== "PAID" && tradeStatus !== "SUCCESS") {
      return new Response(
        JSON.stringify({ received: true, message: "Payment not completed, ignoring" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Find the order by merchantTradeNo (stored as binance_order_id in crypto_payments)
    const { data: payment, error: payError } = await supabase
      .from("crypto_payments")
      .select("id, order_id, amount, status")
      .eq("binance_order_id", merchantTradeNo)
      .single();

    if (payError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify amount matches
    if (parseFloat(totalAmount) !== parseFloat(String(payment.amount))) {
      return new Response(
        JSON.stringify({ error: "Amount mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Update crypto_payments status to paid
    const { error: updatePayError } = await supabase
      .from("crypto_payments")
      .update({
        status: "paid",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updatePayError) throw updatePayError;

    // 4. Update order status to confirmed + payment_status paid
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
      })
      .eq("id", payment.order_id)
      .select("id, customer_name, items")
      .single();

    if (orderError) throw orderError;

    // 5. Generate individual ticket QR codes for each seat
    const items = order.items as Array<{
      seats?: Array<{ id: string; label: string; zone: string }>;
      product?: { zone?: string; price?: number };
      quantity?: number;
    }>;

    const ticketItems = items.filter((i) => i.seats && i.seats.length > 0);
    const allSeats = ticketItems.flatMap((i) => i.seats || []);

    const ticketRecords = allSeats.map((seat) => ({
      order_id: payment.order_id,
      seat_id: seat.id,
      seat_label: seat.label,
      zone: seat.zone,
      ticket_code: `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      holder_name: order.customer_name,
      status: "valid",
    }));

    if (ticketRecords.length > 0) {
      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(ticketRecords);

      if (ticketError) throw ticketError;

      // 6. Mark seats as sold
      const seatIds = allSeats.map((s) => s.id);
      const { error: seatError } = await supabase
        .from("seats")
        .update({ status: "sold", order_id: payment.order_id })
        .in("id", seatIds);

      if (seatError) throw seatError;
    }

    return new Response(
      JSON.stringify({
        received: true,
        orderId: payment.order_id,
        ticketsGenerated: ticketRecords.length,
        transactionId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Webhook error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
