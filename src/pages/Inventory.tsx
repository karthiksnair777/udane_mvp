import { useState, useEffect } from 'react';
import { useShop } from '../contexts/AuthContext';
import { ProductService } from '../lib/api';
import { Product } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Package, Image as ImageIcon, Barcode, ScanBarcode } from 'lucide-react';

export function Inventory() {
    
    const { shopId } = useShop();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        selling_price: '',
        cost_price: '',
        tax_percentage: '0',
        stock_quantity: '0',
        image_url: '',
        sku: '',
        barcode: ''
    });

    const loadProducts = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await ProductService.getByShop(shopId);

        if (data) setProducts(data as any);
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, [shopId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) return;

        const payload = {
            shop_id: shopId,
            name: formData.name,
            selling_price: Number(formData.selling_price),
            cost_price: formData.cost_price ? Number(formData.cost_price) : 0,
            tax_percentage: Number(formData.tax_percentage),
            stock_quantity: Number(formData.stock_quantity),
            image_url: formData.image_url || undefined,
            sku: formData.sku || null,
            barcode: formData.barcode || null
        };

        if (editingId) {
            const { error } = await ProductService.update(editingId, payload);
            if (error) alert("Error updating product: " + (error as any).message);
        } else {
            const { error } = await ProductService.create(payload);
            if (error) alert("Error creating product: " + (error as any).message);
        }

        setIsModalOpen(false);
        loadProducts();
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            selling_price: String(product.selling_price),
            cost_price: product.cost_price ? String(product.cost_price) : '',
            tax_percentage: String(product.tax_percentage),
            stock_quantity: String(product.stock_quantity),
            image_url: product.image_url || '',
            sku: product.sku || '',
            barcode: product.barcode || ''
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            await ProductService.delete(id);
            loadProducts();
        }
    };

    const openNewModal = () => {
        setFormData({ name: '', selling_price: '', cost_price: '', tax_percentage: '0', stock_quantity: '0', image_url: '', sku: '', barcode: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const generateSKU = () => {
        const prefix = formData.name.substring(0, 3).toUpperCase().padEnd(3, 'X');
        const random = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
    };

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(100 + Math.random() * 900);
        setFormData(prev => ({ ...prev, barcode: `890${timestamp}${random}` }));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Inventory Management</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage your shop's products, details, and stock</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                >
                    <Plus className="w-5 h-5" /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Loading inventory...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 text-center text-rose-500 bg-rose-50/20">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Shop Not Assigned</h3>
                        <p className="max-w-md mx-auto text-gray-600">Your profile is not linked to any active shop. Please contact the super admin to grant you access to a store.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-24 text-center text-gray-400 bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Products in Inventory</h3>
                        <p className="max-w-sm mx-auto mb-6">Start building your catalogue by adding your first product.</p>
                        <button onClick={openNewModal} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors">Add Initial Product</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="p-6 w-1/2">Product Details</th>
                                    <th className="p-6 text-right">Price (₹)</th>
                                    <th className="p-6 text-right">Tax (%)</th>
                                    <th className="p-6 text-right">In Stock</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {products.map(product => (
                                    <tr key={product.id} className="group hover:bg-emerald-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{product.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {product.sku || product.id.split('-')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-bold text-gray-900">₹{indianFormat(product.selling_price)}</span>
                                        </td>
                                        <td className="p-6 text-right text-gray-500 font-medium">{product.tax_percentage}%</td>
                                        <td className="p-6 text-right">
                                            <span className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full text-xs font-bold tracking-wide ${product.stock_quantity < 5 ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(product)} className="p-2.5 rounded-xl transition-all shadow-sm border text-blue-500 bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200" title="Edit Product"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(product.id, product.name)} className="p-2.5 rounded-xl transition-all shadow-sm border text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:border-rose-200" title="Delete Product"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 scale-in-center">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure item details, barcodes and pricing</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Product Name</label>
                                <input required type="text" placeholder="e.g. Fresh Mangoes (1kg)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">SKU Code</label>
                                    <div className="flex gap-2 relative">
                                        <input type="text" placeholder="e.g. MAN-1234" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full p-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono text-sm" />
                                        <button type="button" onClick={generateSKU} className="absolute right-2 top-2 p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Auto-generate SKU"><Barcode className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Barcode</label>
                                    <div className="flex gap-2 relative">
                                        <input type="text" placeholder="e.g. 890123456789" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full p-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-mono text-sm" />
                                        <button type="button" onClick={generateBarcode} className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Auto-generate Barcode"><ScanBarcode className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Cost Price</label>
                                    <input type="number" step="0.01" min="0" placeholder="80" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-gray-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 text-emerald-600">Selling Price</label>
                                    <input required type="number" step="0.01" min="0" placeholder="100" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: e.target.value })} className="w-full p-3.5 bg-emerald-50 border border-emerald-200 border-b-4 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-emerald-100 outline-none transition-all font-bold text-emerald-700" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Tax (%)</label>
                                    <input required type="number" step="0.01" min="0" placeholder="5" value={formData.tax_percentage} onChange={e => setFormData({ ...formData, tax_percentage: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Current Stock Level</label>
                                <input required type="number" min="0" placeholder="50" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Product Image URL</label>
                                <input type="url" placeholder="https://images.unsplash.com/..." value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm" />
                            </div>

                            <div className="pt-6 flex gap-4 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">{editingId ? 'Save Edits' : 'Publish Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
