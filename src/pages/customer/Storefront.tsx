import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopService, ProductService } from '../../lib/api';
import { Shop, Product } from '../../lib/supabase';
import { Store, ChevronLeft, Search, Plus, Minus, ShoppingBag, Info, MapPin, Star, Sparkles, Clock, ShieldCheck, Heart } from 'lucide-react';
import { indianFormat } from '../../lib/utils';

export function Storefront() {
    const { id: shopId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [shop, setShop] = useState<Shop | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);

    useEffect(() => {
        if (!shopId) return;

        const fetchData = async () => {
            const [shopRes, productsRes] = await Promise.all([
                ShopService.getAll(),
                ProductService.getInStock(shopId)
            ]);

            const currentShop = (shopRes.data as Shop[])?.find(s => s.id === shopId);
            if (currentShop) setShop(currentShop);
            if (productsRes.data) setProducts(productsRes.data as Product[]);
            
            const savedCart = localStorage.getItem(`cart_${shopId}`);
            if (savedCart) setCart(JSON.parse(savedCart));

            setLoading(false);
        };

        fetchData();
    }, [shopId]);

    useEffect(() => {
        if (shopId) {
            localStorage.setItem(`cart_${shopId}`, JSON.stringify(cart));
        }
    }, [cart, shopId]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id 
                    ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) } 
                    : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item => item.product.id === productId 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
                );
            }
            return prev.filter(item => item.product.id !== productId);
        });
    };

    const getQuantity = (productId: string) => {
        return cart.find(item => item.product.id === productId)?.quantity || 0;
    };

    const cartTotal = cart.reduce((total, item) => total + (item.product.selling_price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
    // Mock recommended products
    const recommendedProducts = products.slice(0, 5); 

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <div className="w-16 h-16 bg-gray-200 rounded-[20px] animate-pulse mb-6"></div>
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-gray-50">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Store className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Store Unavailable</h2>
                <p className="text-gray-500 mb-8 max-w-sm">This store might be closed or doesn't exist anymore.</p>
                <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-colors shadow-lg">Browse Nearby Stores</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#fbfbfd] relative pb-[120px] md:pb-0 font-sans">
            
            {/* Apple-style immersive header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 pt-4 px-4 pb-4 md:px-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigate('/')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-900 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-900 transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-900 transition-colors">
                                <Info className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start md:items-center gap-5">
                        <div className="w-20 h-20 bg-gray-50 rounded-[20px] flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden relative">
                            {shop.logo_url ? (
                                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="font-black text-2xl md:text-3xl text-gray-900 tracking-tight leading-tight mb-1">{shop.name}</h1>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mb-2">
                                <MapPin className="w-4 h-4 text-gray-400" /> {shop.address}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> 4.9 (500+ Ratings)</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md flex items-center gap-1"><Clock className="w-3 h-3"/> Ready in 15 mins</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Udane Certified</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search fresh produce, dairy, snacks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border-0 rounded-[20px] text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-6">
                <div className="max-w-5xl mx-auto space-y-10">
                    
                    {/* Recommended Section */}
                    {!search && recommendedProducts.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="font-black text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-amber-500" /> Curated for You
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
                                {recommendedProducts.map(product => {
                                    const quantity = getQuantity(product.id);
                                    return (
                                        <div key={`rec-${product.id}`} className="bg-white rounded-[28px] p-3 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col shrink-0 w-[170px] snap-start transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                            <div className="aspect-square bg-gray-50 rounded-[20px] mb-4 overflow-hidden relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-gray-300" /></div>
                                                )}
                                            </div>
                                            <div className="px-1 flex-1 flex flex-col">
                                                <h4 className="font-bold text-[15px] text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h4>
                                                <p className="font-black text-gray-900 text-lg mb-4">₹{indianFormat(product.selling_price)}</p>
                                                
                                                <div className="mt-auto">
                                                    {quantity === 0 ? (
                                                        <button onClick={() => addToCart(product)} className="w-full py-2.5 bg-gray-900 text-white font-bold text-sm rounded-[14px] hover:bg-black transition-colors active:scale-95 transform">Add</button>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-[14px] p-1.5 shadow-inner">
                                                            <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white text-emerald-700 rounded-[10px] shadow-sm font-bold active:scale-95 transition-transform"><Minus className="w-4 h-4"/></button>
                                                            <span className="font-bold text-emerald-700 text-[15px]">{quantity}</span>
                                                            <button onClick={() => addToCart(product)} disabled={quantity >= product.stock_quantity} className="w-8 h-8 flex items-center justify-center bg-white text-emerald-700 rounded-[10px] shadow-sm font-bold active:scale-95 transition-transform disabled:opacity-50"><Plus className="w-4 h-4"/></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Products Grid (Apple style) */}
                    <div className="space-y-4">
                        <h2 className="font-black text-2xl text-gray-900 tracking-tight">
                            {search ? 'Search Results' : 'Complete Catalog'}
                        </h2>
                        
                        {filteredProducts.length === 0 ? (
                            <div className="text-center p-16 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 font-medium">Try searching for something else like "Milk" or "Bread".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map(product => {
                                    const quantity = getQuantity(product.id);
                                    return (
                                        <div key={product.id} className="bg-white rounded-[32px] p-3 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] flex flex-col group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">
                                            <div className="aspect-square bg-gray-50 rounded-[24px] mb-4 overflow-hidden relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><Store className="w-10 h-10 text-gray-300" /></div>
                                                )}
                                                {product.stock_quantity < 5 && (
                                                    <span className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-widest">Only {product.stock_quantity} left</span>
                                                )}
                                            </div>
                                            <div className="px-2 flex-1 flex flex-col">
                                                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1 line-clamp-2">{product.name}</h3>
                                                <p className="font-black text-gray-900 text-[19px] mb-5 mt-auto">₹{indianFormat(product.selling_price)}</p>
                                                
                                                <div className="pb-1">
                                                    {quantity === 0 ? (
                                                        <button 
                                                            onClick={() => addToCart(product)}
                                                            className="w-full py-3 bg-gray-50 text-gray-900 font-bold text-[15px] rounded-[16px] hover:bg-gray-100 transition-colors border border-gray-100 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 active:scale-95 transform duration-200"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-[16px] p-1.5 shadow-inner">
                                                            <button onClick={() => removeFromCart(product.id)} className="w-10 h-10 flex items-center justify-center bg-white text-emerald-700 rounded-[12px] shadow-sm font-bold active:scale-95 transition-transform"><Minus className="w-5 h-5"/></button>
                                                            <span className="font-bold text-emerald-700 text-[17px] w-8 text-center">{quantity}</span>
                                                            <button onClick={() => addToCart(product)} disabled={quantity >= product.stock_quantity} className="w-10 h-10 flex items-center justify-center bg-white text-emerald-700 rounded-[12px] shadow-sm font-bold disabled:opacity-50 active:scale-95 transition-transform"><Plus className="w-5 h-5"/></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Redesigned Floating Cart */}
            {cartCount > 0 && (
                <div className="fixed bottom-[80px] md:bottom-8 left-0 right-0 px-4 md:px-0 md:max-w-[400px] md:mx-auto z-40 animate-in slide-in-from-bottom-8 duration-500 spring">
                    <button 
                        onClick={() => navigate(`/checkout/${shopId}`)}
                        className="w-full bg-gray-900 text-white rounded-[28px] p-2 pr-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] flex items-center justify-between hover:bg-black transition-all transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/10 rounded-[20px] flex flex-col items-center justify-center relative overflow-hidden">
                                <ShoppingBag className="w-6 h-6 text-emerald-400 mb-0.5" />
                                <span className="text-[10px] font-bold text-white leading-none">{cartCount} ITEMS</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-[13px] text-gray-400 uppercase tracking-widest mb-0.5">Total to Pay</p>
                                <p className="font-black text-2xl leading-none">₹{indianFormat(cartTotal)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">Checkout</span>
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                <ChevronLeft className="w-5 h-5 transform rotate-180" />
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
