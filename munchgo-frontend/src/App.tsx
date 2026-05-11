import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ToastContainer } from '@/components/ui/Toast';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

// Lazy load pages
import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

const HomePage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/user/Login'));
const RegisterPage = lazy(() => import('@/pages/user/Register'));
const RestaurantSearchPage = lazy(() => import('@/pages/restaurant/RestaurantSearch'));
const RestaurantDetailPage = lazy(() => import('@/pages/restaurant/RestaurantDetail'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/order/Checkout'));
const OrderListPage = lazy(() => import('@/pages/order/OrderList'));
const OrderDetailPage = lazy(() => import('@/pages/order/OrderDetail'));
const ProfilePage = lazy(() => import('@/pages/user/Profile'));
const AddressListPage = lazy(() => import('@/pages/user/AddressList'));
const FavoritesPage = lazy(() => import('@/pages/user/Favorites'));
const MerchantDashboardPage = lazy(() => import('@/pages/merchant/MerchantDashboard'));
const MerchantOrderManagementPage = lazy(() => import('@/pages/merchant/OrderManagement'));
const MerchantRestaurantManagementPage = lazy(() => import('@/pages/merchant/RestaurantManagement'));
const MerchantMenuManagementPage = lazy(() => import('@/pages/merchant/MenuManagement'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersManagementPage = lazy(() => import('@/pages/admin/UsersManagement'));
const AdminRestaurantManagementPage = lazy(() => import('@/pages/admin/RestaurantManagement'));

function LoadingFallback() {
  return <PageLoading />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantSearchPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addresses" element={<AddressListPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/merchant" element={<ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}><MerchantDashboardPage /></ProtectedRoute>} />
          <Route path="/merchant/orders" element={<ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}><MerchantOrderManagementPage /></ProtectedRoute>} />
          <Route path="/merchant/restaurant" element={<ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}><MerchantRestaurantManagementPage /></ProtectedRoute>} />
          <Route path="/merchant/menu" element={<ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}><MerchantMenuManagementPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersManagementPage /></ProtectedRoute>} />
          <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminRestaurantManagementPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
