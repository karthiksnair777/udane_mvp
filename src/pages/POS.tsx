import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser, useShop } from '../contexts/AuthContext';
import { ProductService, CustomerService, SaleService, SaleItemService } from '../lib/api';
import { supabase, Product } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Search, Plus, Minus, Trash2, ShoppingCart, PackageOpen, Image as ImageIcon, CreditCard, Banknote, QrCode, Wallet, Percent, X, User, PauseCircle, Keyboard, Star } from 'lucide-react';

type CartItem = Product & { cartQuantity: number };

export function POS() {
    const { user } = useUser();
    const { shopId } = useShop();

    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Wallet' | 'Split'>('Cash');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    
    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [amountTendered, setAmountTendered] = useState<number | ''>('');
    
    // Customer & Hold Cart State
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [heldCarts, setHeldCarts] = useState<CartItem[][]>([]);

    // Search input ref for barcode scanner focus
    const searchInputRef = useRef<HTMLInputElement>(null);
    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef<any | null>(null);

    useEffect(() => {
        if (!shopId) return;
        Promise.all([
            ProductService.getInStock(shopId),
            CustomerService.getByShop(shopId)
        ]).then(([productsRes, customersRes]) => {
            if (productsRes.data) setProducts(productsRes.data as any);
            if (customersRes.data) setCustomers(customersRes.data as any);
        });
    }, [shopId]);

    const location = useLocation();
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('order_id');
        if (orderId && shopId) {
            const fetchOrder = async () => {
                const { data } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(*))')
                    .eq('id', orderId)
                    .single();
                
                if (data && data.order_items) {
                    const loadedCart = data.order_items.map((item: any) => ({
                        ...item.products,
                        cartQuantity: item.quantity
                    }));
                    setCart(loadedCart);
                    setMessage(`Loaded Online Order #${data.order_number}`);
                    setTimeout(() => setMessage(''), 3000);
                }
            };
            fetchOrder();
        }
    }, [location.search, shopId]);

    // Handle Barcode Scanner & Keyboard Shortcuts
    const handleBarcodeScanned = useCallback((code: string) => {
        if (!code) return;
        const product = products.find(p => p.barcode === code || p.sku === code);
        if (product) {
            addToCart(product);
            setMessage(`Scanned: ${product.name}`);
        } else {
            setMessage(`Barcode not found: ${code}`);
        }
        setTimeout(() => setMessage(''), 3000);
        setSearch(''); // Clear search if it leaked in
    }, [products]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default browser shortcuts if targeting POS specific
            if (e.key === 'F9') {
                e.preventDefault();
                if (cart.length > 0 && !isPaymentModalOpen && !showPaymentSuccess) {
                    setIsPaymentModalOpen(true);
                }
            } else if (e.key === 'Escape') {
                if (isPaymentModalOpen) {
                    setIsPaymentModalOpen(false);
                } else if (cart.length > 0) {
                    setCart([]);
                    setDiscountAmount(0);
                    setSelectedCustomerId('');
                }
            } else if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Global Barcode Scanner Listener (Rapid Typing)
            // Ignore if typing in an input (except search, where we might want to capture it, but better to let normal input happen if focus is on it)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (e.target !== searchInputRef.current) return;
            }

            if (e.key.length === 1) { // Normal character
                barcodeBuffer.current += e.key;
                
                if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
                
                barcodeTimeout.current = setTimeout(() => {
                    // If buffer is long enough and typed very quickly, it's likely a barcode
                    if (barcodeBuffer.current.length > 4) {
                        handleBarcodeScanned(barcodeBuffer.current);
                    }
                    barcodeBuffer.current = '';
                }, 50); // 50ms timeout for scanner speed
            } else if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 0) {
                    handleBarcodeScanned(barcodeBuffer.current);
                    barcodeBuffer.current = '';
                    if (e.target === searchInputRef.current) {
                         // if they pressed enter in search manually
                         const prod = products.find(p => p.barcode === search || p.sku === search);
                         if (prod) {
                             addToCart(prod);
                             setSearch('');
                         }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, isPaymentModalOpen, showPaymentSuccess, products, handleBarcodeScanned, search]);

    // Keep focus on search input for easy barcode scanning without clicking
    useEffect(() => {
        if (!isPaymentModalOpen && !showPaymentSuccess) {
            searchInputRef.current?.focus();
        }
    }, [isPaymentModalOpen, showPaymentSuccess]);

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

            const salePayload: any = {
                shop_id: shopId,
                invoice_number: invoiceNumber,
                total_amount: grandTotal,
                payment_method: paymentMethod.toLowerCase() === 'wallet' ? 'upi' : paymentMethod.toLowerCase()
            };
            if (selectedCustomerId) salePayload.customer_id = selectedCustomerId;

            const { data: saleData, error: saleError } = await SaleService.create(salePayload);

            if (saleError) throw new Error((saleError as any).message);
            const newSaleId = saleData?.id;

            if (!newSaleId) throw new Error('Failed to create sale');

            const saleItems = cart.map(item => ({
                sale_id: newSaleId,
                product_id: item.id,
                quantity: item.cartQuantity,
                unit_price: item.selling_price,
                total_price: (item.selling_price * item.cartQuantity) + (item.selling_price * (item.tax_percentage || 0) / 100) * item.cartQuantity
            }));

            await SaleItemService.createMany(saleItems);

            for (const item of cart) {
                await ProductService.update(item.id, { stock_quantity: item.stock_quantity - item.cartQuantity });
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
                date: new Date().toLocaleString(),
                customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in Customer'
            };
            setReceiptData(currentReceipt);

            setCart([]);
            setDiscountAmount(0);
            setAmountTendered('');
            setIsPaymentModalOpen(false);
            setShowPaymentSuccess(true);

            const { data } = await ProductService.getInStock(shopId);
            if (data) setProducts(data as any);
            
            const params = new URLSearchParams(location.search);
            const orderId = params.get('order_id');
            if (orderId) {
                await supabase.from('orders').update({ status: 'completed', payment_status: 'paid' }).eq('id', orderId);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

        } catch (e: any) {
            console.error(e);
            setMessage(e.message || 'Error occurred during checkout');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (!shopId) return (
        <div className="h-full flex items-center justify-center p-12">
            <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-rose-100 max-w-sm w-full">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageOpen className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Assigned</h2>
                <p className="text-gray-500">Your account hasn't been linked to any store.</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50">
            {/* Left Side: Products & Search */}
            <div className="flex-[2] bg-gray-50 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-hidden print:hidden relative">
                
                {/* Floating Notification */}
                {message && !showPaymentSuccess && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl animate-in slide-in-from-top-4 fade-in">
                        {message}
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                Point of Sale
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium hidden md:block">Ready to scan barcode</p>
                        </div>
                        <button 
                            onClick={() => setShowShortcuts(!showShortcuts)}
                            className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
                        >
                            <Keyboard className="w-4 h-4" /> Shortcuts
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 shadow-sm">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Find products or scan barcode... (F2)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-900"
                        />
                    </div>
                </div>

                {showShortcuts && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800 text-sm flex gap-6 flex-wrap animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2"><kbd className="bg-white border border-emerald-200 px-2 py-1 rounded shadow-sm font-mono font-bold text-xs">F9</kbd> Checkout</div>
                        <div className="flex items-center gap-2"><kbd className="bg-white border border-emerald-200 px-2 py-1 rounded shadow-sm font-mono font-bold text-xs">F2</kbd> Search</div>
                        <div className="flex items-center gap-2"><kbd className="bg-white border border-emerald-200 px-2 py-1 rounded shadow-sm font-mono font-bold text-xs">Esc</kbd> Clear Cart / Close Modal</div>
                        <div className="flex items-center gap-2"><QrCode className="w-4 h-4"/> Auto-detect Barcode Scanner</div>
                    </div>
                )}

                <div className="flex-1 overflow-auto bg-gray-50 hide-scrollbar pb-6 pr-2">
                    {/* Favorites / Featured Row */}
                    {!search && products.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Quick Add</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {products.slice(0, 5).map(product => (
                                    <button
                                        key={`quick-${product.id}`}
                                        onClick={() => addToCart(product)}
                                        className="bg-white p-3 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all text-left flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                            {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-300 m-auto mt-2.5" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                                            <p className="text-emerald-600 font-black text-sm">₹{product.selling_price}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white rounded-2xl border border-gray-100 text-left hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
                                >
                                    <div className="h-32 w-full bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-gray-300" />
                                        )}
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-gray-700 shadow-sm border border-black/5">
                                            {product.stock_quantity}
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                                        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-black text-emerald-600">₹{product.selling_price}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <PackageOpen className="w-16 h-16 mb-4 opacity-40 text-emerald-500" />
                            <p className="text-lg font-medium">No products found for "{search}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Cart */}
            <div className="w-full lg:w-[420px] bg-white border-l border-gray-100 flex flex-col shadow-2xl z-10 print:hidden relative">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="font-black text-gray-900 text-xl flex items-center gap-2 tracking-tight">
                            Current Order
                        </h3>
                        <div className="flex gap-2">
                            {cart.length > 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">{cart.reduce((a,b)=>a+b.cartQuantity, 0)} items</span>}
                            {heldCarts.length > 0 && <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full mt-1 cursor-pointer hover:bg-orange-200" onClick={() => {setCart(heldCarts[0]); setHeldCarts(heldCarts.slice(1));}}>{heldCarts.length} Held</span>}
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <div className="flex gap-1">
                            <button onClick={() => { setHeldCarts([...heldCarts, cart]); setCart([]); setDiscountAmount(0); setSelectedCustomerId(''); }} className="text-gray-400 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 transition-colors p-2.5 rounded-xl border border-gray-100" title="Hold Cart"><PauseCircle className="w-5 h-5" /></button>
                            <button onClick={() => { setCart([]); setDiscountAmount(0); setSelectedCustomerId(''); }} className="text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 transition-colors p-2.5 rounded-xl border border-gray-100" title="Clear All (Esc)"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-3 hide-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner border border-gray-200">
                                <ShoppingCart className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="font-bold text-gray-500">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-sm text-gray-800 flex-1 leading-tight">{item.name}</h4>
                                    <span className="font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg text-sm border border-gray-100">₹{indianFormat(item.selling_price * item.cartQuantity)}</span>
                                </div>
                                <div className="flex justify-between items-center w-full mt-1">
                                    <div className="flex items-center gap-1 bg-gray-100/50 border border-gray-100 rounded-lg p-0.5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 rounded shadow-sm"><Minus className="w-4 h-4" /></button>
                                        <span className="w-8 text-center font-bold text-gray-700 text-sm">{item.cartQuantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 rounded shadow-sm"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500 p-2 rounded-xl">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] p-5">
                    <div className="space-y-4 mb-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <User className="w-4 h-4 text-emerald-500 shrink-0" />
                            <select 
                                className="flex-1 bg-transparent text-sm font-bold text-gray-700 focus:ring-0 outline-none cursor-pointer p-0 border-none"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                            </select>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-sm font-bold text-rose-500 flex items-center gap-1"><Percent className="w-3.5 h-3.5"/> Discount</span>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-400">- ₹</span>
                                <input
                                    type="number"
                                    value={discountAmount || ''}
                                    onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                                    className="w-16 bg-gray-50 border border-transparent rounded text-right font-bold focus:bg-white focus:border-rose-300 outline-none text-rose-600 p-1"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-1">
                            <span className="font-bold text-gray-500">Total</span>
                            <span className="text-3xl font-black text-emerald-600 tracking-tight">₹{indianFormat(grandTotal)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        disabled={cart.length === 0 || loading}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                            cart.length === 0 || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/20 active:scale-[0.98]'
                        }`}
                    >
                        Checkout <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono ml-2">F9</span>
                    </button>
                </div>
            </div>

            {/* Payment Processing Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                                Complete Payment
                            </h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-gray-500 font-medium mb-1 text-sm">Amount to Pay</p>
                                <h2 className="text-4xl font-black text-emerald-600 tracking-tight">₹{indianFormat(grandTotal)}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[
                                    { id: 'Cash', icon: Banknote, color: 'emerald' },
                                    { id: 'UPI', icon: QrCode, color: 'purple' },
                                    { id: 'Card', icon: CreditCard, color: 'blue' },
                                    { id: 'Wallet', icon: Wallet, color: 'orange' },
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`flex gap-2 items-center justify-center p-3 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? `bg-${method.color}-50 border-${method.color}-500 text-${method.color}-700 shadow-sm` : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <method.icon className="w-5 h-5" />
                                        <span className="font-bold">{method.id}</span>
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'Cash' && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Cash Received</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 font-black text-gray-400">₹</span>
                                            <input 
                                                type="number" 
                                                autoFocus
                                                value={amountTendered} 
                                                onChange={e => setAmountTendered(Number(e.target.value) || '')}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {[100, 500, 1000, 2000].map(amt => (
                                            <button key={amt} onClick={() => setAmountTendered(amt)} className="flex-1 py-2 bg-white border border-gray-200 rounded-lg font-bold text-xs hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition-colors">+₹{amt}</button>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-gray-500 text-sm">Change Due</span>
                                        <span className="text-xl font-black text-gray-900">
                                            ₹{typeof amountTendered === 'number' && amountTendered >= grandTotal ? indianFormat(amountTendered - grandTotal) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'UPI' && (
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 relative">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=shopkeeper@upi&pn=Udane&am=${grandTotal}`} alt="UPI" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 mt-4">Scan with any UPI app</p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={loading || (paymentMethod === 'Cash' && (typeof amountTendered !== 'number' || amountTendered < grandTotal))}
                                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 mt-6 transition-all ${
                                    loading || (paymentMethod === 'Cash' && (typeof amountTendered !== 'number' || amountTendered < grandTotal))
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_8px_30px_rgba(16,185,129,0.25)] active:scale-95'
                                }`}
                            >
                                {loading ? 'Processing...' : 'Confirm & Print Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Receipt Modal - Premium Layout */}
            {showPaymentSuccess && receiptData && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-[380px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-8 bg-white text-gray-900 print:p-0 print:overflow-visible receipt-print-area font-mono text-sm">
                            <div className="text-center mb-6">
                                <div className="w-10 h-10 mx-auto text-black mb-2" />
                                <h1 className="text-2xl font-black uppercase tracking-widest leading-none">{user?.profile?.name || 'UDANE STORE'}</h1>
                                <p className="text-xs mt-2 opacity-70">Tax Invoice / Bill of Supply</p>
                            </div>
                            
                            <div className="text-xs space-y-1 mb-4 opacity-80">
                                <p>Date: {receiptData.date}</p>
                                <p>Inv : {receiptData.invoiceNumber}</p>
                                <p>Cust: {receiptData.customerName}</p>
                            </div>
                            
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b-2 border-dashed border-gray-400">
                                        <th className="py-2 text-left w-[60%]">Item</th>
                                        <th className="py-2 text-center w-[15%]">Qty</th>
                                        <th className="py-2 text-right w-[25%]">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold">
                                    {receiptData.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-left pr-2">{item.name}</td>
                                            <td className="py-2 text-center">{item.cartQuantity}</td>
                                            <td className="py-2 text-right">{(item.selling_price * item.cartQuantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                            <div className="space-y-1 text-xs font-bold opacity-80">
                                <div className="flex justify-between"><span>Subtotal</span><span>{receiptData.subTotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Discount</span><span>-{receiptData.discountAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>{receiptData.taxTotal.toFixed(2)}</span></div>
                            </div>

                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                            <div className="flex justify-between items-center text-xl font-black mb-4">
                                <span>TOTAL</span>
                                <span>₹{indianFormat(receiptData.grandTotal)}</span>
                            </div>

                            <div className="space-y-1 text-xs font-bold opacity-80">
                                <div className="flex justify-between"><span>Payment Method:</span><span>{receiptData.paymentMethod}</span></div>
                                {receiptData.paymentMethod === 'Cash' && (
                                    <>
                                        <div className="flex justify-between"><span>Tendered:</span><span>{receiptData.amountTendered.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Change:</span><span>{(receiptData.amountTendered - receiptData.grandTotal).toFixed(2)}</span></div>
                                    </>
                                )}
                            </div>

                            <div className="text-center mt-10">
                                <QrCode className="w-20 h-20 mx-auto text-black mb-3" />
                                <p className="font-black text-sm tracking-widest">THANK YOU</p>
                                <p className="text-[10px] mt-1 opacity-70">Powered by Udane POS</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
                            <button onClick={() => {setShowPaymentSuccess(false); setReceiptData(null);}} className="flex-1 py-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">New Sale</button>
                            <button onClick={() => window.print()} className="flex-[2] py-3 bg-gray-900 text-white rounded-xl font-black hover:bg-black active:scale-95 transition-transform flex items-center justify-center gap-2">
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
