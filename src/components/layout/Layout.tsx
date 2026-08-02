import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useUser, useShop } from '../../contexts/AuthContext';
import { AuthService } from '../../lib/api/auth';
import { Store, Settings, Package, ShoppingCart, Clock, User, Users, Truck, Wallet, Sun, Moon, LayoutDashboard } from 'lucide-react';

export function Layout() {
    const { user } = useUser();
    const { isSuperAdmin, viewingShopId, setViewingShopId } = useShop();
    const role = user?.profile?.role;
    const showMerchantLinks = role === 'shop_owner' || role === 'shop_staff' || (isSuperAdmin && !!viewingShopId);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans transition-colors duration-300">
            {isSuperAdmin && viewingShopId && (
                <div className="bg-amber-400 text-amber-950 px-6 py-2.5 flex items-center justify-between z-50 shadow-md border-b border-amber-500">
                    <span className="font-extrabold flex items-center gap-2">
                        <Store className="w-5 h-5" /> Viewing Shop Context
                    </span>
                    <button 
                        onClick={() => {
                            setViewingShopId(null);
                            window.location.href = '/merchant/admin';
                        }}
                        className="bg-amber-950 text-amber-400 px-4 py-1.5 rounded-lg text-sm font-black hover:bg-black transition-colors shadow-sm"
                    >
                        Exit Shop View
                    </button>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-[#0B1120] border-r border-gray-100 flex flex-col transition-colors duration-300 z-20">
                <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center bg-gray-50/50 dark:bg-transparent">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Udane<span className="text-emerald-500">POS</span></h1>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{role?.replace('_', ' ')}</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scrollbar">
                    {role === 'super_admin' && (
                        <NavLink to="/merchant/admin" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive && !viewingShopId ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <Store className="w-4 h-4" /> Shops
                        </NavLink>
                    )}

                    {showMerchantLinks && (
                        <>
                            <NavLink to="/merchant/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </NavLink>
                            <NavLink to="/merchant/pos" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <ShoppingCart className="w-4 h-4" /> POS Billing
                            </NavLink>
                            <NavLink to="/merchant/inventory" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Package className="w-4 h-4" /> Inventory
                            </NavLink>
                            <NavLink to="/merchant/online-orders" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Store className="w-4 h-4" /> Online Orders
                            </NavLink>
                            <NavLink to="/merchant/customers" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Users className="w-4 h-4" /> Customers
                            </NavLink>
                            <NavLink to="/merchant/suppliers" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Truck className="w-4 h-4" /> Suppliers
                            </NavLink>
                            <NavLink to="/merchant/expenses" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Wallet className="w-4 h-4" /> Expenses
                            </NavLink>
                            <NavLink to="/merchant/sales" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Clock className="w-4 h-4" /> Sales History
                            </NavLink>
                            <NavLink to="/merchant/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Settings className="w-4 h-4" /> Shop Settings
                            </NavLink>
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <NavLink to="/merchant/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <User className="w-4 h-4" /> My Profile
                        </NavLink>
                        
                        <button 
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm font-semibold transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 transition-colors duration-300 bg-gray-50/50 dark:bg-transparent">
                    <div className="flex items-center gap-3 overflow-hidden text-sm">
                        <button
                            onClick={() => AuthService.signOut()}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-bold transition-colors border-none shadow-sm"
                        >
                            Log Out
                        </button>
                        <span className="truncate text-gray-700 font-bold">{user?.profile?.name || user?.email}</span>
                    </div>
                </div>
            </div>

                <main className="flex-1 overflow-auto bg-gray-50 transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
