import { useState, useEffect } from 'react';
import { useUser } from '../contexts/AuthContext';
import { supabase, Supplier } from '../lib/supabase';
import { Plus, Edit2, Trash2, X, Truck, Phone, Mail, MapPin } from 'lucide-react';

export function Suppliers() {
    const { user } = useUser();
    const shopId = user?.profile?.shop_id as string | undefined;

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    const loadSuppliers = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await supabase
            .from('suppliers')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });

        if (data) setSuppliers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadSuppliers();
    }, [shopId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) return;

        const payload = {
            shop_id: shopId,
            name: formData.name,
            contact_person: formData.contact_person || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null
        };

        if (editingId) {
            await supabase.from('suppliers').update(payload).eq('id', editingId);
        } else {
            await supabase.from('suppliers').insert(payload);
        }

        setIsModalOpen(false);
        loadSuppliers();
    };

    const handleEdit = (supplier: Supplier) => {
        setFormData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
        });
        setEditingId(supplier.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove supplier ${name}?`)) {
            await supabase.from('suppliers').delete().eq('id', id);
            loadSuppliers();
        }
    };

    const openNewModal = () => {
        setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Suppliers</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage product vendors and wholesaler contacts</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                >
                    <Plus className="w-5 h-5" /> Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Loading suppliers...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 text-center text-rose-500 bg-rose-50/20">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Truck className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Shop Not Assigned</h3>
                        <p className="max-w-md mx-auto text-gray-600">Your profile is not linked to any active shop.</p>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="p-24 text-center text-gray-400 bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Truck className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Suppliers Found</h3>
                        <p className="max-w-sm mx-auto mb-6">Start managing your procurement network right here.</p>
                        <button onClick={openNewModal} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors">Add First Supplier</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="p-6">Company / Vendor Name</th>
                                    <th className="p-6">Contact Person</th>
                                    <th className="p-6">Contact Details</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {suppliers.map(supplier => (
                                    <tr key={supplier.id} className="group hover:bg-emerald-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-base flex items-center gap-2">
                                                    <Truck className="hidden md:block w-4 h-4 text-emerald-600" /> {supplier.name}
                                                </span>
                                                {supplier.address && <span className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {supplier.address}</span>}
                                            </div>
                                        </td>
                                        <td className="p-6 font-medium text-gray-700">
                                            {supplier.contact_person || <span className="text-gray-400 italic">Not set</span>}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 text-gray-500">
                                                {supplier.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone}</span>}
                                                {supplier.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email}</span>}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(supplier)} className="p-2.5 rounded-xl transition-all shadow-sm border text-blue-500 bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200" title="Edit Supplier"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="p-2.5 rounded-xl transition-all shadow-sm border text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:border-rose-200" title="Delete Supplier"><Trash2 className="w-4 h-4" /></button>
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
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 scale-in-center">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Vendor business and contact details</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Company / Vendor Name</label>
                                <input required type="text" placeholder="e.g. FreshProduce Pvt Ltd" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Contact Person Name</label>
                                <input type="text" placeholder="e.g. Rahul Sharma" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="grid grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Phone</label>
                                    <input type="tel" placeholder="+91 XXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Email</label>
                                    <input type="email" placeholder="vendor@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Physical Address</label>
                                <input type="text" placeholder="Warehouse location..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">{editingId ? 'Save Changes' : 'Add Supplier'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
