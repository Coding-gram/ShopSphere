import { createBrowserRouter } from 'react-router-dom';
import StoreLayout from '@/layouts/StoreLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
