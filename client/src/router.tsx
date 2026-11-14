import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import StoreLayout from '@/layouts/StoreLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
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
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminCustomerDetail = lazy(() => import('@/pages/admin/AdminCustomerDetail'));
const AdminAuditTrail = lazy(() => import('@/pages/admin/AdminAuditTrail'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
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
      { path: 'category/new-arrivals', element: <Navigate to="/products?sort=createdAt:desc" replace /> },
      { path: 'category/featured', element: <Navigate to="/products?featured=true" replace /> },
      { path: 'category/sale', element: <Navigate to="/products?sale=true" replace /> },
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
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <SuspensePage><Orders /></SuspensePage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <SuspensePage><OrderDetail /></SuspensePage>
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <SuspensePage><NotFound /></SuspensePage> },
    ],
  },
  {
    path: 'admin',
    element: <AdminRoute><SuspensePage><AdminLayout /></SuspensePage></AdminRoute>,
    children: [
      { index: true, element: <SuspensePage><AdminDashboard /></SuspensePage> },
      { path: 'products', element: <SuspensePage><AdminProducts /></SuspensePage> },
      { path: 'categories', element: <SuspensePage><AdminCategories /></SuspensePage> },
      { path: 'inventory', element: <SuspensePage><AdminInventory /></SuspensePage> },
      { path: 'customers', element: <SuspensePage><AdminCustomers /></SuspensePage> },
      { path: 'customers/:customerId', element: <SuspensePage><AdminCustomerDetail /></SuspensePage> },
      { path: 'audit-trail', element: <SuspensePage><AdminAuditTrail /></SuspensePage> },
      { path: 'orders', element: <SuspensePage><AdminOrders /></SuspensePage> },
      { path: 'orders/:orderId', element: <SuspensePage><AdminOrderDetail /></SuspensePage> },
    ],
  },
]);
