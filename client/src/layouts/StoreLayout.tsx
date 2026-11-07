import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: 'var(--font-body)' },
        }}
      />
    </div>
  );
}

