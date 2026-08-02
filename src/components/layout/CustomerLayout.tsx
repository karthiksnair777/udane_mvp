import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';

export function CustomerLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-[72px] md:pb-0 overflow-hidden">
            {/* Top Navigation for Desktop (Hidden on Mobile) */}
            <header className="hidden md:flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm px-8 z-10 sticky top-0 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 text-white font-black text-xl">U</div>
                    <span className="font-black text-2xl tracking-tight text-gray-900">Udane<span className="text-emerald-500">Shop</span></span>
                </div>
                
                <nav className="flex gap-6 font-bold text-gray-500">
                    <Link to="/" className={`hover:text-emerald-600 transition-colors ${location.pathname === '/' ? 'text-emerald-600' : ''}`}>Shops</Link>
                    <Link to="/orders" className={`hover:text-emerald-600 transition-colors ${location.pathname === '/orders' ? 'text-emerald-600' : ''}`}>My Orders</Link>
                    <div className="w-px h-6 bg-gray-200 self-center"></div>
                    <Link to="/merchant" className="hover:text-emerald-600 transition-colors flex items-center gap-1"><User className="w-4 h-4" /> Merchant Portal</Link>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-2 pb-safe flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-16 ${location.pathname === '/' ? 'text-emerald-600 bg-emerald-50 shadow-sm scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <Home className="w-6 h-6" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    <span className="text-[10px] font-black tracking-wide">Explore</span>
                </Link>
                <Link to="/orders" className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-16 ${location.pathname.startsWith('/orders') ? 'text-emerald-600 bg-emerald-50 shadow-sm scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <ShoppingBag className="w-6 h-6" strokeWidth={location.pathname.startsWith('/orders') ? 2.5 : 2} />
                    <span className="text-[10px] font-black tracking-wide">Orders</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-16 ${location.pathname === '/profile' ? 'text-emerald-600 bg-emerald-50 shadow-sm scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <User className="w-6 h-6" strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-black tracking-wide">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
