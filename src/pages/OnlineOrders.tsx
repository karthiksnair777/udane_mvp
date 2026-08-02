import { useState, useEffect } from 'react';
import { useShop } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../lib/api';
import { insforge } from '../lib/insforge';

import { indianFormat } from '../lib/utils';
import { Package, Clock, CheckCircle2, Search, AlertCircle } from 'lucide-react';

export function OnlineOrders() {
    
    const navigate = useNavigate();
    const { shopId } = useShop();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, preparing, ready, completed
    const [search, setSearch] = useState('');

    const loadOrders = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await OrderService.getByShop(shopId);
        if (data) setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
        
        // InsForge Realtime subscription for new orders
        if (shopId) {
            insforge.realtime.connect().then(() => {
                insforge.realtime.subscribe('orders').then((response: any) => {
                    if (response && !response.ok) {
                        console.error("Realtime subscription failed", response.error);
                    }
                });

                insforge.realtime.on('new_order', (payload: any) => {
                    if (payload.shop_id === shopId) {
                        console.log('InsForge: New Order Update Received', payload);
                        loadOrders();
                    }
                });
            });

            return () => {
                insforge.realtime.unsubscribe('orders');
                insforge.realtime.disconnect();
            };
        }
    }, [shopId]);

    const updateOrderStatus = async (orderId: string, status: string) => {
        await OrderService.updateStatus(orderId, status);
        // Optimistically update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const getFilteredOrders = () => {
        let result = orders;
        if (filter !== 'all') {
            if (filter === 'new') result = result.filter(o => o.status === 'pending');
            else result = result.filter(o => o.status === filter);
        }
        if (search) {
            result = result.filter(o => 
                o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                (o.customers?.name && o.customers.name.toLowerCase().includes(search.toLowerCase()))
            );
        }
        return result;
    };

    const filteredOrders = getFilteredOrders();
    const newCount = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight flex items-center gap-3">
                        Online Orders 
                        {newCount > 0 && <span className="bg-rose-500 text-white text-sm px-2 py-0.5 rounded-full shadow-md animate-pulse">{newCount} New</span>}
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage customer pickup orders in real-time</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders or customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                {['all', 'new', 'preparing', 'ready', 'completed', 'cancelled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-sm border ${
                            filter === f 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        {f === 'all' ? 'All Orders' : f === 'new' ? 'New (Pending)' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium">Loading orders...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 text-center text-rose-500 bg-rose-50/20">
                        <AlertCircle className="w-10 h-10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">Shop Not Assigned</h3>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 h-full">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                        <p className="max-w-sm mx-auto text-center">There are no orders matching your current filters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="p-6 md:p-8 hover:bg-emerald-50/30 transition-colors duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 group">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-extrabold text-xl text-gray-900">Order #{order.order_number}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {new Date(order.created_at).toLocaleString()}
                                    </p>
                                    {(order.customer_name || order.customer_phone) && (
                                        <p className="text-sm text-gray-600 font-medium flex flex-col gap-1">
                                            {order.customer_name && <span><span className="font-bold">Customer:</span> {order.customer_name}</span>}
                                            {order.customer_phone && <span><span className="font-bold">Phone:</span> {order.customer_phone}</span>}
                                        </p>
                                    )}

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="space-y-2">
                                            {order.order_items?.map((item: any) => (
                                                <div key={item.id} className="text-sm flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md min-w-[2.5rem] text-center">{item.quantity}x</span>
                                                        <span className="font-medium text-gray-700">{item.products?.name || 'Unknown'}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">₹{indianFormat(item.total_price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between md:items-end gap-4 shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</span>
                                        <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{indianFormat(order.total_amount)}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 justify-end mt-4">
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Accept & Prepare</button>
                                                <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg hover:bg-rose-100 border border-rose-200">Reject</button>
                                            </>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md">Mark Ready for Pickup</button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button onClick={() => navigate(`/merchant/pos?order_id=${order.id}`)} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black shadow-md flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Collect Payment & Handover</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
