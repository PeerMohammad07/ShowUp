"use client"

import { useState, useTransition } from "react";
import { CheckCircle2, X } from "lucide-react";
import { toggleCheckIn } from "@/lib/actions";

interface CheckInButtonsProps {
    resolutionId: string;
    initialStatus?: "DONE" | "MISSED";
    compact?: boolean;
    frequency?: "DAILY" | "WEEKLY";
}

export function CheckInButtons({ resolutionId, initialStatus, compact, frequency }: CheckInButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"DONE" | "MISSED" | undefined>(initialStatus);

    const handleAction = async (newStatus: "DONE" | "MISSED") => {
        setStatus(newStatus);
        startTransition(async () => {
            const result = await toggleCheckIn(resolutionId, new Date(), newStatus) as any;
        });
    };

    if (compact) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction("DONE")}
                    disabled={isPending}
                    title="Mark as Done"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${status === "DONE"
                        ? "bg-[#00D261] text-white"
                        : "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 hover:text-[#00D261] hover:bg-[#00D26110]"
                        } disabled:opacity-50 border border-neutral-100 dark:border-neutral-800`}
                >
                    <CheckCircle2 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => handleAction("MISSED")}
                    disabled={isPending}
                    title="Missed"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${status === "MISSED"
                        ? "bg-red-500 text-white"
                        : "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                        } disabled:opacity-50 border border-neutral-100 dark:border-neutral-800`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            <button
                onClick={() => handleAction("DONE")}
                disabled={isPending}
                className={`h-12 px-6 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${status === "DONE"
                    ? "bg-[#00D261] text-white shadow-green-500/40"
                    : "bg-[#00D261] hover:bg-[#00A64D] text-white shadow-green-500/20"
                    } disabled:opacity-50`}
            >
                <CheckCircle2 className="w-4 h-4" /> {status === "DONE" ? (frequency === "WEEKLY" ? "Done for this week" : "Done for today") : "Mark as Done"}
            </button>
            <button
                onClick={() => handleAction("MISSED")}
                disabled={isPending}
                className={`h-12 px-5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${status === "MISSED"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                    : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                    } disabled:opacity-50`}
            >
                <X className="w-4 h-4" /> {status === "MISSED" ? (frequency === "WEEKLY" ? "Missed this week" : "Missed today") : "Missed"}
            </button>
        </div>
    );
}
