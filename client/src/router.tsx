import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import StoreLayout from '@/layouts/StoreLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loader } from '@/components/common/Loader';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Profile = lazy(() => import('@/pages/Profile'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      { index: true, element: <SuspensePage><Home /></SuspensePage> },
      { path: 'products', element: <SuspensePage><Products /></SuspensePage> },
      { path: 'products/:slug', element: <SuspensePage><ProductDetail /></SuspensePage> },
      { path: 'login', element: <SuspensePage><Login /></SuspensePage> },
      { path: 'register', element: <SuspensePage><Register /></SuspensePage> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <SuspensePage><Profile /></SuspensePage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <SuspensePage><Cart /></SuspensePage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <SuspensePage><Checkout /></SuspensePage>
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <SuspensePage><NotFound /></SuspensePage> },
    ],
  },
]);
