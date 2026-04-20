import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/AuthContext';
import { supabase, Product } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Search, Plus, Minus, Trash2, Receipt, BadgeIndianRupee, ShoppingCart, PackageOpen, Image as ImageIcon, CreditCard, Banknote, QrCode, Wallet, Percent, X, CheckCircle2 } from 'lucide-react';

type CartItem = Product & { cartQuantity: number };

export function POS() {
    const { user } = useUser();
    const shopId = user?.profile?.shop_id as string | undefined;

    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Wallet' | 'Split'>('Cash');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    
    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [amountTendered, setAmountTendered] = useState<number | ''>('');

    useEffect(() => {
        if (!shopId) return;

        // Load available products
        supabase
            .from('products')
            .select('*')
            .eq('shop_id', shopId)
            .gt('stock_quantity', 0)
            .order('name', { ascending: true })
            .then(({ data }) => {
                if (data) setProducts(data);
            });
    }, [shopId]);

    const filteredProducts = useMemo(() => {
        if (!search) return products;
        return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search) || p.sku?.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.stock_quantity) return prev;
                return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
        setSearch('');
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.cartQuantity + delta;
                if (newQ > item.stock_quantity) return item;
                if (newQ < 1) return item;
                return { ...item, cartQuantity: newQ };
            }
            return item;
        }).filter(item => item.cartQuantity > 0));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Calculations
    const subTotal = cart.reduce((acc, item) => acc + (item.selling_price * item.cartQuantity), 0);
    const taxTotal = cart.reduce((acc, item) => {
        const itemTax = (item.selling_price * (item.tax_percentage || 0) / 100) * item.cartQuantity;
        return acc + itemTax;
    }, 0);
    const grandTotal = Math.max(0, subTotal + taxTotal - discountAmount);

    const handleCheckout = async () => {
        if (cart.length === 0 || !shopId) return;
        setLoading(true);

        try {
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

            // 1. Create Sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    shop_id: shopId,
                    invoice_number: invoiceNumber,
                    total_amount: grandTotal,
                    payment_method: paymentMethod.toLowerCase() === 'wallet' ? 'upi' : paymentMethod.toLowerCase()
                })
                .select()
                .single();

            if (saleError) throw new Error(saleError.message);
            const newSaleId = saleData?.id;

            if (!newSaleId) throw new Error('Failed to create sale');

            // 2. Insert Sale Items
            const saleItems = cart.map(item => ({
                sale_id: newSaleId,
                product_id: item.id,
                quantity: item.cartQuantity,
                unit_price: item.selling_price,
                total_price: (item.selling_price * item.cartQuantity) + (item.selling_price * (item.tax_percentage || 0) / 100) * item.cartQuantity
            }));

            await supabase.from('sale_items').insert(saleItems);

            // 3. Decrease Stock levels manually
            for (const item of cart) {
                await supabase
                    .from('products')
                    .update({ stock_quantity: item.stock_quantity - item.cartQuantity })
                    .eq('id', item.id);
            }

            const currentReceipt = {
                invoiceNumber,
                items: [...cart],
                subTotal,
                taxTotal,
                discountAmount,
                grandTotal,
                paymentMethod,
                amountTendered,
                date: new Date().toLocaleString()
            };
            setReceiptData(currentReceipt);

            setMessage(`Receipt ${invoiceNumber} created successfully!`);
            setCart([]);
            setDiscountAmount(0);
            setAmountTendered('');
            setIsPaymentModalOpen(false); // Close modal
            setShowPaymentSuccess(true);

            // reload inventory
            const { data } = await supabase.from('products').select('*').eq('shop_id', shopId).gt('stock_quantity', 0);
            if (data) setProducts(data);

        } catch (e: any) {
            console.error(e);
            setMessage(e.message || 'Error occurred during checkout');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (!shopId) return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-rose-100 max-w-sm w-full">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageOpen className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Assigned</h2>
                <p className="text-gray-500">Your account hasn't been linked to any store. Please contact your Super Admin to begin selling.</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50">
            {/* Search & Products - Left Side */}
            <div className="flex-[2] bg-gray-50 p-6 flex flex-col gap-6 overflow-hidden print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-green-500 tracking-tight">Point of Sale</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Search by name, SKU, or scan barcode</p>
                    </div>

                    <div className="relative w-full md:w-80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)]">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 hide-scrollbar px-1 pb-6">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white rounded-2xl border border-gray-100/80 text-left hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
                                >
                                    <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-white/20">
                                            {product.stock_quantity} left
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-extrabold text-emerald-600 text-lg">₹{product.selling_price}</span>
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <PackageOpen className="w-16 h-16 mb-4 opacity-40 text-emerald-500" />
                            <p className="text-lg font-medium">No products found for "{search}"</p>
                            <button onClick={() => setSearch('')} className="mt-4 text-emerald-600 font-bold hover:underline">Clear search</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart & Payment - Right Side */}
            <div className="w-full lg:w-[450px] bg-white border-l border-gray-100 flex flex-col shadow-2xl z-10 relative print:hidden">
                <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between z-10 sticky top-0">
                    <div className="flex flex-col">
                        <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-emerald-500" /> Current Invoice
                        </h3>
                        {cart.length > 0 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1">{cart.length} items selected</span>}
                    </div>
                    {cart.length > 0 && <button onClick={() => { setCart([]); setDiscountAmount(0); }} className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50" title="Clear All"><Trash2 className="w-5 h-5" /></button>}
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-3 hide-scrollbar relative">
                    {cart.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-white">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                                <ShoppingCart className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="font-bold text-gray-600">Your cart is empty</p>
                            <p className="text-sm mt-1 text-gray-400">Scan barcodes or add from catalog.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-3 group animate-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
                                        )}
                                        <h4 className="font-bold text-sm text-gray-800 leading-tight">{item.name}</h4>
                                    </div>
                                    <span className="font-extrabold text-gray-900 border border-gray-100 px-2 py-1 rounded-lg bg-gray-50/50">₹{indianFormat(item.selling_price * item.cartQuantity)}</span>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors shadow-sm"><Minus className="w-4 h-4" /></button>
                                        <span className="w-10 text-center font-bold text-gray-700">{item.cartQuantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Section */}
                <div className="bg-white border-t border-gray-100 flex flex-col z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl mt-[-1rem]">

                    <div className="p-6 space-y-5">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500 font-medium border-b border-gray-50 pb-2">
                                <span>Subtotal</span>
                                <span className="text-gray-900 font-bold">₹{indianFormat(subTotal)}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <div className="flex items-center gap-2 text-rose-500 font-medium">
                                    <Percent className="w-3.5 h-3.5" /> Discount
                                </div>
                                <div className="flex items-center gap-1 group">
                                    <span className="text-gray-400 font-bold">- ₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discountAmount || ''}
                                        onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                                        className="w-16 bg-gray-50 text-rose-600 font-bold text-right p-1 rounded border border-transparent group-hover:border-rose-200 focus:border-rose-500 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {taxTotal > 0 && <div className="flex justify-between text-gray-500 font-medium pb-2 border-b border-gray-50">
                                <span>Taxes (CGST/SGST)</span>
                                <span className="text-gray-900 font-bold">₹{indianFormat(taxTotal)}</span>
                            </div>}

                            <div className="flex justify-between items-end font-black text-gray-900 pt-2 text-xl">
                                <span>Total Amount</span>
                                <span className="text-emerald-600 text-3xl font-black tracking-tight" style={{ textShadow: '0 2px 10px rgba(16,185,129,0.2)' }}>₹{indianFormat(grandTotal)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Payment Method</span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'Cash', icon: Banknote, color: 'emerald' },
                                    { id: 'UPI', icon: QrCode, color: 'purple' },
                                    { id: 'Card', icon: CreditCard, color: 'blue' },
                                    { id: 'Wallet', icon: Wallet, color: 'orange' },
                                    { id: 'Split', icon: Receipt, color: 'indigo' },
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`flex-1 flex gap-2 items-center justify-center p-3 rounded-2xl border-2 transition-all min-w-[30%] ${paymentMethod === method.id ? `bg-${method.color}-50 border-${method.color}-500 text-${method.color}-700 shadow-sm` : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'}`}
                                    >
                                        <method.icon className="w-4 h-4" />
                                        <span className="text-xs font-bold">{method.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {message && !showPaymentSuccess && (
                            <div className="text-center text-sm font-bold py-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 animate-in fade-in shadow-sm">
                                {message}
                            </div>
                        )}

                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            disabled={cart.length === 0 || loading}
                            className={`w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden ${cart.length === 0 || loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_8px_30px_rgba(16,185,129,0.3)] active:scale-[0.98]'
                                }`}
                        >
                            {!loading && !showPaymentSuccess && <BadgeIndianRupee className="w-6 h-6" />}
                            {showPaymentSuccess ? (
                                'Payment Successful! 🎉'
                            ) : (
                                'Proceed to Payment'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Processing Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 scale-in-center">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {paymentMethod === 'Cash' && <Banknote className="w-6 h-6 text-emerald-500" />}
                                {paymentMethod === 'UPI' && <QrCode className="w-6 h-6 text-purple-500" />}
                                {paymentMethod === 'Card' && <CreditCard className="w-6 h-6 text-blue-500" />}
                                Payment: {paymentMethod}
                            </h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-500 font-medium mb-1">Amount to Pay</p>
                                <h2 className="text-5xl font-black text-gray-900 tracking-tight">₹{indianFormat(grandTotal)}</h2>
                            </div>

                            {paymentMethod === 'Cash' && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Cash Received from Customer</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-4 font-bold text-gray-400">₹</span>
                                            <input 
                                                type="number" 
                                                autoFocus
                                                value={amountTendered} 
                                                onChange={e => setAmountTendered(Number(e.target.value) || '')}
                                                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {[100, 500, 1000, 2000].map(amt => (
                                            <button 
                                                key={amt} 
                                                onClick={() => setAmountTendered(amt)}
                                                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
                                            >
                                                +₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className={`p-4 rounded-2xl border transition-colors ${typeof amountTendered === 'number' && amountTendered >= grandTotal ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                        <p className="text-sm font-bold mb-1 uppercase tracking-wide">Change Due</p>
                                        <p className="text-3xl font-black">
                                            ₹{typeof amountTendered === 'number' && amountTendered >= grandTotal ? indianFormat(amountTendered - grandTotal) : '0.00'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'UPI' && (
                                <div className="flex flex-col items-center justify-center space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="w-56 h-56 bg-white border-4 border-gray-100 p-3 rounded-3xl shadow-sm flex items-center justify-center relative overflow-hidden group">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=shopkeeper@upi&pn=UdanePOS&am=${grandTotal}`} alt="UPI QR Code" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-gray-500 font-medium text-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">Ask customer to scan with PhonePe, GPay, or Paytm</p>
                                </div>
                            )}

                            {paymentMethod === 'Card' && (
                                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse shadow-inner border-[6px] border-white">
                                        <CreditCard className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-gray-900 text-xl">Awaiting Terminal</p>
                                        <p className="text-gray-500 mt-2 font-medium">Please swipe, dip, or tap the card on the POS machine to process ₹{indianFormat(grandTotal)}.</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-6 bg-gray-50/80 border-t border-gray-100">
                            <button
                                onClick={handleCheckout}
                                disabled={loading || (paymentMethod === 'Cash' && (typeof amountTendered !== 'number' || amountTendered < grandTotal))}
                                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                                    loading || (paymentMethod === 'Cash' && (typeof amountTendered !== 'number' || amountTendered < grandTotal))
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-black shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] active:scale-[0.98]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" /> Confirm & Print Receipt
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Receipt Modal */}
            {showPaymentSuccess && receiptData && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        
                        {/* Printable Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white text-black print:p-0 print:overflow-visible dark:text-gray-900">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-black uppercase tracking-widest">{user?.profile?.name || 'Udane POS'}</h1>
                                <p className="text-sm text-gray-500 font-mono mt-1">{receiptData.date}</p>
                                <p className="text-sm text-gray-500 font-mono">Invoice: {receiptData.invoiceNumber}</p>
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
                                    {receiptData.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-left break-words max-w-[120px]">{item.name}</td>
                                            <td className="py-2 text-center">{item.cartQuantity}</td>
                                            <td className="py-2 text-right">₹{indianFormat(item.selling_price * item.cartQuantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                            <div className="space-y-1 font-mono text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{indianFormat(receiptData.subTotal)}</span></div>
                                <div className="flex justify-between"><span>Discount</span><span>-₹{indianFormat(receiptData.discountAmount)}</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>₹{indianFormat(receiptData.taxTotal)}</span></div>
                            </div>

                            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                            <div className="flex justify-between items-center text-xl font-black mb-4">
                                <span>TOTAL</span>
                                <span>₹{indianFormat(receiptData.grandTotal)}</span>
                            </div>

                            <div className="space-y-1 font-mono text-xs text-gray-500">
                                <div className="flex justify-between"><span>Method:</span><span>{receiptData.paymentMethod}</span></div>
                                {receiptData.paymentMethod === 'Cash' && typeof receiptData.amountTendered === 'number' && receiptData.amountTendered > 0 && (
                                    <>
                                        <div className="flex justify-between"><span>Tendered:</span><span>₹{indianFormat(receiptData.amountTendered)}</span></div>
                                        <div className="flex justify-between"><span>Change:</span><span>₹{indianFormat(receiptData.amountTendered - receiptData.grandTotal)}</span></div>
                                    </>
                                )}
                            </div>

                            <div className="text-center mt-8">
                                <QrCode className="w-16 h-16 mx-auto text-gray-800 mb-2" />
                                <p className="font-bold text-sm tracking-widest">THANK YOU!</p>
                                <p className="text-xs text-gray-400 mt-1">Please visit again</p>
                            </div>
                        </div>

                        {/* Actions (Hidden during print) */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-4 print:hidden rounded-b-3xl">
                            <button onClick={() => {setShowPaymentSuccess(false); setReceiptData(null);}} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">New Sale</button>
                            <button onClick={() => window.print()} className="flex-[2] py-3 bg-gray-900 text-white rounded-xl font-extrabold hover:bg-black shadow-lg shadow-gray-900/20 active:scale-95 transition-all outline-none">🖨️ Print Receipt</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
