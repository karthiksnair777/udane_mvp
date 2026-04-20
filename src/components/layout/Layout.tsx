import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Store, Settings, Package, ShoppingCart, Clock, User, Users, Truck, Wallet, Sun, Moon } from 'lucide-react';

export function Layout() {
    const { user } = useUser();
    const role = user?.profile?.role as 'super_admin' | 'shop_owner';

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
        <div className="flex h-screen bg-gray-50 font-sans transition-colors duration-300">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 flex flex-col transition-colors duration-300 z-20">
                <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">Udane POS</h1>
                        <p className="text-sm text-gray-500 mt-1 capitalize">{role?.replace('_', ' ')}</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {role === 'super_admin' && (
                        <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Store className="w-5 h-5" /> Shops
                        </NavLink>
                    )}

                    {(role === 'shop_owner' || role === 'shop_staff' as any) && (
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

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <User className="w-5 h-5" /> My Profile
                        </NavLink>
                        
                        <button 
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 transition-colors duration-300">
                    <div className="flex items-center gap-3 overflow-hidden text-sm">
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-bold transition-colors border-none shadow-sm"
                        >
                            Log Out
                        </button>
                        <span className="truncate text-gray-700 font-bold">{user?.profile?.name || user?.email}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
}
