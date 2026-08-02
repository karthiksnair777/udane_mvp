import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useUser } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Customers } from './pages/Customers';
import { Suppliers } from './pages/Suppliers';
import { Expenses } from './pages/Expenses';
import { OnlineOrders } from './pages/OnlineOrders';

// Customer Pages
import { Explore } from './pages/customer/Explore';
import { Storefront } from './pages/customer/Storefront';
import { Checkout } from './pages/customer/Checkout';
import { Orders } from './pages/customer/Orders';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DefaultRedirect() {
  const { user } = useUser();
  if (!user || !user.profile) return <div className="h-screen flex items-center justify-center text-gray-500">Loading profile...</div>;
  return <Navigate to={user.profile.role === 'super_admin' ? '/merchant/admin' : '/merchant/dashboard'} replace />;
}

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const homeRedirect = isSignedIn && user?.profile
    ? (user.profile.role === 'super_admin' ? '/merchant/admin' : '/merchant/dashboard')
    : '/login';

  return (
    <Routes>
      <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to={homeRedirect} replace />} />

      {/* Primary Experience: Customer PWA */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Explore />} />
        <Route path="shop/:id" element={<Storefront />} />
        <Route path="checkout/:id" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
      </Route>

      {/* Merchant / Admin Experience */}
      <Route path="/merchant" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<DefaultRedirect />} />
        <Route path="admin"     element={<AdminDashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos"       element={<POS />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="online-orders" element={<OnlineOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="expenses"  element={<Expenses />} />
        <Route path="sales"     element={<SalesHistory />} />
        <Route path="settings"  element={<Settings />} />
        <Route path="profile"   element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
