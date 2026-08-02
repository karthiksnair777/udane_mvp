import { useState, useEffect } from 'react';
import { useShop } from '../contexts/AuthContext';
import { supabase, Expense } from '../lib/supabase';
import { indianFormat } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Wallet, Tag } from 'lucide-react';

export function Expenses() {
    
    const { shopId } = useShop();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        category: 'Electricity',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Electricity', 'Rent', 'Salaries', 'Packaging', 'Transport', 'Maintenance', 'Marketing', 'Other'];

    const loadExpenses = async () => {
        if (!shopId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await supabase
            .from('expenses')
            .select('*')
            .eq('shop_id', shopId)
            .order('date', { ascending: false });

        if (data) setExpenses(data);
        setLoading(false);
    };

    useEffect(() => {
        loadExpenses();
    }, [shopId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId) return;

        const payload = {
            shop_id: shopId,
            category: formData.category,
            amount: Number(formData.amount),
            description: formData.description || null,
            date: formData.date
        };

        if (editingId) {
            await supabase.from('expenses').update(payload).eq('id', editingId);
        } else {
            await supabase.from('expenses').insert(payload);
        }

        setIsModalOpen(false);
        loadExpenses();
    };

    const handleEdit = (expense: Expense) => {
        setFormData({
            category: expense.category,
            amount: String(expense.amount),
            description: expense.description || '',
            date: expense.date
        });
        setEditingId(expense.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, category: string) => {
        if (confirm(`Are you sure you want to delete this ${category} expense?`)) {
            await supabase.from('expenses').delete().eq('id', id);
            loadExpenses();
        }
    };

    const openNewModal = () => {
        setFormData({ category: 'Electricity', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-red-500 tracking-tight">Expense Tracking</h2>
                    <p className="text-gray-500 mt-1 font-medium">Record and analyze your operational costs</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 hidden md:block">
                        <span className="text-sm font-bold text-rose-500">Total Spent</span>
                        <div className="text-lg font-black text-rose-700">₹{indianFormat(totalExpenses)}</div>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="flex flex-row items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-200 font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Record Expense
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Loading expenses...</p>
                    </div>
                ) : !shopId ? (
                    <div className="p-24 text-center text-rose-500 bg-rose-50/20">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Wallet className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Shop Not Assigned</h3>
                        <p className="max-w-md mx-auto text-gray-600">Your profile is not linked to any active shop.</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="p-24 text-center text-gray-400 bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Wallet className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Expenses Recorded</h3>
                        <p className="max-w-sm mx-auto mb-6">Start tracking your bills and operational costs.</p>
                        <button onClick={openNewModal} className="px-6 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors">Record First Expense</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Category</th>
                                    <th className="p-6">Description</th>
                                    <th className="p-6 text-right">Amount (₹)</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {expenses.map(expense => (
                                    <tr key={expense.id} className="group hover:bg-rose-50/30 transition-colors">
                                        <td className="p-6 font-medium text-gray-900">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                                                <Tag className="w-3.5 h-3.5" /> {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-6 text-gray-600 truncate max-w-xs">
                                            {expense.description || <span className="italic text-gray-400">No description</span>}
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-bold text-rose-600 text-base">₹{indianFormat(expense.amount)}</span>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(expense)} className="p-2.5 rounded-xl transition-all shadow-sm border text-blue-500 bg-white border-blue-100 hover:bg-blue-50 hover:border-blue-200" title="Edit Expense"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(expense.id, expense.category)} className="p-2.5 rounded-xl transition-all shadow-sm border text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:border-rose-200" title="Delete Expense"><Trash2 className="w-4 h-4" /></button>
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
                                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Expense' : 'Record Expense'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Track bills, salaries, and store costs</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Date Paid</label>
                                    <div className="relative">
                                        <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 text-rose-600">Amount (₹)</label>
                                    <input required type="number" step="0.01" min="0" placeholder="1500" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-3.5 bg-rose-50 border border-rose-200 border-b-4 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-rose-100 outline-none transition-all font-bold text-rose-700" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Category</label>
                                <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-medium">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">Description (Optional)</label>
                                <textarea rows={2} placeholder="E.g., October electricity bill" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-medium resize-none" />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">{editingId ? 'Save Changes' : 'Record Expense'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
