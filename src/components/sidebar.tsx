"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Target,
    Calendar,
    BarChart3,
    Settings,
    Star,
    LogOut,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShowUpLogo } from "./brand";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Target, label: "My Resolutions", href: "/dashboard/resolutions" },
    { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <>
            <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0C0C0C] border-r border-neutral-100 dark:border-neutral-900 z-[60] flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-8 flex items-center justify-between">
                    <Link href="/dashboard" className="block">
                        <ShowUpLogo className="h-10 w-auto" />
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose()}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive
                                    ? "bg-[#00D26110] text-[#00D261]"
                                    : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${isActive ? "text-[#00D261]" : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"}`} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="w-1.5 h-1.5 bg-[#00D261] rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    <div className="bg-[#00D26105] p-6 rounded-3xl border border-neutral-100 dark:border-neutral-900 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#00D26105] rounded-full -mr-8 -mt-8" />
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Methodology</h4>
                        <p className="text-[10px] text-neutral-500 mb-0 leading-relaxed font-medium">Built on the STAR framework for peak consistency.</p>
                    </div>

                    <button
                        onClick={() => {
                            import("next-auth/react").then(mod => mod.signOut({ callbackUrl: "/" }));
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-neutral-400 group-hover:text-red-500" />
                            <span className="font-black text-sm tracking-tight">Sign Out</span>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
}
