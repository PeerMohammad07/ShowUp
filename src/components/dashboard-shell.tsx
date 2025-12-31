"use client"

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { Search, Bell, Menu, X, Loader2, Target } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashboardShell({
    children,
    user
}: {
    children: React.ReactNode;
    user: { name?: string | null; email?: string | null };
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounced search logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSearchResults(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Search fetch error:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close results on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (id: string) => {
        setShowResults(false);
        setSearchQuery("");
        router.push(`/dashboard/resolutions/edit/${id}`);
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900 sticky top-0 z-40 px-6 lg:px-10 transition-colors duration-300">
                    <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-all"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="relative max-w-md w-full hidden md:block" ref={searchRef}>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                                        placeholder="Search goals, habits..."
                                        className="w-full h-11 pl-12 pr-6 bg-neutral-100 dark:bg-neutral-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#00D261] transition-all dark:text-white"
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00D261] animate-spin" />
                                    )}
                                </div>

                                {showResults && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0C0C0C] border border-neutral-100 dark:border-neutral-900 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((result) => (
                                                    <button
                                                        key={result.id}
                                                        onClick={() => handleResultClick(result.id)}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-colors text-left group"
                                                    >
                                                        <div className="w-8 h-8 bg-[#00D26115] text-[#00D261] rounded-lg flex items-center justify-center shrink-0">
                                                            <Target className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold dark:text-white truncate group-hover:text-[#00D261] transition-colors">
                                                                {result.title}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-400 font-medium truncate">
                                                                {result.action}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <p className="text-xs text-neutral-500 font-medium">No matches found for "{searchQuery}"</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-900">
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest text-center">
                                                Press enter to search all
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-4 h-11">
                            <ThemeToggle />
                            <button className="w-11 h-11 flex items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm">
                                <Bell className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 pl-2 border-l border-neutral-100 dark:border-neutral-900 h-8">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold dark:text-white leading-none mb-1">{user.name || "User"}</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Free Plan</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
