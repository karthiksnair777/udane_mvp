import { useState, useEffect } from 'react';
import { useUser } from '../contexts/AuthContext';
import { supabase, Customer } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Users, Phone, Mail, Award, CreditCard } from 'lucide-react';

export function Customers() {
    const { user } = useUser();
    const shopId = user?.profile?.shop_id as string | undefined;

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        loyalty_points: '0',
        credit_balance: '0'
    });

    const loadCustomers = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });

        if (data) setCustomers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCustomers();
    }, [shopId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) return;

        const payload = {
            shop_id: shopId,
            name: formData.name,
            phone: formData.phone || null,
            email: formData.email || null,
            loyalty_points: Number(formData.loyalty_points),
            credit_balance: Number(formData.credit_balance)
        };

        if (editingId) {
            await supabase.from('customers').update(payload).eq('id', editingId);
        } else {
            await supabase.from('customers').insert(payload);
        }

        setIsModalOpen(false);
        loadCustomers();
    };

    const handleEdit = (customer: Customer) => {
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            loyalty_points: String(customer.loyalty_points || 0),
            credit_balance: String(customer.credit_balance || 0)
        });
        setEditingId(customer.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete customer ${name}?`)) {
            await supabase.from('customers').delete().eq('id', id);
            loadCustomers();
        }
    };

    const openNewModal = () => {
        setFormData({ name: '', phone: '', email: '', loyalty_points: '0', credit_balance: '0' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-500 tracking-tight">Customer Management</h2>
                    <p className="text-gray-500 mt-1 font-medium">Track shoppers, loyalty points, and credit balances</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 font-semibold"
                >
                    <Plus className="w-5 h-5" /> Add Customer
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Loading customers...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 text-center text-rose-500 bg-rose-50/20">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Users className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Shop Not Assigned</h3>
                        <p className="max-w-md mx-auto text-gray-600">Your profile is not linked to any active shop.</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-24 text-center text-gray-400 bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Customers Found</h3>
                        <p className="max-w-sm mx-auto mb-6">Start building your customer database for better relationships.</p>
                        <button onClick={openNewModal} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors">Add First Customer</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="p-6">Customer Name</th>
                                    <th className="p-6">Contact Info</th>
                                    <th className="p-6 text-right">Loyalty Points</th>
                                    <th className="p-6 text-right">Credit Balance</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {customers.map(customer => (
                                    <tr key={customer.id} className="group hover:bg-emerald-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-base">{customer.name}</span>
                                                <span className="text-xs text-gray-400 font-mono mt-0.5">Joined: {new Date(customer.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 text-gray-500">
                                                {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                                                {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>}
                                                {!customer.phone && !customer.email && <span className="text-gray-400 italic">No contact info</span>}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                                                <Award className="w-3.5 h-3.5" /> {customer.loyalty_points || 0}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${Number(customer.credit_balance) > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                                <CreditCard className="w-3.5 h-3.5" /> ₹{indianFormat(customer.credit_balance || 0)}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(customer)} className="p-2.5 rounded-xl transition-all shadow-sm border text-blue-500 bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200" title="Edit Customer"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2.5 rounded-xl transition-all shadow-sm border text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:border-rose-200" title="Delete Customer"><Trash2 className="w-4 h-4" /></button>
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
                                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Manage their profile & store credit</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Full Name</label>
                                <input required type="text" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Email Address</label>
                                    <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-amber-600">Loyalty Points</label>
                                    <input type="number" min="0" placeholder="0" value={formData.loyalty_points} onChange={e => setFormData({ ...formData, loyalty_points: e.target.value })} className="w-full p-3.5 bg-amber-50 border border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-amber-700" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-rose-600">Pending Credit (₹)</label>
                                    <input type="number" step="0.01" min="0" placeholder="0.00" value={formData.credit_balance} onChange={e => setFormData({ ...formData, credit_balance: e.target.value })} className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-rose-700" />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">{editingId ? 'Save Changes' : 'Add Customer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
