import { useUser, SignOutButton } from '@insforge/react';
import { User } from 'lucide-react';

export function Profile() {
    const { user } = useUser();

    // Safety casts
    const anyUser = user as any;
    const roleString = typeof anyUser?.profile?.role === 'string' ? anyUser.profile.role : 'User';
    const shopIdString = typeof anyUser?.profile?.shop_id === 'string' ? anyUser.profile.shop_id : 'Not assigned to a shop yet.';

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Profile</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 overflow-hidden">
                        {anyUser?.profile?.avatar_url ? (
                            <img src={anyUser.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{anyUser?.profile?.name || 'Anonymous User'}</h3>
                        <p className="text-gray-500">{anyUser?.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                            {roleString.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Account Information</h4>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">{anyUser?.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {anyUser?.created_at ? new Date(anyUser.created_at).toLocaleDateString() : 'N/A'}
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Shop ID / Access Key</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-inner">
                                {shopIdString}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Securely sign out of your account on this device.</p>
                    <SignOutButton>
                        <button className="px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-semibold transition-all shadow-sm">
                            Log out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}
