import { SignInButton, useAuth } from '@insforge/react';
import { Navigate } from 'react-router-dom';

export function Login() {
    const { isSignedIn } = useAuth();
    if (isSignedIn) return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">🛍️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Udane POS</h1>
                    <p className="text-gray-500 mb-8">Sign in to manage your local shop.</p>

                    <div className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-xl transition-all font-semibold shadow-md shadow-green-200">
                        <SignInButton>
                            Sign In to Continue
                        </SignInButton>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
                    Powered by InsForge MVP
                </div>
            </div>
        </div>
    );
}
