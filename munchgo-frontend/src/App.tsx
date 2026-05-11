import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ToastContainer } from '@/components/ui/Toast';
import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

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
    const redirect = user.role === 'MERCHANT' ? '/merchant'
      : user.role === 'RIDER' ? '/rider'
      : user.role === 'ADMIN' ? '/admin'
      : '/home';
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
}

function CustomerOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role !== 'CUSTOMER') return <Navigate to="/home" replace />;
  return <>{children}</>;
}

// Lazy load pages
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
const AdminOrderManagementPage = lazy(() => import('@/pages/admin/OrderManagement'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/Analytics'));
const RiderDashboardPage = lazy(() => import('@/pages/rider/RiderDashboard'));
const RiderOrderManagementPage = lazy(() => import('@/pages/rider/OrderManagement'));
const RiderOrderPoolPage = lazy(() => import('@/pages/rider/OrderPool'));

function LoadingFallback() {
  return <PageLoading />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Root always redirects based on auth state — handled by MainLayout / dashboard */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public pages — accessible to everyone */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantSearchPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

          {/* Customer-only pages */}
          <Route path="/cart" element={<CustomerOnlyRoute><CartPage /></CustomerOnlyRoute>} />
          <Route path="/checkout" element={<CustomerOnlyRoute><CheckoutPage /></CustomerOnlyRoute>} />
          <Route path="/orders" element={<CustomerOnlyRoute><OrderListPage /></CustomerOnlyRoute>} />
          <Route path="/orders/:id" element={<CustomerOnlyRoute><OrderDetailPage /></CustomerOnlyRoute>} />
          <Route path="/profile" element={<CustomerOnlyRoute><ProfilePage /></CustomerOnlyRoute>} />
          <Route path="/addresses" element={<CustomerOnlyRoute><AddressListPage /></CustomerOnlyRoute>} />
          <Route path="/favorites" element={<CustomerOnlyRoute><FavoritesPage /></CustomerOnlyRoute>} />

          {/* Merchant routes — strictly MERCHANT only */}
          <Route path="/merchant" element={<ProtectedRoute allowedRoles={['MERCHANT']}><MerchantDashboardPage /></ProtectedRoute>} />
          <Route path="/merchant/orders" element={<ProtectedRoute allowedRoles={['MERCHANT']}><MerchantOrderManagementPage /></ProtectedRoute>} />
          <Route path="/merchant/restaurant" element={<ProtectedRoute allowedRoles={['MERCHANT']}><MerchantRestaurantManagementPage /></ProtectedRoute>} />
          <Route path="/merchant/menu" element={<ProtectedRoute allowedRoles={['MERCHANT']}><MerchantMenuManagementPage /></ProtectedRoute>} />

          {/* Admin routes — strictly ADMIN only */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersManagementPage /></ProtectedRoute>} />
          <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminRestaurantManagementPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminOrderManagementPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAnalyticsPage /></ProtectedRoute>} />

          {/* Rider routes — strictly RIDER only */}
          <Route path="/rider" element={<ProtectedRoute allowedRoles={['RIDER']}><RiderDashboardPage /></ProtectedRoute>} />
          <Route path="/rider/orders" element={<ProtectedRoute allowedRoles={['RIDER']}><RiderOrderManagementPage /></ProtectedRoute>} />
          <Route path="/rider/pool" element={<ProtectedRoute allowedRoles={['RIDER']}><RiderOrderPoolPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
