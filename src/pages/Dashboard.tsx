import { useEffect, useState } from 'react';
import { useUser } from '../contexts/AuthContext';
import { supabase, Product, Sale } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { ArrowUpRight, PackageOpen, LayoutDashboard, ShoppingBag, TrendingUp, AlertCircle, Image as ImageIcon, Clock } from 'lucide-react';

export function Dashboard() {
    const { user } = useUser();
    const shopId = user?.profile?.shop_id as string | undefined;
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shopId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // fetch all sales for metrics (we can filter locally for today)
            const { data: salesData } = await supabase
                .from('sales')
                .select('*')
                .eq('shop_id', shopId);

            // fetch products count & low stock
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('shop_id', shopId);

            setSales(salesData || []);
            setProducts(productsData || []);
            setLoading(false);
        };

        fetchData();
    }, [shopId]);

    if (loading) return (
        <div className="p-20 flex flex-col items-center justify-center text-gray-400 h-full">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading dashboard data...</p>
        </div>
    );

    if (!shopId) return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-rose-100 max-w-md w-full animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <LayoutDashboard className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Assigned</h2>
                <p className="text-gray-500">Your account hasn't been linked to any store. Please contact your Super Admin to view analytics.</p>
            </div>
        </div>
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = sales.filter(s => new Date(s.created_at) >= today);
    const todayTotal = todaySales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);

    // Calculate pending payments (sales that are not fully paid)
    const pendingSales = sales.filter(s => s.status === 'pending' || s.status === 'partial');
    const pendingTotal = pendingSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);

    const lowStock = products.filter(p => Number(p.stock_quantity) < 5);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Store Operations</h2>
                    <p className="text-gray-500 mt-1 font-medium">Welcome back, <span className="text-gray-900 font-bold">{user?.profile?.name}</span>. Here's a summary of your shop.</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600 shadow-inner border border-emerald-100/50">
                    <TrendingUp className="w-8 h-8" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-emerald-600 mb-6 relative z-10">
                        <div className="p-3.5 bg-emerald-100 rounded-2xl shadow-inner border border-emerald-200/50">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg mb-2 relative z-10">Today's Revenue</h3>
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-green-400 tracking-tight relative z-10">
                        ₹{indianFormat(todayTotal)}
                    </p>
                    <p className="text-sm text-gray-500 mt-3 font-medium relative z-10"><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{todaySales.length}</span> orders today</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-blue-600 mb-6 relative z-10">
                        <div className="p-3.5 bg-blue-100 rounded-2xl shadow-inner border border-blue-200/50">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg mb-2 relative z-10">Total Products</h3>
                    <p className="text-4xl font-black text-gray-900 tracking-tight relative z-10">{products.length}</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium relative z-10">Active items in catalog</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-orange-600 mb-6 relative z-10">
                        <div className="p-3.5 bg-orange-100 rounded-2xl shadow-inner border border-orange-200/50">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg mb-2 relative z-10">Pending Receivables</h3>
                    <p className="text-4xl font-black text-orange-600 tracking-tight relative z-10">₹{indianFormat(pendingTotal)}</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium relative z-10"><span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">{pendingSales.length}</span> unpaid invoices</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-rose-600 mb-6 relative z-10">
                        <div className="p-3.5 bg-rose-100 rounded-2xl shadow-inner border border-rose-200/50">
                            <PackageOpen className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg mb-2 relative z-10">Low Stock Alerts</h3>
                    <p className="text-4xl font-black text-rose-600 tracking-tight relative z-10">{lowStock.length}</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium relative z-10">Items below limits</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-500 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        Items Requiring Attention
                    </h3>
                </div>

                {lowStock.length === 0 ? (
                    <div className="text-center p-20 text-gray-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <TrendingUp className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-1">Stock Levels Healthy</p>
                        <p>All products are currently well-stocked. 🎉</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <tr>
                                    <th className="p-5 pl-8 w-1/2">Product Details</th>
                                    <th className="p-5 text-right w-1/4">Price (₹)</th>
                                    <th className="p-5 text-right pr-8 w-1/4">Current Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {lowStock.map(p => (
                                    <tr key={p.id} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {p.id.split('-')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-bold text-gray-600">
                                            ₹{indianFormat(p.selling_price)}
                                        </td>
                                        <td className="p-5 pr-8 text-right">
                                            <span className="inline-flex items-center justify-center min-w-[4rem] px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                                                {p.stock_quantity} left
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
