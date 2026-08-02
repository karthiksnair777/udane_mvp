import { useState } from "react";
import { AuthService } from "../lib/api";

export function Login() {
    
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await AuthService.signUp(email.trim(), password);

                if (signUpError) throw signUpError;
                
                if (data?.user) {
                    setSuccessMsg("Account created successfully! You are now logged in.");
                    setTimeout(() => window.location.href = "/merchant/admin", 1500);
                }
            } else {
                const { data, error: signInError } = await AuthService.signIn(email.trim(), password);

                if (signInError) throw signInError;

                if (data?.user) {
                    const { data: profile, error: profileError } = await AuthService.getUserProfile(data.user.id);

                    if (profileError || !profile) {
                        throw new Error("No profile found. Contact your administrator.");
                    }

                    if (profile.role === "super_admin") {
                        window.location.href = "/merchant/admin";
                    } else {
                        window.location.href = "/merchant/dashboard";
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
            if (err.message?.includes("No profile found")) {
                await AuthService.signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">🛍️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Udane POS</h1>
                    <p className="text-gray-500 mt-1">
                        {isSignUp ? "Create a new administrator account" : "Sign in to manage your shop"}
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}
                
                {successMsg && (
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Admin Name"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-semibold transition-colors shadow-md"
                    >
                        {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                            setSuccessMsg("");
                        }}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                        {isSignUp ? "Already have an account? Sign in." : "Need an account? Sign up as admin."}
                    </button>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Demo Mode · No Database Required
                </p>
            </div>
        </div>
    );
}
