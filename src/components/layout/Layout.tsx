import { Outlet, NavLink } from 'react-router-dom';
import { useUser, UserButton } from '@insforge/react';
import { Store, Settings, Package, ShoppingCart, Clock, User, Users, Truck, Wallet } from 'lucide-react';

export function Layout() {
    const { user } = useUser();
    const role = user?.profile?.role as 'super_admin' | 'shop_owner';

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b flex-shrink-0">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">Udane POS</h1>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{role?.replace('_', ' ')}</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {role === 'super_admin' && (
                        <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Store className="w-5 h-5" /> Shops
                        </NavLink>
                    )}

                    {role === 'shop_owner' && (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Settings className="w-5 h-5" /> Dashboard
                            </NavLink>
                            <NavLink to="/pos" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <ShoppingCart className="w-5 h-5" /> POS Billing
                            </NavLink>
                            <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Package className="w-5 h-5" /> Inventory
                            </NavLink>
                            <NavLink to="/customers" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Users className="w-5 h-5" /> Customers
                            </NavLink>
                            <NavLink to="/suppliers" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Truck className="w-5 h-5" /> Suppliers
                            </NavLink>
                            <NavLink to="/expenses" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Wallet className="w-5 h-5" /> Expenses
                            </NavLink>
                            <NavLink to="/sales" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Clock className="w-5 h-5" /> Sales History
                            </NavLink>
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
                        <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <User className="w-5 h-5" /> My Profile
                        </NavLink>
                    </div>
                </nav>

                <div className="p-4 border-t flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden text-sm">
                        <UserButton />
                        <span className="truncate text-gray-700 font-medium">{user?.profile?.name || user?.email}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
