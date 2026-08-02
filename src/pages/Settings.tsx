import { useState, useEffect } from 'react';
import { useShop } from '../contexts/AuthContext';
import { ShopService } from '../lib/api';
import { Shop } from '../lib/supabase';
import { Settings as SettingsIcon, Save, Store, Receipt, Palette, CheckCircle2 } from 'lucide-react';

export function Settings() {
    
    const { shopId } = useShop();
    
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'business' | 'receipt' | 'appearance'>('business');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        gst_number: '',
        business_hours: '',
        // These fields might not exist in the DB schema yet, but we'll include them in the UI state
        receipt_footer: 'Thank you for shopping with us!',
        tax_config: 'inclusive',
        currency: 'INR',
        theme: 'emerald'
    });

    useEffect(() => {
        if (!shopId) return;
        const fetchShop = async () => {
            setLoading(true);
            const { data } = await ShopService.getAll();
            const current = (data as Shop[])?.find(s => s.id === shopId);
            if (current) {
                
                setFormData(prev => ({
                    ...prev,
                    name: current.name || '',
                    phone: current.phone || '',
                    address: current.address || '',
                    gst_number: current.gst_number || '',
                    business_hours: current.business_hours || '09:00 AM - 09:00 PM',
                }));
            }
            setLoading(false);
        };
        fetchShop();
    }, [shopId]);

    const handleSave = async () => {
        if (!shopId) return;
        setSaving(true);
        // We only update fields that actually exist in our supabase schema to avoid errors
        const updatePayload: Partial<Shop> = {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            gst_number: formData.gst_number,
            business_hours: formData.business_hours
        };

        const { error } = await ShopService.update(shopId, updatePayload as any);
        
        setSaving(false);
        if (error) {
            alert('Error saving settings: ' + (error as any).message);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    if (!shopId) {
        return (
            <div className="h-full flex items-center justify-center p-12 text-gray-500">
                You must be assigned to a shop to view settings.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                Loading settings...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-emerald-500" /> Shop Settings
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage your business profile and preferences</p>
                </div>
                <div className="flex gap-3">
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in slide-in-from-right-4">
                            <CheckCircle2 className="w-5 h-5" /> Saved!
                        </div>
                    )}
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2 disabled:opacity-70"
                    >
                        <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('business')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'business' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent hover:text-gray-900'}`}
                    >
                        <Store className="w-5 h-5" /> Business Info
                    </button>
                    <button
                        onClick={() => setActiveTab('receipt')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'receipt' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent hover:text-gray-900'}`}
                    >
                        <Receipt className="w-5 h-5" /> Receipt Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'appearance' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent hover:text-gray-900'}`}
                    >
                        <Palette className="w-5 h-5" /> Appearance
                    </button>
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                    {activeTab === 'business' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Business Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Shop Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Contact Number</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">GST / Tax Number</label>
                                    <input type="text" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Business Hours</label>
                                    <input type="text" value={formData.business_hours} onChange={e => setFormData({...formData, business_hours: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900" placeholder="09:00 AM - 09:00 PM" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Physical Address</label>
                                <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 resize-none" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'receipt' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Receipt Settings</h3>
                            
                            <div className="space-y-6 max-w-lg">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Receipt Footer Message</label>
                                    <textarea rows={2} value={formData.receipt_footer} onChange={e => setFormData({...formData, receipt_footer: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 resize-none" />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Tax Configuration</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 font-medium cursor-pointer">
                                            <input type="radio" name="tax" checked={formData.tax_config === 'inclusive'} onChange={() => setFormData({...formData, tax_config: 'inclusive'})} className="text-emerald-500 focus:ring-emerald-500" /> Prices include Tax
                                        </label>
                                        <label className="flex items-center gap-2 font-medium cursor-pointer">
                                            <input type="radio" name="tax" checked={formData.tax_config === 'exclusive'} onChange={() => setFormData({...formData, tax_config: 'exclusive'})} className="text-emerald-500 focus:ring-emerald-500" /> Add Tax at checkout
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Appearance</h3>
                            
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Brand Accent Color</label>
                                <div className="flex gap-4">
                                    {['emerald', 'blue', 'orange', 'purple', 'rose'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({...formData, theme: color})}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                color === 'emerald' ? 'bg-emerald-500' :
                                                color === 'blue' ? 'bg-blue-500' :
                                                color === 'orange' ? 'bg-orange-500' :
                                                color === 'purple' ? 'bg-purple-500' : 'bg-rose-500'
                                            } ${formData.theme === color ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : 'hover:scale-110'}`}
                                        >
                                            {formData.theme === color && <CheckCircle2 className="w-6 h-6 text-white" />}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">This color will be used for your Customer PWA storefront.</p>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Shop Logo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
                                        <Store className="w-8 h-8" />
                                    </div>
                                    <button className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Upload Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
