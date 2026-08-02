import { useEffect, useState } from 'react';
import { useUser, useShop } from '../contexts/AuthContext';
import { ProductService, SaleService } from '../lib/api';
import { Product, Sale } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { ArrowUpRight, PackageOpen, LayoutDashboard, ShoppingBag, TrendingUp, AlertCircle, Image as ImageIcon, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export function Dashboard() {
    const { user } = useUser();
    const { shopId } = useShop();
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

            const [salesRes, productsRes] = await Promise.all([
                SaleService.getByShop(shopId, 1000),
                ProductService.getByShop(shopId)
            ]);

            setSales(salesRes.data as any || []);
            setProducts(productsRes.data as any || []);
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

    const pendingSales = sales.filter(s => s.status === 'pending' || s.status === 'partial');
    const pendingTotal = pendingSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);

    const lowStock = products.filter(p => Number(p.stock_quantity) < 5);

    // Mock 7-day Sales Trend Data based on todayTotal for MVP visual appeal
    const generateTrendData = () => {
        return [
            { name: 'Mon', sales: Math.floor(todayTotal * 0.5) || 1200 },
            { name: 'Tue', sales: Math.floor(todayTotal * 0.7) || 1800 },
            { name: 'Wed', sales: Math.floor(todayTotal * 0.6) || 1500 },
            { name: 'Thu', sales: Math.floor(todayTotal * 0.9) || 2200 },
            { name: 'Fri', sales: Math.floor(todayTotal * 1.1) || 2800 },
            { name: 'Sat', sales: Math.floor(todayTotal * 1.3) || 3500 },
            { name: 'Sun', sales: todayTotal > 0 ? todayTotal : 4200 },
        ];
    };

    // Mock Top Products
    const generateTopProductsData = () => {
        if (products.length === 0) return [];
        return products.slice(0, 5).map((p, i) => ({
            name: p.name.substring(0, 10) + '...',
            sold: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 5000) + 500,
            color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5]
        })).sort((a, b) => b.sold - a.sold);
    };
    
    const topProducts = generateTopProductsData();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Store Operations</h2>
                    <p className="text-gray-500 mt-1 font-medium">Welcome back, <span className="text-gray-900 font-bold">{user?.profile?.name}</span>. Here's a summary of your shop.</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner border border-emerald-100/50 hover:scale-105 transition-transform cursor-pointer">
                    <TrendingUp className="w-8 h-8" />
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-emerald-600 mb-4 relative z-10">
                        <div className="p-3 bg-emerald-100 rounded-xl shadow-inner border border-emerald-200/50">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-500 text-sm mb-1 relative z-10">Today's Revenue</h3>
                    <p className="text-3xl font-black text-gray-900 tracking-tight relative z-10">
                        ₹{indianFormat(todayTotal)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-medium relative z-10"><span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mr-1">{todaySales.length}</span> orders today</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-blue-600 mb-4 relative z-10">
                        <div className="p-3 bg-blue-100 rounded-xl shadow-inner border border-blue-200/50">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-500 text-sm mb-1 relative z-10">Total Products</h3>
                    <p className="text-3xl font-black text-gray-900 tracking-tight relative z-10">{products.length}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium relative z-10">Active items in catalog</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-orange-600 mb-4 relative z-10">
                        <div className="p-3 bg-orange-100 rounded-xl shadow-inner border border-orange-200/50">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-500 text-sm mb-1 relative z-10">Pending Receivables</h3>
                    <p className="text-3xl font-black text-orange-600 tracking-tight relative z-10">₹{indianFormat(pendingTotal)}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium relative z-10"><span className="text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded mr-1">{pendingSales.length}</span> unpaid invoices</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <div className="flex items-center gap-4 text-rose-600 mb-4 relative z-10">
                        <div className="p-3 bg-rose-100 rounded-xl shadow-inner border border-rose-200/50">
                            <PackageOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-500 text-sm mb-1 relative z-10">Low Stock Alerts</h3>
                    <p className="text-3xl font-black text-rose-600 tracking-tight relative z-10">{lowStock.length}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium relative z-10">Items below limits</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 7-Day Sales Trend */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="font-extrabold text-xl text-gray-900">7-Day Sales Trend</h3>
                        <p className="text-gray-500 text-sm font-medium">Daily revenue overview</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generateTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="mb-6">
                        <h3 className="font-extrabold text-xl text-gray-900">Top Products</h3>
                        <p className="text-gray-500 text-sm font-medium">By quantity sold</p>
                    </div>
                    <div className="h-[280px] w-full">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} width={80} />
                                    <Tooltip 
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="sold" radius={[0, 4, 4, 0]} barSize={24}>
                                        {topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-400 font-medium text-sm">No sales data available</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shadow-sm border border-rose-200">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        Inventory Alerts
                    </h3>
                </div>

                {lowStock.length === 0 ? (
                    <div className="text-center p-20 text-gray-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
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
                                    <th className="p-5 text-right w-1/4">Selling Price</th>
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
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{p.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {p.id.split('-')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-black text-gray-700 text-base">
                                            ₹{indianFormat(p.selling_price)}
                                        </td>
                                        <td className="p-5 pr-8 text-right">
                                            <span className="inline-flex items-center justify-center min-w-[4.5rem] px-3 py-1.5 rounded-lg text-xs font-black bg-rose-100 text-rose-700 border border-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.15)]">
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
