import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useUser } from '@insforge/react';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { Profile } from './pages/Profile';
import { Customers } from './pages/Customers';
import { Suppliers } from './pages/Suppliers';
import { Expenses } from './pages/Expenses';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to={user?.profile?.role === 'super_admin' ? '/admin' : '/dashboard'} />} />

      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to={user?.profile?.role === 'super_admin' ? '/admin' : '/dashboard'} replace />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
