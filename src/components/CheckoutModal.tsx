import { useState, useEffect } from 'react';
import {
  X, ArrowLeft, ArrowRight, Loader2, User, Mail, Phone,
  AlertCircle, Armchair, Bitcoin, Wallet, Copy, Check,
  ShieldCheck, Clock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import type { CustomerInfo } from '@/types';

const emptyInfo: CustomerInfo = { name: '', email: '', phone: '' };

export function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    items,
    totalPrice,
    submitOrder,
    confirmPayment,
    isSubmitting,
    submitError,
    ipBlocked,
    currentOrderId,
  } = useCart();

  const [info, setInfo] = useState<CustomerInfo>(emptyInfo);
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [step, setStep] = useState<'info' | 'crypto' | 'waiting'>('info');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'confirmed'>('waiting');

  useEffect(() => {
    if (!isCheckoutOpen) {
      setInfo(emptyInfo);
      setErrors({});
      setStep('info');
      setWalletAddress(null);
      setPaymentStatus('waiting');
    }
  }, [isCheckoutOpen]);

  // Poll for payment confirmation when waiting
  useEffect(() => {
    if (step !== 'waiting' || !currentOrderId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('crypto_payments')
        .select('status')
        .eq('order_id', currentOrderId)
        .maybeSingle();

      if (data?.status === 'paid') {
        setPaymentStatus('confirmed');
        clearInterval(interval);
        await confirmPayment();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, currentOrderId, confirmPayment]);

  // Load wallet address when entering crypto step
  useEffect(() => {
    if (step === 'crypto' && currentOrderId && !walletAddress) {
      supabase
        .from('crypto_payments')
        .select('wallet_address, binance_order_id')
        .eq('order_id', currentOrderId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setWalletAddress(data.wallet_address);
        });
    }
  }, [step, currentOrderId, walletAddress]);

  if (!isCheckoutOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};
    if (!info.name.trim() || info.name.trim().length < 3) {
      newErrors.name = 'Ingresa tu nombre completo';
    }
    if (!info.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      newErrors.email = 'Ingresa un correo valido';
    }
    if (!info.phone.trim() || info.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'Ingresa un telefono valido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await submitOrder(info);
    if (!ipBlocked && !submitError) {
      setStep('crypto');
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    setStep('waiting');
    // In production, the Binance webhook would confirm automatically.
    // For demo, we call confirmPayment directly after a short delay.
    await confirmPayment();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={closeCheckout}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-teal-500/20 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-teal-500/15 sticky top-0 glass-strong z-10">
          {step === 'info' && (
            <button
              onClick={closeCheckout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}
          {step === 'crypto' && (
            <button
              onClick={() => setStep('info')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Datos
            </button>
          )}
          {(step === 'waiting' || step === 'info' || step === 'crypto') && (
            <h2 className="text-lg font-bold">
              {step === 'info' && 'Datos del comprador'}
              {step === 'crypto' && 'Pago con cripto'}
              {step === 'waiting' && 'Confirmando pago...'}
            </h2>
          )}
          <button
            onClick={closeCheckout}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IP Blocked message */}
        {ipBlocked && (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Compra bloqueada</p>
                <p>Tu dispositivo ya ha realizado una compra. Para prevenir abuso, solo se permite una compra por dispositivo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Info form */}
        {step === 'info' && !ipBlocked && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <p className="text-sm text-gray-400">
              Completa tus datos para continuar con el pago en criptoactivos.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  placeholder="Juan Perez"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border ${
                    errors.name ? 'border-red-500/50' : 'border-teal-500/15'
                  } text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  placeholder="juan@email.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border ${
                    errors.email ? 'border-red-500/50' : 'border-teal-500/15'
                  } text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  placeholder="+591 700 12345"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border ${
                    errors.phone ? 'border-red-500/50' : 'border-teal-500/15'
                  } text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="rounded-xl bg-black/30 border border-teal-500/10 p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Resumen de tu orden
              </p>
              {items.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate pr-2">
                      {item.product.name}
                      <span className="text-gray-500"> x{item.quantity}</span>
                    </span>
                    <span className="text-gray-400 flex-shrink-0">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                  {item.seats && item.seats.length > 0 && (
                    <div className="flex items-center gap-1 pl-4">
                      <Armchair className="w-3 h-3 text-teal-400 flex-shrink-0" />
                      <span className="text-xs text-teal-400/80">
                        {item.seats.map((s) => s.label).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div className="h-px bg-teal-500/10 my-2" />
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span className="font-display text-2xl text-teal-400">${totalPrice} USDT</span>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl gradient-neon text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-teal-500/20 disabled:opacity-60 disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Continuar al pago
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step: Crypto payment */}
        {step === 'crypto' && !ipBlocked && (
          <div className="p-6 space-y-5">
            {/* Crypto badge */}
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Bitcoin className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-display text-2xl text-white">Pagar con USDT</p>
                <p className="text-xs text-gray-400">Binance Pay - Tether (USDT)</p>
              </div>
            </div>

            {/* Amount */}
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-4 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Monto a pagar</p>
              <p className="font-display text-4xl text-amber-400">{totalPrice} USDT</p>
              <p className="text-xs text-gray-500 mt-1">= ${totalPrice} USD</p>
            </div>

            {/* Wallet address */}
            {walletAddress && (
              <div className="rounded-xl bg-black/30 border border-teal-500/15 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Direccion de deposito (BSC Network)
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-teal-300 truncate bg-black/40 rounded-lg px-3 py-2">
                    {walletAddress}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-xl bg-teal-500/5 border border-teal-500/15 p-4 space-y-2">
              <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
                Como pagar
              </p>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Abre tu app de Binance o wallet compatible</li>
                <li>Envia el monto exacto en USDT (red BSC) a la direccion arriba</li>
                <li>El pago se confirma automaticamente al recibir el deposito</li>
                <li>Tus tickets QR se generan al instante tras confirmacion</li>
              </ol>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                Pago seguro mediante Binance Pay. Tus tickets se generan solo despues de confirmar el pago.
              </p>
            </div>

            {/* Demo confirm button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirmando pago...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Ya realice el pago
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 text-center">
              En produccion, la confirmacion es automatica via webhook de Binance.
            </p>
          </div>
        )}

        {/* Step: Waiting */}
        {step === 'waiting' && !ipBlocked && (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
              </div>
              <div className="absolute -inset-2 rounded-full bg-teal-500/10 blur-xl animate-pulse-glow -z-10" />
            </div>
            <div>
              <p className="font-display text-2xl text-white">Esperando confirmacion</p>
              <p className="text-sm text-gray-400 mt-1">
                Estamos verificando tu pago en la blockchain...
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Esto puede tardar unos segundos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
