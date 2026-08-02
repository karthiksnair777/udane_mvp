import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopService, OrderService, OrderItemService } from '../../lib/api';
import { Shop, Product } from '../../lib/supabase';
import { ChevronLeft, ShoppingBag, ShieldCheck, Clock, MapPin, Store, Leaf, Zap, ArrowRight, Truck } from 'lucide-react';
import { indianFormat } from '../../lib/utils';

export function Checkout() {
    const { id: shopId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdOrderNumber, setCreatedOrderNumber] = useState('');
    const [shop, setShop] = useState<Shop | null>(null);
    
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
    });

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    useEffect(() => {
        const savedCart = localStorage.getItem(`cart_${shopId}`);
        if (savedCart) setCart(JSON.parse(savedCart));

        if (shopId) {
            ShopService.getAll().then(({ data }) => {
                const s = (data as Shop[])?.find(x => x.id === shopId);
                if (s) setShop(s);
            });
        }
    }, [shopId]);

    const total = cart.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const placeOrder = async () => {
        setLoading(true);
        try {
            const orderNum = `ORD-${Math.floor(Math.random() * 1000000)}`;
            const orderPayload = {
                shop_id: shopId,
                order_number: orderNum,
                total_amount: total,
                status: 'pending',
                payment_status: 'pending',
                customer_name: customerData.name,
                customer_phone: customerData.phone
            };
            
            const { data: orderData, error } = await OrderService.create(orderPayload);
            if (error) throw error;

            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.selling_price,
                total_price: item.product.selling_price * item.quantity
            }));
            await OrderItemService.createMany(orderItems);

            setCreatedOrderNumber(orderNum);
            setSuccess(true);
            localStorage.removeItem(`cart_${shopId}`);
        } catch (e: any) {
            alert(e.message);
        }
        setLoading(false);
    };

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setOtpSent(true);
            setLoading(false);
        }, 1000); 
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === '1234') {
            placeOrder();
        } else {
            alert('Invalid OTP (use 1234 for testing)');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-900 pb-20 md:pb-0 overflow-hidden relative">
                {/* Confetti Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=80')] bg-cover bg-center opacity-10 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/80 to-gray-900"></div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                        <div className="w-28 h-28 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.5)] relative z-10 animate-in zoom-in duration-500 spring">
                            <span className="text-5xl">🎉</span>
                        </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        It's ordered!
                    </h2>
                    <p className="text-emerald-100 font-medium text-lg mb-10 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        {shop?.name} is preparing your fresh groceries. We'll alert you when it's ready.
                    </p>

                    <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[32px] border border-white/20 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-5">
                            <span className="text-gray-400 font-medium uppercase tracking-widest text-xs">Order Number</span>
                            <span className="font-black text-white tracking-wider text-xl">#{createdOrderNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-left border-b border-white/10 pb-5 mb-5">
                            <div className="w-12 h-12 bg-white/10 rounded-[16px] flex items-center justify-center shrink-0 text-emerald-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-400 text-sm">Estimated Pickup</p>
                                <p className="text-white font-black text-2xl tracking-tight">18 Minutes</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-white/10 rounded-[16px] flex items-center justify-center shrink-0 text-amber-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-400 text-sm">Pickup Location</p>
                                <p className="text-white font-bold text-lg leading-tight">{shop?.name}</p>
                                <p className="text-gray-400 text-sm">{shop?.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-md space-y-4 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                        <button onClick={() => navigate('/orders')} className="w-full py-4 bg-emerald-500 text-gray-900 rounded-[20px] font-black text-lg hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                            Track Live Status <ArrowRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate('/')} className="w-full py-4 bg-transparent text-white font-bold hover:bg-white/10 rounded-[20px] transition-colors">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#fbfbfd] pb-[100px] md:pb-0 font-sans">
            {/* Minimalist Premium Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20 px-4 py-4 md:px-8 shadow-sm flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-900 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 flex flex-col items-center mr-10">
                    <h2 className="font-black text-lg text-gray-900 tracking-tight leading-none flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure Checkout
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 lg:gap-10">
                    
                    {/* Left Column: Customer Details & Trust */}
                    <div className="w-full md:w-[60%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">You're almost there.</h1>
                            <p className="text-gray-500 font-medium mt-2">Enter your details to confirm your pickup order.</p>
                        </div>

                        {cart.length > 0 && (
                            <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative">
                                
                                {!otpSent ? (
                                    <form onSubmit={handleSendOtp} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                                            <input required type="text" value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} className="w-full p-4 bg-gray-50/80 border border-gray-200 rounded-[20px] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-gray-900" placeholder="e.g. Rahul Sharma" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                                            <div className="flex relative">
                                                <span className="absolute left-4 top-[17px] font-bold text-gray-400">+91</span>
                                                <input required type="tel" value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} className="w-full pl-14 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-[20px] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-gray-900" placeholder="98765 43210" pattern="[0-9]{10}" />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 ml-1 font-medium flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> We'll never share your number.
                                            </p>
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-bold text-lg mt-6 hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                                            {loading ? 'Securing Connection...' : 'Continue to Verification'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[24px] flex gap-4 text-emerald-900">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Verification sent!</h4>
                                                <p className="text-sm mt-1 font-medium text-emerald-700">Enter the 4-digit code sent to +91 {customerData.phone}.</p>
                                                <p className="text-xs mt-1 opacity-60">(Demo Mode: Use 1234)</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2 text-center">Enter Code</label>
                                            <input required type="text" autoFocus value={otp} onChange={e => setOtp(e.target.value)} className="w-full max-w-[250px] mx-auto block p-4 bg-gray-50 border border-gray-200 rounded-[24px] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-center text-4xl font-black tracking-[0.5em] text-gray-900 transition-all" placeholder="----" maxLength={4} />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-bold text-lg mt-4 hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                                            {loading ? 'Processing...' : 'Verify & Place Order'}
                                        </button>
                                        <div className="text-center">
                                            <button type="button" onClick={() => setOtpSent(false)} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Use a different number</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Marketing Trust Badges */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-600">
                                    <Leaf className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">Fresh Quality</span>
                            </div>
                            <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">Instant Pack</span>
                            </div>
                            <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">No Fees</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full md:w-[40%] animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                            
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-[16px] flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                                    {shop?.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover"/> : <Store className="w-6 h-6 text-gray-400" />}
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup At</p>
                                    <h3 className="font-black text-lg text-gray-900 leading-tight">{shop?.name}</h3>
                                </div>
                            </div>

                            <h3 className="font-extrabold text-sm text-gray-900 mb-4 tracking-tight uppercase">
                                Order Summary ({totalItems} items)
                            </h3>
                            
                            {cart.length === 0 ? (
                                <p className="text-gray-500 font-medium">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-5">
                                    <div className="max-h-64 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="flex justify-between items-center gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-[12px] flex items-center justify-center shrink-0 overflow-hidden relative">
                                                        {item.product.image_url ? (
                                                            <img src={item.product.image_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-5 h-5 text-gray-300" />
                                                        )}
                                                        <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-800 text-sm leading-tight">{item.product.name}</span>
                                                </div>
                                                <span className="font-black text-gray-900 shrink-0">₹{indianFormat(item.product.selling_price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Subtotal</span>
                                            <span className="text-gray-900 font-bold">₹{indianFormat(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Pickup Fee</span>
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">FREE</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-[20px] flex justify-between items-center mt-2 border border-gray-100">
                                        <span className="font-bold text-gray-500">Total</span>
                                        <span className="text-2xl font-black text-gray-900 tracking-tight">₹{indianFormat(total)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center font-medium">Payment will be collected at the store.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
