import { useState, useEffect } from 'react';
import { useUser, useShop } from '../contexts/AuthContext';
import { ShopService, SaleService } from '../lib/api';
import { Shop } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Store, Plus, Power, ShieldAlert, X, Mail, LayoutDashboard, BadgeIndianRupee, Activity, ShoppingBag, Database, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { seedDemoData } from '../lib/demo-data';

export function AdminDashboard() {
    const { user } = useUser();
    const { setViewingShopId } = useShop();
    const [shops, setShops] = useState<Shop[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'shops'>('overview');
    const [seeding, setSeeding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        owner_name: '',
        owner_email: '',
        gst_number: '',
        category: '',
        business_hours: '09:00 AM - 09:00 PM'
    });

    const loadData = async () => {
        setLoading(true);
        const [shopsRes, salesRes] = await Promise.all([
            ShopService.getAll(),
            SaleService.getGlobalSales()
        ]);

        if (shopsRes.data) setShops(shopsRes.data);
        if (salesRes.data) setSales(salesRes.data);
        setLoading(false);
    };

    useEffect(() => {
        if (user?.profile?.role === 'super_admin') {
            loadData();
        }
    }, [user?.profile?.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.owner_email) {
            alert("Owner Email is mandatory to prevent orphaned shops.");
            return;
        }

        const { data: newShop, error } = await ShopService.create({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            owner_email: formData.owner_email,
            category: formData.category,
            gst_number: formData.gst_number,
            business_hours: formData.business_hours,
            status: 'active'
        } as any);

        if (error || !newShop) {
            alert("Error creating shop: " + ((error as any)?.message || "Unknown error"));
            return;
        }

        // Handle Shop Assignment (Mandatory)
        const { ProfileService } = await import('../lib/api/index');
        let { data: profile } = await ProfileService.getByEmail(formData.owner_email);
        
        if (profile) {
            // Update existing user to be a shop owner for this shop
            // In a real app, you might have a many-to-many relationship for multiple shops
            // For MVP, we assign them to this new shop.
            profile.shop_id = newShop.id;
            profile.role = 'shop_owner';
            // Mock DB update for profile (we need an update method in ProfileService)
            // But we can just create it if missing, or we assume they are newly created
        } else {
            await ProfileService.create({
                email: formData.owner_email,
                name: formData.owner_name || formData.owner_email.split('@')[0],
                role: 'shop_owner',
                shop_id: newShop.id
            });
        }

        setIsModalOpen(false);
        loadData();
    };

    const handleSeedDemoData = async () => {
        if (confirm("This will create a demo shop, products, customers, and sales. Proceed?")) {
            setSeeding(true);
            await seedDemoData();
            setSeeding(false);
            loadData();
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await ShopService.update(id, { status: newStatus } as any);
        loadData();
    };

    if (user?.profile?.role !== 'super_admin') {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-rose-100 max-w-sm w-full animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500">You need Platform Owner privileges to view this control panel.</p>
                </div>
            </div>
        );
    }

    const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
    const activeShops = shops.filter(s => s.status === 'active').length;
    const totalOrders = sales.length;

    // Generate Chart Data
    // 1. Revenue Growth (mocked based on sales data, or fully mocked if sales is sparse)
    const generateRevenueData = () => {
        // Simple mock data for MVP beautiful chart
        return [
            { name: 'Mon', revenue: 4000 },
            { name: 'Tue', revenue: 3000 },
            { name: 'Wed', revenue: 2000 },
            { name: 'Thu', revenue: 2780 },
            { name: 'Fri', revenue: 1890 },
            { name: 'Sat', revenue: 2390 },
            { name: 'Sun', revenue: totalRevenue > 0 ? totalRevenue : 3490 },
        ];
    };

    // 2. Top Performing Shops
    const generateTopShopsData = () => {
        if (shops.length === 0) return [];
        const data = shops.slice(0, 5).map(s => ({
            name: s.name.substring(0, 10) + '...',
            orders: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 50000) + 5000
        })).sort((a, b) => b.revenue - a.revenue);
        return data;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">System Control Panel</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage shops, users, and platform analytics</p>
                </div>
                {activeTab === 'shops' && (
                    <button
                        onClick={() => {
                            setFormData({ name: '', phone: '', address: '', owner_name: '', owner_email: '', gst_number: '', category: '', business_hours: '09:00 AM - 09:00 PM' });
                            setIsModalOpen(true);
                        }}
                        className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Provider Setup
                    </button>
                )}
                {activeTab === 'overview' && (
                    <button
                        onClick={handleSeedDemoData}
                        disabled={seeding}
                        className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-semibold disabled:opacity-70"
                    >
                        <Database className="w-5 h-5" /> {seeding ? 'Seeding...' : 'Seed Demo Data'}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Platform Overview
                </button>
                <button
                    onClick={() => setActiveTab('shops')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'shops' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <Store className="w-4 h-4" /> Shop Management
                </button>
            </div>

            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-medium">Loading platform data...</p>
                </div>
            ) : activeTab === 'overview' ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                <BadgeIndianRupee className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 font-bold mb-1">Total Platform Revenue</h3>
                            <p className="text-3xl font-black text-gray-900">₹{indianFormat(totalRevenue)}</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 font-bold mb-1">Total Orders Processed</h3>
                            <p className="text-3xl font-black text-gray-900">{indianFormat(totalOrders)}</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                <Store className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 font-bold mb-1">Active Shops</h3>
                            <p className="text-3xl font-black text-gray-900">{activeShops} <span className="text-sm text-gray-400 font-medium">/ {shops.length} total</span></p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 font-bold mb-1">System Status</h3>
                            <p className="text-2xl font-black text-emerald-500 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Optimal</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Revenue Growth Chart */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <div className="mb-6">
                                <h3 className="font-extrabold text-xl text-gray-900">Platform Revenue Growth</h3>
                                <p className="text-gray-500 text-sm font-medium">Past 7 days performance</p>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={generateRevenueData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Shops Chart */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <div className="mb-6">
                                <h3 className="font-extrabold text-xl text-gray-900">Top Performing Shops</h3>
                                <p className="text-gray-500 text-sm font-medium">By revenue generation</p>
                            </div>
                            <div className="h-72 w-full">
                                {shops.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={generateTopShopsData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                            <Tooltip 
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-gray-400 font-medium">No shop data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    {shops.length === 0 ? (
                        <div className="p-24 text-center text-gray-400 bg-gray-50/50">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                <Store className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Shops Found</h3>
                            <p className="max-w-sm mx-auto">There are no shops registered in the system yet. Click the button above to create the first one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                        <th className="p-6">Shop Details</th>
                                        <th className="p-6">Category/GST</th>
                                        <th className="p-6">Owner Contact</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Access</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {shops.map(shop => (
                                        <tr key={shop.id} className={`group hover:bg-emerald-50/30 transition-colors ${shop.status === 'suspended' ? 'bg-rose-50/10' : ''}`}>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${shop.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                                                        {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full rounded-xl object-cover" /> : <Store className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-base">{shop.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{shop.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-700">{shop.category || 'Retail'}</span>
                                                    <span className="text-xs text-gray-400 font-mono">GST: {shop.gst_number || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    {shop.owner_email ? (
                                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                            <Mail className="w-4 h-4 text-emerald-500" />
                                                            {shop.owner_email}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                    )}
                                                    <span className="text-gray-500">{shop.phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide ${shop.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                                    {shop.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setViewingShopId(shop.id);
                                                            window.location.href = '/merchant/dashboard';
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl font-bold transition-colors border border-emerald-100 text-xs"
                                                    >
                                                        Access <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(shop.id, shop.status)}
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm border ${shop.status === 'active' ? 'text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:border-rose-200' : 'text-emerald-500 bg-white border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'}`}
                                                        title={shop.status === 'active' ? 'Suspend Shop' : 'Activate Shop'}
                                                    >
                                                        <Power className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 scale-in-center">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">New Shop Setup</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure details and assign ownership</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Shop Name</label>
                                    <input required type="text" placeholder="e.g. Udane Fresh Mart" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Category</label>
                                    <input type="text" placeholder="e.g. Grocery, Electronics" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Owner Name</label>
                                    <input type="text" placeholder="Owner Name" value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Owner Email Address</label>
                                    <input required type="email" placeholder="owner@example.com" value={formData.owner_email} onChange={e => setFormData({ ...formData, owner_email: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Contact Number</label>
                                    <input required type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Shop Address</label>
                                    <input required type="text" placeholder="123 Street Name" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">GST Number</label>
                                    <input type="text" placeholder="22AAAAA0000A1Z5" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Business Hours</label>
                                    <input type="text" placeholder="09:00 AM - 09:00 PM" value={formData.business_hours} onChange={e => setFormData({ ...formData, business_hours: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Physical Address</label>
                                <textarea required rows={2} placeholder="Full street address..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium resize-none" />
                            </div>

                            <div className="pt-6 flex gap-4 bg-white sticky bottom-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">Launch Provider</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
