import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Package, Clock, CheckCircle2, XCircle, MapPin, Store } from 'lucide-react';
import { indianFormat } from '../../lib/utils';

export function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            // Fetch all orders for demo purposes, ordered by newest first
            const { data } = await supabase
                .from('orders')
                .select('*, shops(*), order_items(*, products(*))')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data) setOrders(data);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-6 h-6 text-orange-500" />;
            case 'preparing': return <Package className="w-6 h-6 text-blue-500" />;
            case 'ready': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
            case 'completed': return <CheckCircle2 className="w-6 h-6 text-gray-400" />;
            case 'cancelled': return <XCircle className="w-6 h-6 text-rose-500" />;
            default: return <Clock className="w-6 h-6 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Waiting for store to confirm';
            case 'preparing': return 'Store is preparing your order';
            case 'ready': return 'Ready for pickup!';
            case 'completed': return 'Order Picked Up';
            case 'cancelled': return 'Order Cancelled';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-50 border-orange-200';
            case 'preparing': return 'bg-blue-50 border-blue-200';
            case 'ready': return 'bg-emerald-50 border-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.15)]';
            case 'completed': return 'bg-gray-50 border-gray-200 opacity-75';
            case 'cancelled': return 'bg-rose-50 border-rose-200 opacity-75';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-4 py-4 md:px-8 shadow-sm">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
            </div>

            <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any pickup orders. Start exploring stores around you!</p>
                        <Link to="/" className="inline-block bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">Explore Stores</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, i) => (
                            <div key={order.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                                
                                {/* Order Status Header */}
                                <div className={`p-6 border-b flex items-start gap-4 transition-all duration-300 ${getStatusColor(order.status)}`}>
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{getStatusText(order.status)}</h3>
                                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                            Order <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-black/10">#{order.order_number}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    
                                    {/* Order Details */}
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                                                <Store className="w-4 h-4 text-emerald-500" /> {order.shops?.name || 'Store'}
                                            </h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" /> {order.shops?.address}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="space-y-3 mb-4">
                                                {order.order_items?.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                                        <div className="flex gap-3">
                                                            <span className="font-black text-xs bg-gray-200 text-gray-600 w-6 h-6 flex items-center justify-center rounded-md shrink-0">{item.quantity}x</span>
                                                            <span className="font-medium text-gray-800 leading-tight">{item.products?.name || 'Item'}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 shrink-0">₹{indianFormat(item.total_price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                                                <span className="font-bold text-gray-500 text-sm">Total Amount</span>
                                                <span className="font-black text-xl text-emerald-600">₹{indianFormat(order.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    {['pending', 'preparing', 'ready'].includes(order.status) && (
                                        <div className="w-full md:w-64 shrink-0 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="font-bold text-gray-900 mb-1 text-center">Pickup Code</p>
                                            <p className="text-xs text-gray-500 mb-4 text-center">Show this to the cashier</p>
                                            
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-4 group relative overflow-hidden">
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}`} alt="Pickup QR" className="w-32 h-32 object-contain group-hover:scale-105 transition-transform" />
                                                {order.status === 'ready' && (
                                                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                        <div className="absolute inset-0 bg-emerald-400 w-full h-1 animate-[scan_2s_ease-in-out_infinite] opacity-50 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="w-full space-y-2">
                                                {order.status === 'ready' ? (
                                                    <div className="bg-emerald-600 text-white font-bold text-center py-2.5 rounded-xl shadow-md animate-pulse">
                                                        Head to the store
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-200 text-gray-500 font-bold text-center py-2.5 rounded-xl text-sm">
                                                        Code active when Ready
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
