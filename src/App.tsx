import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Artists } from '@/components/Artists';
import { Tickets } from '@/components/Tickets';
import { Autographs } from '@/components/Autographs';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { QRConfirmation } from '@/components/QRConfirmation';
import { Footer } from '@/components/Footer';

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#07101a] text-white">
        <Navbar />
        <main>
          <Hero />
          <Artists />
          <Tickets />
          <Autographs />
        </main>
        <Footer />
        <CartDrawer />
        <CheckoutModal />
        <QRConfirmation />
      </div>
    </CartProvider>
  );
}

export default App;
