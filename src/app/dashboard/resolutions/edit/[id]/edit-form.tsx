"use client"

import { useState, useTransition } from "react";
import { Zap, Loader2, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { updateResolution } from "@/lib/actions";

export function EditResolutionForm({ resolution }: { resolution: any }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await updateResolution(resolution.id, formData) as any;
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            {/* Goal Title */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Goal</label>
                <input
                    name="title"
                    required
                    defaultValue={resolution.title}
                    placeholder="e.g. Run a Marathon"
                    className="w-full h-15 px-6 bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D261] transition-all dark:text-white font-bold"
                />
            </div>

            {/* STAR Method Divider */}
            <div className="flex items-center gap-4 py-4">
                <div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-800" />
                <span className="text-[10px] font-black text-[#00D261] uppercase tracking-[0.3em]">Star Method</span>
                <div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-800" />
            </div>

            {/* Situation (S) */}
            <div className="space-y-3 relative">
                <div className="flex items-start gap-4">
                    <span className="text-2xl font-black text-[#00D261] mt-1">S</span>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">Situation</label>
                        <textarea
                            name="situation"
                            required
                            defaultValue={resolution.situation}
                            placeholder="e.g. Where are you starting from?"
                            rows={3}
                            className="w-full p-6 bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#00D261] transition-all dark:text-white text-sm leading-relaxed"
                        />
                    </div>
                </div>
            </div>

            {/* Task (T) */}
            <div className="space-y-3 relative">
                <div className="flex items-start gap-4">
                    <span className="text-2xl font-black text-[#00D261] mt-1">T</span>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">Task</label>
                        <textarea
                            name="task"
                            required
                            defaultValue={resolution.task}
                            placeholder="e.g. What challenge do you need to overcome?"
                            rows={3}
                            className="w-full p-6 bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#00D261] transition-all dark:text-white text-sm leading-relaxed"
                        />
                    </div>
                </div>
            </div>

            {/* Action Plan (A) */}
            <div className="space-y-3 relative">
                <div className="flex items-start gap-4">
                    <span className="text-2xl font-black text-[#00D261] mt-1">A</span>
                    <div className="flex-1 space-y-4">
                        <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">Action Plan</label>

                        <div className="space-y-3">
                            <div className="relative">
                                <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                <input
                                    name="action"
                                    required
                                    defaultValue={resolution.action}
                                    placeholder="What specific action will you take?"
                                    className="w-full h-15 pl-14 pr-6 bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00D261] transition-all dark:text-white text-sm font-semibold"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <div className="bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-2xl h-14 flex items-center px-4 justify-between cursor-pointer group hover:border-[#00D26150] transition-colors">
                                        <span className="text-xs font-bold dark:text-white">
                                            {resolution.frequency ? resolution.frequency.charAt(0) + resolution.frequency.slice(1).toLowerCase() : "Daily"}
                                        </span>
                                        <ChevronLeft className="w-4 h-4 -rotate-90 text-neutral-300 group-hover:text-[#00D261]" />
                                    </div>
                                    <select
                                        name="frequency"
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        defaultValue={resolution.frequency || "DAILY"}
                                    >
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                </div>
                                <div className="flex-1 bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800 rounded-2xl h-14 flex items-center px-4 justify-between cursor-pointer group hover:border-[#00D26150] transition-colors">
                                    <input
                                        name="reminderTime"
                                        type="time"
                                        defaultValue={resolution.reminderTime || "08:00"}
                                        className="bg-transparent border-none text-xs font-bold dark:text-white focus:outline-none w-full cursor-pointer"
                                    />
                                    <Clock className="w-4 h-4 text-neutral-300 group-hover:text-[#00D261]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <input type="hidden" name="result" value={resolution.result || "Achieved success"} />

            {error && typeof error === 'string' && (
                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
                <Link
                    href="/dashboard/resolutions"
                    className="flex-1 h-15 border border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold rounded-2xl flex items-center justify-center transition-all hover:bg-neutral-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-[2] h-15 bg-[#00D261] hover:bg-[#00A64D] text-white font-bold rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-70"
                >
                    {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Update Resolution"}
                </button>
            </div>
        </form>
    );
}
