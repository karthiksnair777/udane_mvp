import { useState, useEffect } from 'react';
import { useUser, useShop } from '../contexts/AuthContext';
import { SaleService } from '../lib/api';
import { supabase, Sale, SaleItem, Product } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Receipt, Search, FileText, CalendarDays, Banknote, CreditCard, QrCode, Printer, Undo2 } from 'lucide-react';

export function SalesHistory() {
    const { user } = useUser();
    const { shopId } = useShop();

    const [sales, setSales] = useState<(Sale & { sale_items: (SaleItem & { products: Product })[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [reprintData, setReprintData] = useState<any>(null);
    const [isRefunding, setIsRefunding] = useState(false);

    const handleRefund = async (sale: any) => {
        if (!confirm('Are you certain you want to void this transaction? All items will be restocked and the invoice permanently deleted.')) return;
        setIsRefunding(true);
        try {
            // Re-stock items
            for (const item of sale.sale_items) {
                if (item.product_id) {
                    const { data: prodData } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
                    if (prodData) {
                        await supabase.from('products').update({ stock_quantity: Number(prodData.stock_quantity) + Number(item.quantity) }).eq('id', item.product_id);
                    }
                }
            }
            // Delete invoice
            await SaleService.delete(sale.id);
            setSales(prev => prev.filter(s => s.id !== sale.id));
            alert('Sale voided and inventory restored successfully.');
        } catch (e) {
            console.error('Refund failed', e);
        }
        setIsRefunding(false);
    };

    const handleReprint = (sale: any) => {
        setReprintData({
            invoiceNumber: sale.invoice_number,
            date: new Date(sale.created_at).toLocaleString(),
            items: sale.sale_items.map((i: any) => ({
                id: i.id,
                name: i.products?.name || 'Unknown Item',
                cartQuantity: i.quantity,
                selling_price: i.unit_price
            })),
            subTotal: sale.total_amount,
            discountAmount: 0,
            taxTotal: 0,
            grandTotal: sale.total_amount,
            paymentMethod: sale.payment_method,
            amountTendered: sale.total_amount
        });
    };

    useEffect(() => {
        if (!shopId) {
            setLoading(false);
            return;
        }

        const fetchSales = async () => {
            setLoading(true);
            const { data: salesData } = await SaleService.getByShop(shopId, 50);

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
        switch (method.toLowerCase()) {
            case 'upi': return <QrCode className="w-4 h-4" />;
            case 'card': return <CreditCard className="w-4 h-4" />;
            case 'cash':
            case 'split':
            default: return <Banknote className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 print:hidden">
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

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden print:hidden">
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
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border shadow-sm ${sale.payment_method.toLowerCase() === 'upi' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            sale.payment_method.toLowerCase() === 'card' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {getPaymentIcon(sale.payment_method)}
                                            {sale.payment_method.toUpperCase()}
                                        </span>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleReprint(sale)} className="flex-1 py-1.5 px-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 shadow-sm"><Printer className="w-3.5 h-3.5"/> Print</button>
                                            <button onClick={() => handleRefund(sale)} disabled={isRefunding} className="flex-1 py-1.5 px-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"><Undo2 className="w-3.5 h-3.5"/> Void</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reprint Modal */}
            {reprintData && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex-1 overflow-y-auto p-8 bg-white text-black print:p-0 print:overflow-visible dark:text-gray-900">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-black uppercase tracking-widest">{user?.profile?.name || 'Udane POS'}</h1>
                                <p className="text-sm text-gray-500 font-mono mt-1">{reprintData.date}</p>
                                <p className="text-sm text-gray-500 font-mono">Invoice: {reprintData.invoiceNumber}</p>
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-widest">Duplicate Copy</div>
                            </div>
                            
                            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                            
                            <table className="w-full text-sm font-mono">
                                <thead>
                                    <tr className="border-b-2 border-dashed border-gray-300">
                                        <th className="py-2 text-left">Item</th>
                                        <th className="py-2 text-center">Qty</th>
                                        <th className="py-2 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reprintData.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-left break-words max-w-[120px]">{item.name}</td>
                                            <td className="py-2 text-center">{item.cartQuantity}</td>
                                            <td className="py-2 text-right">₹{indianFormat(item.selling_price * item.cartQuantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                            <div className="flex justify-between items-center text-xl font-black mb-4">
                                <span>TOTAL</span>
                                <span>₹{indianFormat(reprintData.grandTotal)}</span>
                            </div>
                            <div className="space-y-1 font-mono text-xs text-gray-500">
                                <div className="flex justify-between"><span>Method:</span><span className="uppercase">{reprintData.paymentMethod}</span></div>
                            </div>
                            <div className="text-center mt-8">
                                <p className="font-bold text-sm tracking-widest">THANK YOU!</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-4 print:hidden rounded-b-3xl">
                            <button onClick={() => setReprintData(null)} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">Close</button>
                            <button onClick={() => window.print()} className="flex-[2] py-3 bg-gray-900 text-white rounded-xl font-extrabold hover:bg-black shadow-lg shadow-gray-900/20 active:scale-95 transition-all outline-none">🖨️ Print</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
