import { useState, useEffect } from 'react';
import { useUser } from '@insforge/react';
import { insforge, Sale, SaleItem, Product } from '../lib/insforge';
import { indianFormat } from '../lib/utils';
import { Receipt, Search, FileText, CalendarDays, Banknote, CreditCard, QrCode } from 'lucide-react';

export function SalesHistory() {
    const { user } = useUser();
    const shopId = user?.profile?.shop_id as string | undefined;

    const [sales, setSales] = useState<(Sale & { sale_items: (SaleItem & { products: Product })[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!shopId) {
            setLoading(false);
            return;
        }

        const fetchSales = async () => {
            setLoading(true);
            const { data: salesData } = await insforge.database
                .from('sales')
                .select(`
          *,
          sale_items (
            *,
            products (name)
          )
        `)
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (salesData) {
                setSales(salesData as any);
            }
            setLoading(false);
        };

        fetchSales();
    }, [shopId]);

    const filteredSales = search
        ? sales.filter(s => s.invoice_number.toLowerCase().includes(search.toLowerCase()))
        : sales;

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'UPI': return <QrCode className="w-4 h-4" />;
            case 'Card': return <CreditCard className="w-4 h-4" />;
            case 'Cash':
            default: return <Banknote className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Transactions & History</h2>
                    <p className="text-gray-500 mt-1 font-medium">Review past sales, receipts, and order details</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoice number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium">Loading sales history...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 flex flex-col items-center justify-center text-rose-500 bg-rose-50/20">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <Receipt className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Shop Not Assigned</h3>
                        <p className="text-gray-600">Your profile is not linked to any active shop.</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Receipt className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Sales Found</h3>
                        <p className="max-w-sm mx-auto text-center">There are no transactions matching your criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredSales.map(sale => (
                            <div key={sale.id} className="p-6 md:p-8 hover:bg-emerald-50/30 transition-colors duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 group">

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100/50 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{sale.invoice_number}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-1">
                                                <CalendarDays className="w-4 h-4 opacity-70" />
                                                {new Date(sale.created_at).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Items Sold ({sale.sale_items?.length || 0})</p>
                                            <div className="space-y-2">
                                                {sale.sale_items?.map(item => (
                                                    <div key={item.id} className="text-sm flex items-center gap-3">
                                                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md min-w-[2.5rem] text-center">{item.quantity}x</span>
                                                        <span className="font-medium text-gray-700 flex-1">{item.products?.name || 'Unknown Product'}</span>
                                                        <span className="text-gray-400 font-mono text-xs font-medium">@ ₹{item.unit_price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between md:flex-col items-center md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</span>
                                        <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{indianFormat(sale.total_amount)}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border shadow-sm ${sale.payment_method === 'UPI' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        sale.payment_method === 'Card' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                        {getPaymentIcon(sale.payment_method)}
                                        {sale.payment_method}
                                    </span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
