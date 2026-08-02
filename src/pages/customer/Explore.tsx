import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShopService, ProductService } from '../../lib/api';
import { Shop, Product } from '../../lib/supabase';
import { Store, MapPin, Star, Search, ChevronRight, Leaf, Milk, Cookie, Droplet, Sparkles, CheckCircle, Clock, Heart } from 'lucide-react';
import { indianFormat } from '../../lib/utils';

export function Explore() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [popularProducts, setPopularProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            const { data: shopData } = await ShopService.getAll();
            const activeShops = (shopData as Shop[])?.filter(s => s.status === 'active') || [];
            setShops(activeShops);

            // Fetch a few products for the "Popular Today" section
            if (activeShops.length > 0) {
                const { data: prodData } = await ProductService.getInStock(activeShops[0].id);
                setPopularProducts((prodData as Product[])?.slice(0, 4) || []);
            }
            
            setLoading(false);
        };
        fetchData();
    }, []);

    const categories = [
        { name: 'All', icon: Store, color: 'text-gray-900', bg: 'bg-gray-100' },
        { name: 'Produce', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Dairy', icon: Milk, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Snacks', icon: Cookie, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: 'Household', icon: Droplet, color: 'text-cyan-600', bg: 'bg-cyan-50' }
    ];

    const filteredShops = shops.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                              (s.address && s.address.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const isMorning = new Date().getHours() < 12;
    const greeting = isMorning ? 'Good morning' : 'Good evening';

    return (
        <div className="pb-24 bg-gray-50 min-h-screen font-sans">
            {/* Storytelling Hero Section */}
            <div className="bg-white px-4 md:px-8 pt-8 pb-10 border-b border-gray-100">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium mb-1">{greeting},</p>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                Fresh groceries. <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-400">Zero wait time.</span>
                            </h1>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm">
                            <Sparkles className="w-4 h-4" /> Trusted by 5,000+ Locals
                        </div>
                    </div>

                    <p className="text-gray-600 md:text-lg max-w-xl font-medium">
                        Shop from premium local stores. We'll pack your order so it's ready the moment you arrive.
                    </p>

                    <div className="relative max-w-2xl mt-4 group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for fresh produce, snacks, or local stores..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-3xl text-lg focus:outline-none focus:border-emerald-500 focus:bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] transition-all font-medium text-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-12">
                
                {/* Visual Categories */}
                {!search && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                            {categories.map(cat => (
                                <button 
                                    key={cat.name}
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`snap-start flex flex-col items-center justify-center shrink-0 w-[100px] h-[100px] rounded-3xl transition-all duration-300 border-2 ${
                                        activeCategory === cat.name 
                                        ? 'border-gray-900 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transform -translate-y-1' 
                                        : 'border-transparent bg-white hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${cat.bg}`}>
                                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Offers */}
                {!search && activeCategory === 'All' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group cursor-pointer shadow-lg">
                            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Weekend Special</span>
                                <h3 className="text-2xl md:text-3xl font-black mt-4 mb-2 leading-tight">20% Off Fresh<br/>Organic Produce</h3>
                                <p className="text-purple-200 font-medium mb-6">At Green Basket • Ends Tomorrow</p>
                                <button className="bg-white text-purple-900 px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">Claim Offer</button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hidden md:block">
                            <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                <Heart className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">New Arrival</span>
                                <h3 className="text-2xl md:text-3xl font-black mt-4 mb-2 leading-tight">Artisan Bakery<br/>Now Open</h3>
                                <p className="text-orange-100 font-medium mb-6">Freshly baked bread every morning.</p>
                                <button className="bg-white text-orange-900 px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">Explore Store</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popular Today (Apple-style product cards) */}
                {!search && activeCategory === 'All' && popularProducts.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Popular Today</h2>
                            <button className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700">
                                View all <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {popularProducts.map(product => (
                                <Link to={`/shop/${product.shop_id}`} key={product.id} className="bg-white rounded-[24px] p-3 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col cursor-pointer">
                                    <div className="aspect-square rounded-[16px] overflow-hidden mb-4 bg-gray-50 relative">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-gray-300" /></div>
                                        )}
                                        <button className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-gray-900 hover:bg-emerald-500 hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="px-1 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                        <p className="font-black text-emerald-600 text-lg mt-auto">₹{indianFormat(product.selling_price)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nearby Stores */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {search ? 'Search Results' : 'Nearby Stores'}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1,2,3,4].map((i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 h-40 animate-pulse flex items-center gap-5">
                                    <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-gray-100 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredShops.length === 0 ? (
                        <div className="text-center p-16 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No stores found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">We couldn't find any stores matching "{search}". Try exploring our categories.</p>
                            <button onClick={() => setSearch('')} className="mt-8 bg-gray-900 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-black transition-colors shadow-lg shadow-gray-200">View All Stores</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredShops.map((shop, i) => (
                                <Link 
                                    key={shop.id} 
                                    to={`/shop/${shop.id}`} 
                                    className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300 group flex items-center gap-5"
                                >
                                    <div className="w-28 h-28 bg-gray-50 rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden relative">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <Store className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 shadow-sm">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" /> 4.9
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full py-1">
                                        <h3 className="font-black text-gray-900 text-xl group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">{shop.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 line-clamp-1 mb-3 font-medium">
                                            <MapPin className="w-4 h-4 shrink-0 text-gray-400" /> {shop.address}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                                                <Clock className="w-3.5 h-3.5" /> 15 min pickup
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                                                <Store className="w-3.5 h-3.5 text-gray-500" /> Open Now
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trust Markers Section */}
                {!search && (
                    <div className="mt-16 bg-gray-900 rounded-[32px] p-8 md:p-12 text-white text-center">
                        <h2 className="text-3xl font-black mb-10 tracking-tight">Why shop with Udane?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                                    <Store className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Local Stores</h3>
                                <p className="text-gray-400 font-medium max-w-[250px]">Support your neighborhood merchants while getting the freshest items.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Pickup in Minutes</h3>
                                <p className="text-gray-400 font-medium max-w-[250px]">Order ahead, skip the queue, and grab your packed bags instantly.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No Extra Fees</h3>
                                <p className="text-gray-400 font-medium max-w-[250px]">Zero delivery fees, zero hidden charges. Pay exactly what it costs in-store.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
