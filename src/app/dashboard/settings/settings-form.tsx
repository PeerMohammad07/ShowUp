"use client"

import { useState, useTransition, useEffect } from "react";
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Shield,
    Sun,
    Moon,
    Monitor,
    Trash2,
    ExternalLink,
    ChevronRight,
    Star as StarIcon,
    Clock,
    CheckCircle2
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { updateProfile } from "@/lib/actions";
import { ShowUpLogo } from "@/components/brand";

const tabs = [
    { id: "profile", icon: User, label: "Profile & Account" },
    { id: "preferences", icon: SettingsIcon, label: "Preferences" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security" },
];

export default function SettingsForm({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState("profile");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Fix hydration error
    useEffect(() => {
        setMounted(true);
    }, []);

    async function handleProfileUpdate(formData: FormData) {
        startTransition(async () => {
            await updateProfile(formData);
        });
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">

                {/* Settings Navigation (Left) */}
                <aside className="lg:w-64 shrink-0 space-y-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                    ? "bg-[#00D26110] text-[#00D261]"
                                    : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${isActive ? "text-[#00D261]" : "text-neutral-400"}`} />
                                <span className="font-bold text-sm">{tab.label}</span>
                            </button>
                        );
                    })}

                    <div className="pt-8 px-4">
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 relative overflow-hidden text-center opacity-60">
                            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShowUpLogo iconOnly className="h-5" />
                            </div>
                            <h4 className="text-sm font-black dark:text-white mb-1">Standard Member</h4>
                            <p className="text-[10px] text-neutral-500">Free Forever Plan</p>
                        </div>
                    </div>
                </aside>

                {/* Settings Content (Right) */}
                <div className="flex-1 space-y-10 max-w-3xl">

                    {/* Header Area */}
                    <div className="bg-white dark:bg-[#0C0C0C] p-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none flex flex-col items-center sm:flex-row sm:items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <button type="button" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-100 dark:border-neutral-800 px-4 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2">
                                View Public Profile <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-orange-100 overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`} alt="Profile" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-black dark:text-white mb-1">
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className="text-sm text-neutral-500 font-medium mb-1">{user?.email}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Active Member since 2025</p>
                        </div>
                    </div>

                    <form action={handleProfileUpdate} className="space-y-10">
                        {/* Personal Information */}
                        <section className="bg-white dark:bg-[#0C0C0C] p-10 rounded-[3rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black dark:text-white mb-1">Personal Information</h3>
                                    <p className="text-xs text-neutral-400 font-medium">Update your personal details and public info.</p>
                                </div>
                                <button type="submit" disabled={isPending} className="text-xs font-black text-[#00D261] uppercase tracking-widest disabled:opacity-50">
                                    {isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">First Name</label>
                                    <input name="firstName" type="text" defaultValue={user?.firstName} className="w-full h-12 px-6 bg-neutral-100 dark:bg-neutral-900 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#00D261] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Last Name</label>
                                    <input name="lastName" type="text" defaultValue={user?.lastName} className="w-full h-12 px-6 bg-neutral-100 dark:bg-neutral-900 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#00D261] transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Your "Why" Statement</label>
                                <p className="text-[10px] text-neutral-400 -mt-1 px-1">Consistency is key to the STAR method. Let's build a routine that works for you.</p>
                                <textarea
                                    name="bio"
                                    defaultValue={user?.bio}
                                    rows={4}
                                    className="w-full p-6 bg-neutral-100 dark:bg-neutral-900 border-none rounded-[2rem] text-sm font-medium dark:text-white focus:ring-2 focus:ring-[#00D261] transition-all resize-none"
                                    placeholder="Describe your motivation..."
                                />
                                <p className="text-[10px] text-neutral-300 px-1 font-medium">This will be displayed on your dashboard to help keep you motivated.</p>
                            </div>
                        </section>

                        {/* Goal & Reminder Settings */}
                        <section className="bg-white dark:bg-[#0C0C0C] p-10 rounded-[3rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black dark:text-white mb-1">Goal & Reminder Settings</h3>
                                    <p className="text-xs text-neutral-400 font-medium">Configure how you track your STAR method.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">Default Check-In Frequency</p>
                                        <p className="text-[10px] text-neutral-400">How often do you want to update your progress?</p>
                                    </div>
                                    <div className="bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl flex">
                                        <button type="button" className="px-4 py-1.5 text-[10px] font-bold rounded-lg bg-white dark:bg-neutral-800 shadow-sm dark:text-white transition-all">Daily</button>
                                        <button type="button" className="px-4 py-1.5 text-[10px] font-bold text-neutral-400 hover:text-neutral-500 transition-all">Weekly</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">Preferred Reminder Time</p>
                                        <p className="text-[10px] text-neutral-400">What time should we remind you to check in?</p>
                                    </div>
                                    <div className="relative">
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <input name="reminderTime" type="time" defaultValue="07:30" className="h-11 pl-4 pr-10 bg-neutral-100 dark:bg-neutral-900 border-none rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-[#00D261] text-center" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Appearance Selection */}
                        <section className="bg-white dark:bg-[#0C0C0C] p-10 rounded-[3rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-8">
                            <div>
                                <h3 className="text-lg font-black dark:text-white mb-1">Appearance</h3>
                                <p className="text-xs text-neutral-400 font-medium">Customize how ShowUp looks on your desktop.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <ThemePreview
                                    id="light"
                                    active={mounted && theme === "light"}
                                    onClick={() => setTheme("light")}
                                    label="Light Mode"
                                    bg="bg-[#F8F9FA]"
                                    sidebar="bg-white"
                                />
                                <ThemePreview
                                    id="dark"
                                    active={mounted && theme === "dark"}
                                    onClick={() => setTheme("dark")}
                                    label="Dark Mode"
                                    bg="bg-[#0A0A0A]"
                                    sidebar="bg-[#0C0C0C]"
                                />
                                <ThemePreview
                                    id="system"
                                    active={mounted && theme === "system"}
                                    onClick={() => setTheme("system")}
                                    label="System"
                                    bg="bg-neutral-200"
                                    sidebar="bg-neutral-gray"
                                    isSystem
                                />
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-red-50/50 dark:bg-red-950/10 p-10 rounded-[3rem] border border-red-100 dark:border-red-900/50 space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-red-600 dark:text-red-500 mb-1">Danger Zone</h3>
                                <p className="text-xs text-red-400 font-medium">Permanently delete your account and all your tracking data.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
                                <button type="button" className="px-8 py-3 bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-500 text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/20">Delete Account</button>
                                <button type="submit" disabled={isPending} className="px-10 py-4 bg-[#00D261] text-white text-xs font-black rounded-2xl shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all">
                                    {isPending ? "Saving All..." : "Save All Changes"}
                                </button>
                            </div>
                        </section>
                    </form>

                    {/* Footer Footer */}
                    <footer className="text-center py-10 space-y-4">
                        <div className="flex justify-center gap-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <Link href="#">Privacy Policy</Link>
                            <Link href="#">Terms of Service</Link>
                            <Link href="#">Contact Support</Link>
                        </div>
                        <p className="text-[10px] text-neutral-300">© 2026 ShowUp App. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

function ThemePreview({ id, active, onClick, label, bg, sidebar, isSystem }: {
    id: string, active: boolean, onClick: () => void, label: string, bg: string, sidebar: string, isSystem?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group space-y-3 text-left transition-all ${active ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
        >
            <div className={`aspect-video w-full rounded-2xl border-4 transition-all relative overflow-hidden ${bg} ${active ? "border-[#00D261] shadow-2xl shadow-green-500/20" : "border-neutral-100 dark:border-neutral-800"}`}>
                <div className={`absolute inset-y-0 left-0 w-[30%] border-r ${sidebar} ${active ? "border-[#00D26120]" : "border-neutral-100 dark:border-neutral-800"}`} />
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50" />
                <div className="absolute top-8 right-4 left-[40%] space-y-1.5">
                    <div className="w-full h-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full" />
                    <div className="w-[80%] h-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full" />
                    <div className="w-[60%] h-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full" />
                </div>
                {active && (
                    <div className="absolute bottom-2 right-2 bg-[#00D261] rounded-full p-1 border-2 border-white dark:border-neutral-900">
                        <CheckCircle2 className="w-2 h-2 text-white" />
                    </div>
                )}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest text-center ${active ? "text-[#00D261]" : "text-neutral-400"}`}>{label}</p>
        </button>
    );
}
