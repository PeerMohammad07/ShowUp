"use client"

import { useState, useTransition } from "react";
import {
    Star,
    Mail,
    Lock,
    ArrowRight,
    ChevronLeft,
    AlertCircle,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { ShowUpLogo } from "@/components/brand";
import { authenticate } from "@/lib/login-action";
import { register } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            if (mode === "login") {
                const result = await authenticate(formData);
                if (result) {
                    setError(result);
                } else {
                    router.push("/dashboard");
                }
            } else {
                const result = await register(formData);
                if (result?.error) {
                    if (typeof result.error === "string") {
                        setError(result.error);
                    } else {
                        setError(Object.values(result.error).flat().join(", "));
                    }
                } else if (result?.success) {
                    // Auto login after registration
                    const loginResult = await authenticate(formData);
                    if (loginResult) {
                        setError("Account created, but failed to log in automatically. Please try logging in.");
                        setMode("login");
                    } else {
                        router.push("/dashboard");
                    }
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 selection:bg-[#00D261]/30">
            {/* Back to Home */}
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest group"
            >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
            </Link>

            {/* Main Card */}
            <div className="w-full max-w-md space-y-10">
                <div className="text-center space-y-6">
                    <ShowUpLogo className="h-14 w-auto mx-auto" />
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black dark:text-white tracking-tight">
                            {mode === "login" ? "Welcome back." : "Start your journey."}
                        </h1>
                        <p className="text-neutral-500 text-sm font-medium">
                            {mode === "login"
                                ? "Log in to your ShowUp account to continue your progress."
                                : "Create an account to start mastering your resolutions."}
                        </p>
                    </div>
                </div>

                <div className="bg-[#121212] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex gap-3 items-center animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full h-12 pl-12 pr-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-[#00D261] transition-all placeholder:text-neutral-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Password</label>
                                {mode === "login" && (
                                    <button type="button" className="text-[10px] font-bold text-[#00D261] uppercase tracking-widest hover:underline">Forgot?</button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-12 pr-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-[#00D261] transition-all placeholder:text-neutral-700"
                                />
                            </div>
                            {mode === "register" && (
                                <p className="text-[10px] text-neutral-600 px-1 font-medium">Minimum 6 characters required.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-[#00D261] text-white text-sm font-black rounded-2xl shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Log In" : "Create Account"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[#121212] px-4 text-neutral-600">Plan your year 2026</span></div>
                    </div>

                    <p className="text-center text-xs text-neutral-500 font-medium">
                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => {
                                setMode(mode === "login" ? "register" : "login");
                                setError(null);
                            }}
                            className="text-[#00D261] font-bold hover:underline"
                        >
                            {mode === "login" ? "Sign up for free" : "Log in"}
                        </button>
                    </p>
                </div>

                <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                    © 2026 ShowUp App • Built for focus
                </p>
            </div>
        </div>
    );
}
