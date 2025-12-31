"use client"

import { motion } from "framer-motion";
import { ChevronLeft, Info, Bell, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ReminderSetup() {
    const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
    const [selectedDays, setSelectedDays] = useState<string[]>(["M-0", "W-2", "F-4"]);

    const days = ["M", "T", "W", "T", "F", "S", "S"];

    const toggleDay = (day: string, index: number) => {
        const dayKey = `${day}-${index}`;
        setSelectedDays(prev =>
            prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] pb-10">
            {/* Header */}
            <header className="h-16 flex items-center px-6 sticky top-0 bg-[#F8F9FA]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg z-50">
                <Link href="/dashboard/new" className="p-2 -ml-2 text-neutral-500 dark:text-neutral-400">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="flex-1 text-center font-bold dark:text-white mr-8 text-sm">Set Reminder</h1>
            </header>

            <main className="px-6 space-y-10 pt-6 max-w-xl mx-auto">
                <div className="space-y-4">
                    <p className="text-sm text-neutral-500 text-center leading-relaxed">
                        Consistency is key to the ShowUp method. Let's build a routine that works for you.
                    </p>
                </div>

                {/* Frequency */}
                <section className="space-y-4">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center block w-full">Frequency</label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl flex items-center shadow-inner">
                        <button
                            onClick={() => setFrequency("daily")}
                            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${frequency === "daily"
                                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                                : "text-neutral-400"
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setFrequency("weekly")}
                            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${frequency === "weekly"
                                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                                : "text-neutral-400"
                                }`}
                        >
                            Weekly
                        </button>
                    </div>
                </section>

                {/* Days */}
                <section className="space-y-4">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center block w-full">On which days?</label>
                    <div className="flex justify-between items-center px-2">
                        {days.map((day, i) => {
                            const dayKey = `${day}-${i}`;
                            const isSelected = selectedDays.includes(dayKey);
                            return (
                                <button
                                    key={dayKey}
                                    onClick={() => toggleDay(day, i)}
                                    className={`w-9 h-9 rounded-full font-bold text-xs transition-all border ${isSelected
                                        ? "bg-[#00D261] border-[#00D261] text-white shadow-lg shadow-green-500/20"
                                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-400"
                                        }`}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* Time */}
                <section className="space-y-4 text-center">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block w-full">At what time?</label>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-6xl font-black dark:text-white tracking-tight flex items-center gap-3">
                            <span>07</span>
                            <span className="text-neutral-200 dark:text-neutral-800">:</span>
                            <span>30</span>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-[#00D261] font-bold">AM</span>
                                <span className="text-sm text-neutral-300 dark:text-neutral-700 font-bold">PM</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preview */}
                <section className="pt-4 space-y-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Notification Preview</p>
                    <div className="bg-white dark:bg-[#121212] p-6 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 flex items-start gap-5 shadow-xl shadow-neutral-200/50 dark:shadow-none group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="text-[10px] text-neutral-300 font-bold">now</span>
                        </div>
                        <div className="w-12 h-12 bg-[#00D261] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                            <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div className="flex-1 space-y-1 text-left">
                            <h4 className="text-xs font-black dark:text-white">ShowUp</h4>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">Time to update your progress! How did your "Run 3km" go today?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6">
                        <div className="w-1.5 h-1.5 bg-[#00D261] rounded-full" />
                        <p className="text-[10px] font-bold text-neutral-400">Smart alerts enabled</p>
                    </div>
                </section>

                {/* Action */}
                <div className="space-y-4 pt-6">
                    <Link
                        href="/dashboard"
                        className="w-full h-15 bg-[#00D261] hover:bg-[#00A64D] text-white font-bold rounded-3xl flex items-center justify-center transition-all shadow-xl shadow-green-500/30 active:scale-[0.98]"
                    >
                        Save Reminders
                    </Link>
                    <button className="w-full text-xs font-bold text-neutral-400 hover:text-neutral-600 transition-colors">
                        Skip (later)
                    </button>
                </div>
            </main>
        </div>
    );
}
